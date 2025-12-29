"""
Business Guardian AI - Real-Time ML Prediction Service
Consumes events from Kafka, predicts fraud probability, publishes to ml-predictions topic
"""

import os
import sys
import json
import time
from typing import Dict
from dotenv import load_dotenv
from confluent_kafka import Consumer, Producer, KafkaError

# Add parent directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from ml.fraud_detection_model import FraudDetectionModel

load_dotenv()


class MLPredictionService:
    """
    Real-time ML prediction service

    Architecture:
    1. Consume from qr-code-scans, inventory-physical, inventory-digital
    2. Extract features from events
    3. Run ML model prediction
    4. Publish predictions to ml-predictions topic
    """

    def __init__(self):
        """Initialize ML prediction service"""
        # Load ML model
        print("[*] Loading ML model...")
        self.model = FraudDetectionModel()
        self.model.load('backend/ml/models')
        print("[OK] ML model loaded")

        # Kafka configuration
        conf = {
            'bootstrap.servers': os.getenv('CONFLUENT_BOOTSTRAP_SERVER'),
            'security.protocol': 'SASL_SSL',
            'sasl.mechanisms': 'PLAIN',
            'sasl.username': os.getenv('CONFLUENT_API_KEY'),
            'sasl.password': os.getenv('CONFLUENT_API_SECRET'),
        }

        # Consumer configuration
        consumer_conf = {
            **conf,
            'group.id': 'ml-prediction-service',
            'auto.offset.reset': 'latest',  # Start from latest for real-time
            'enable.auto.commit': True,
        }

        # Producer configuration
        producer_conf = {
            **conf,
            'client.id': 'ml-prediction-producer',
            'acks': 'all',
            'compression.type': 'snappy'
        }

        self.consumer = Consumer(consumer_conf)
        self.producer = Producer(producer_conf)

        # Subscribe to input topics
        self.consumer.subscribe([
            'qr-code-scans',
            'inventory-physical',
            'inventory-digital'
        ])

        print("[OK] ML Prediction Service initialized")
        print("[>] Subscribed to: qr-code-scans, inventory-physical, inventory-digital")
        print("[>] Publishing to: ml-predictions")
        print()

        # Event aggregation buffer (to combine multiple events)
        self.event_buffer = {}

    def extract_features(self, event: Dict, event_type: str) -> Dict:
        """
        Extract ML features from Kafka event

        Args:
            event: Kafka event data
            event_type: Type of event (qr_scan, sensor, inventory)

        Returns:
            Dictionary of features for ML model
        """
        features = {
            # Default values
            'qr_signature_valid': 1,
            'qr_age_hours': 24.0,
            'qr_scan_location_risk': 0.5,
            'weight_delta_kg': 0.0,
            'weight_anomaly': 0,
            'items_missing_count': 0,
            'rfid_signal_strength': 80.0,
            'camera_confidence': 0.7,
            'camera_alert': 0,
            'quantity_change': 0,
            'transaction_velocity': 5.0,
            'user_risk_score': 0.3,
            'product_value': 1000.0,
            'product_category_risk': 0.5,
            'hour_of_day': 12,
            'day_of_week': 3,
            'is_weekend': 0,
            'is_night_shift': 0,
            'physical_digital_mismatch': 0.0,
            'qr_sensor_correlation': 0.8
        }

        # Extract from QR code scan events
        if event_type == 'qr_scan':
            features['qr_signature_valid'] = 1 if event.get('is_valid', True) else 0

            # Map threat level to location risk
            threat_level = event.get('threat_level', 'none')
            risk_map = {'critical': 1.0, 'high': 0.8, 'medium': 0.5, 'low': 0.3, 'none': 0.1}
            features['qr_scan_location_risk'] = risk_map.get(threat_level, 0.5)

            # Product info
            if 'product_info' in event:
                features['product_value'] = event['product_info'].get('value', 1000.0)
                category = event['product_info'].get('category', '')
                features['product_category_risk'] = 0.9 if '3C' in category else 0.5

        # Extract from physical sensor events
        elif event_type == 'sensor':
            sensor_type = event.get('event_type', '')

            if sensor_type == 'weight_sensor':
                features['weight_delta_kg'] = event.get('delta_kg', 0.0)
                features['weight_anomaly'] = 1 if event.get('anomaly_detected', False) else 0
                expected = event.get('expected_items_count', 0)
                detected = event.get('detected_items_count', 0)
                features['items_missing_count'] = max(0, expected - detected)

            elif sensor_type == 'rfid_reading':
                features['rfid_signal_strength'] = event.get('signal_strength', 80.0)

            elif sensor_type == 'camera_detection':
                features['camera_confidence'] = event.get('confidence', 0.7)
                features['camera_alert'] = 1 if event.get('alert', False) else 0

        # Extract from digital inventory events
        elif event_type == 'inventory':
            features['quantity_change'] = event.get('quantity_change', 0)

            # User risk score based on user ID
            user_id = event.get('user_id', 'system')
            if 'COMPROMISED' in user_id or 'UNKNOWN' in user_id:
                features['user_risk_score'] = 0.95
            elif user_id == 'system':
                features['user_risk_score'] = 0.1
            else:
                features['user_risk_score'] = 0.3

        # Time-based features
        from datetime import datetime
        timestamp = event.get('timestamp', int(time.time()))
        dt = datetime.fromtimestamp(timestamp)
        features['hour_of_day'] = dt.hour
        features['day_of_week'] = dt.weekday()
        features['is_weekend'] = 1 if dt.weekday() >= 5 else 0
        features['is_night_shift'] = 1 if dt.hour < 6 or dt.hour >= 22 else 0

        # Correlation features (would be computed from multiple events in production)
        if features['weight_anomaly'] == 1 and features['qr_signature_valid'] == 0:
            features['physical_digital_mismatch'] = abs(features['weight_delta_kg']) * 2
            features['qr_sensor_correlation'] = 0.1
        else:
            features['physical_digital_mismatch'] = 2.0
            features['qr_sensor_correlation'] = 0.9

        return features

    def predict(self, features: Dict) -> Dict:
        """
        Run ML prediction

        Returns:
            Prediction result with probability and risk score
        """
        prediction, probability = self.model.predict(features)

        return {
            'prediction': 'fraud' if prediction == 1 else 'legitimate',
            'fraud_probability': probability,
            'risk_score': probability * 100,  # 0-100 scale
            'confidence': abs(probability - 0.5) * 2,  # How confident (0-1)
            'features_used': features
        }

    def publish_prediction(self, prediction_result: Dict):
        """Publish ML prediction to Kafka"""
        try:
            # Add metadata
            prediction_result['timestamp'] = int(time.time())
            prediction_result['model_version'] = '1.0.0'
            prediction_result['service'] = 'ml-prediction-service'

            # Publish to ml-predictions topic
            self.producer.produce(
                topic='ml-predictions',
                key=str(prediction_result['timestamp']),
                value=json.dumps(prediction_result)
            )

            self.producer.poll(0)

            # Log if fraud detected
            if prediction_result['prediction'] == 'fraud':
                print(f"[FRAUD ALERT] Probability: {prediction_result['fraud_probability']:.2%}, "
                      f"Risk Score: {prediction_result['risk_score']:.1f}/100")

        except Exception as e:
            print(f"[ERROR] Failed to publish prediction: {e}")

    def process_event(self, msg):
        """Process incoming Kafka event"""
        try:
            # Parse event
            event = json.loads(msg.value().decode('utf-8'))
            topic = msg.topic()

            # Determine event type
            if topic == 'qr-code-scans':
                event_type = 'qr_scan'
            elif topic == 'inventory-physical':
                event_type = 'sensor'
            else:  # inventory-digital
                event_type = 'inventory'

            # Extract features
            features = self.extract_features(event, event_type)

            # Run prediction
            prediction_result = self.predict(features)

            # Publish if fraud probability > 50%
            if prediction_result['fraud_probability'] > 0.5:
                self.publish_prediction(prediction_result)

        except Exception as e:
            print(f"[ERROR] Failed to process event: {e}")

    def run(self):
        """Start consuming and predicting"""
        print("[*] ML Prediction Service running...")
        print("[i] Waiting for events...")
        print()

        try:
            event_count = 0

            while True:
                msg = self.consumer.poll(1.0)

                if msg is None:
                    continue

                if msg.error():
                    if msg.error().code() == KafkaError._PARTITION_EOF:
                        continue
                    else:
                        print(f"[ERROR] Consumer error: {msg.error()}")
                        continue

                # Process event
                self.process_event(msg)

                event_count += 1
                if event_count % 10 == 0:
                    print(f"[i] Processed {event_count} events...")

        except KeyboardInterrupt:
            print("\n[WARN] Service interrupted by user")
        finally:
            self.consumer.close()
            self.producer.flush()
            print("[i] ML Prediction Service stopped")


def main():
    """Main entry point"""
    print("[*] Business Guardian AI - ML Prediction Service")
    print("=" * 70)
    print()

    try:
        service = MLPredictionService()
        service.run()
    except Exception as e:
        print(f"\n[ERROR] Service failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
