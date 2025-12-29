"""
Business Guardian AI - IoT Sensor Simulator
Simulates physical inventory sensors to detect JD.com-style attacks

Sensors:
1. Weight Sensors - Detect when items are removed from shelves
2. RFID Readers - Track item movements
3. Security Cameras - Visual detection with AI
4. Door Sensors - Monitor warehouse entry/exit points
"""

import json
import os
import sys
import time
import random
from datetime import datetime
from typing import Dict, List
from dataclasses import dataclass, asdict
from dotenv import load_dotenv
from confluent_kafka import Producer

load_dotenv()


@dataclass
class WeightSensorReading:
    """Weight sensor data from shelf monitoring system"""
    sensor_id: str
    location: str
    current_weight_kg: float
    previous_weight_kg: float
    delta_kg: float
    timestamp: int
    anomaly_detected: bool
    expected_items_count: int
    detected_items_count: int


@dataclass
class RFIDReading:
    """RFID reader data for item tracking"""
    reader_id: str
    location: str
    product_id: str
    rfid_tag: str
    event_type: str  # 'detected', 'moved', 'missing'
    signal_strength: int
    timestamp: int


@dataclass
class CameraDetection:
    """Security camera AI detection"""
    camera_id: str
    location: str
    detection_type: str  # 'person', 'product_movement', 'suspicious_activity'
    confidence: float
    object_count: int
    timestamp: int
    alert: bool


class IoTSensorProducer:
    """
    Kafka producer for IoT sensor data
    Streams real-time physical inventory readings
    """

    def __init__(self):
        """Initialize Kafka producer for IoT sensors"""
        # Confluent Cloud configuration
        self.conf = {
            'bootstrap.servers': os.getenv('CONFLUENT_BOOTSTRAP_SERVER'),
            'security.protocol': 'SASL_SSL',
            'sasl.mechanisms': 'PLAIN',
            'sasl.username': os.getenv('CONFLUENT_API_KEY'),
            'sasl.password': os.getenv('CONFLUENT_API_SECRET'),
            'client.id': 'iot-sensor-producer',
            'acks': 'all',
            'compression.type': 'snappy'
        }

        if not all([self.conf['bootstrap.servers'], self.conf['sasl.username'], self.conf['sasl.password']]):
            raise ValueError("Missing Confluent Cloud credentials")

        self.producer = Producer(self.conf)
        self.topic = 'inventory-physical'

        print(f"[OK] IoT Sensor Producer initialized")
        print(f"[>] Topic: {self.topic}")

    def delivery_callback(self, err, msg):
        """Message delivery callback"""
        if err:
            print(f"[ERROR] Delivery failed: {err}")
        else:
            # Only print occasionally to avoid spam
            if random.random() < 0.1:  # 10% of messages
                print(f"[OK] Sensor data -> {msg.topic()} [{msg.partition()}]")

    def send_sensor_data(self, sensor_data: Dict):
        """Send sensor data to Kafka"""
        try:
            self.producer.produce(
                topic=self.topic,
                key=sensor_data.get('sensor_id') or sensor_data.get('reader_id') or sensor_data.get('camera_id'),
                value=json.dumps(sensor_data),
                callback=self.delivery_callback
            )
            self.producer.poll(0)
        except Exception as e:
            print(f"[ERROR] Failed to send: {e}")

    def flush(self):
        """Flush messages"""
        remaining = self.producer.flush(timeout=10)
        if remaining == 0:
            print(f"[OK] All sensor data delivered")

    def close(self):
        """Close producer"""
        self.flush()


class WarehouseSensorSimulator:
    """
    Simulates a complete warehouse sensor network
    Can simulate both normal operations and attack scenarios
    """

    def __init__(self, warehouse_id: str = 'JD-FRANCE-WAREHOUSE-01'):
        """Initialize warehouse sensor simulator"""
        self.warehouse_id = warehouse_id
        self.producer = IoTSensorProducer()

        # Warehouse layout: 10 shelves with sensors
        self.weight_sensors = [
            {'id': f'WEIGHT-A-{i}', 'location': f'Shelf-A-{i}', 'normal_weight': random.uniform(50, 200)}
            for i in range(1, 11)
        ]

        # RFID readers at strategic locations
        self.rfid_readers = [
            {'id': f'RFID-{loc}', 'location': loc}
            for loc in ['Entrance', 'Zone-A', 'Zone-B', 'Packing', 'Exit-Gate']
        ]

        # Security cameras
        self.cameras = [
            {'id': f'CAM-{i}', 'location': f'Zone-{chr(65+i//3)}-View-{i%3}'}
            for i in range(1, 7)
        ]

        # Inventory tracking
        self.inventory = {
            '3C-LAPTOP-001': {'location': 'Shelf-A-5', 'count': 10, 'weight_per_unit': 2.1},
            '3C-PHONE-002': {'location': 'Shelf-A-7', 'count': 50, 'weight_per_unit': 0.2},
            '3C-TABLET-003': {'location': 'Shelf-A-9', 'count': 25, 'weight_per_unit': 0.5},
        }

        print(f"[i] Warehouse: {warehouse_id}")
        print(f"[i] Weight Sensors: {len(self.weight_sensors)}")
        print(f"[i] RFID Readers: {len(self.rfid_readers)}")
        print(f"[i] Cameras: {len(self.cameras)}")
        print()

    def generate_weight_reading(self, sensor: Dict, is_attack: bool = False) -> WeightSensorReading:
        """Generate weight sensor reading"""
        timestamp = int(time.time())
        current_weight = sensor['normal_weight']

        if is_attack:
            # Simulate items being removed (attack)
            delta = -random.uniform(10, 50)  # Large weight drop
            current_weight += delta
            anomaly = abs(delta) > 5
            expected_count = int(sensor['normal_weight'] / 2.1)  # Assume laptop weight
            detected_count = int(current_weight / 2.1)
        else:
            # Normal small fluctuations
            delta = random.uniform(-2, 2)
            current_weight += delta
            anomaly = abs(delta) > 5
            expected_count = detected_count = int(current_weight / 2.1)

        return WeightSensorReading(
            sensor_id=sensor['id'],
            location=sensor['location'],
            current_weight_kg=round(current_weight, 2),
            previous_weight_kg=round(sensor['normal_weight'], 2),
            delta_kg=round(delta, 2),
            timestamp=timestamp,
            anomaly_detected=anomaly,
            expected_items_count=expected_count,
            detected_items_count=detected_count
        )

    def generate_rfid_reading(self, reader: Dict, event_type: str = 'detected') -> RFIDReading:
        """Generate RFID reading"""
        product_id = random.choice(list(self.inventory.keys()))

        return RFIDReading(
            reader_id=reader['id'],
            location=reader['location'],
            product_id=product_id,
            rfid_tag=f'RFID-{product_id}-{random.randint(1000, 9999)}',
            event_type=event_type,
            signal_strength=random.randint(60, 100),
            timestamp=int(time.time())
        )

    def generate_camera_detection(self, camera: Dict, suspicious: bool = False) -> CameraDetection:
        """Generate camera detection event"""
        if suspicious:
            detection_type = 'suspicious_activity'
            confidence = random.uniform(0.7, 0.95)
            alert = True
        else:
            detection_type = random.choice(['person', 'product_movement'])
            confidence = random.uniform(0.6, 0.9)
            alert = False

        return CameraDetection(
            camera_id=camera['id'],
            location=camera['location'],
            detection_type=detection_type,
            confidence=round(confidence, 3),
            object_count=random.randint(1, 5),
            timestamp=int(time.time()),
            alert=alert
        )

    def simulate_normal_operations(self, duration_seconds: int = 10):
        """Simulate normal warehouse operations"""
        print("[SCENARIO] Normal Warehouse Operations")
        print("-" * 70)

        end_time = time.time() + duration_seconds
        event_count = 0

        while time.time() < end_time:
            # Weight sensors (every 2 seconds)
            if event_count % 2 == 0:
                sensor = random.choice(self.weight_sensors)
                reading = self.generate_weight_reading(sensor, is_attack=False)
                self.producer.send_sensor_data({
                    'event_type': 'weight_sensor',
                    **asdict(reading)
                })

            # RFID readings
            reader = random.choice(self.rfid_readers)
            rfid = self.generate_rfid_reading(reader, event_type='detected')
            self.producer.send_sensor_data({
                'event_type': 'rfid_reading',
                **asdict(rfid)
            })

            # Camera detections
            if event_count % 3 == 0:
                camera = random.choice(self.cameras)
                detection = self.generate_camera_detection(camera, suspicious=False)
                self.producer.send_sensor_data({
                    'event_type': 'camera_detection',
                    **asdict(detection)
                })

            event_count += 1
            time.sleep(1)

        print(f"\n[i] Sent {event_count} normal sensor events")

    def simulate_jdcom_attack(self):
        """
        Simulate the JD.com warehouse attack scenario:
        1. Thieves enter warehouse
        2. Change QR codes to mark items as 'shipped'
        3. Remove items from shelves (detected by weight sensors!)
        4. Attempt to exit with stolen goods
        """
        print("\n")
        print("[ATTACK SCENARIO] JD.com Warehouse Robbery Simulation")
        print("-" * 70)

        # Phase 1: Suspicious entry detected
        print("\n[Phase 1] Suspicious individuals detected entering warehouse...")
        camera = self.cameras[0]  # Entrance camera
        detection = self.generate_camera_detection(camera, suspicious=True)
        self.producer.send_sensor_data({
            'event_type': 'camera_detection',
            **asdict(detection)
        })
        print(f"  [ALERT] Camera {camera['id']}: Suspicious activity (confidence: {detection.confidence:.2f})")
        time.sleep(2)

        # Phase 2: RFID tags detected at unusual location
        print("\n[Phase 2] Multiple RFID tags detected near exit gate (unusual pattern)...")
        for _ in range(5):
            reader = next(r for r in self.rfid_readers if 'Exit' in r['location'])
            rfid = self.generate_rfid_reading(reader, event_type='moved')
            self.producer.send_sensor_data({
                'event_type': 'rfid_reading',
                **asdict(rfid)
            })
        print(f"  [WARN] 5 products detected moving toward exit")
        time.sleep(2)

        # Phase 3: CRITICAL - Weight sensors detect mass removal
        print("\n[Phase 3] CRITICAL - Weight sensors detect large inventory removal!")
        affected_sensors = random.sample(self.weight_sensors, 3)
        for sensor in affected_sensors:
            reading = self.generate_weight_reading(sensor, is_attack=True)
            self.producer.send_sensor_data({
                'event_type': 'weight_sensor',
                **asdict(reading)
            })
            print(f"  [CRITICAL] {sensor['id']}: Weight dropped by {abs(reading.delta_kg):.1f} kg!")
            print(f"             Expected: {reading.expected_items_count} items, Detected: {reading.detected_items_count} items")
            print(f"             MISSING: {reading.expected_items_count - reading.detected_items_count} items!")
        time.sleep(2)

        # Phase 4: Exit attempt
        print("\n[Phase 4] Thieves attempting to exit with stolen goods...")
        exit_camera = next(c for c in self.cameras if 'Zone-B' in c['location'])
        detection = self.generate_camera_detection(exit_camera, suspicious=True)
        self.producer.send_sensor_data({
            'event_type': 'camera_detection',
            **asdict(detection)
        })
        print(f"  [ALERT] Exit camera: {detection.object_count} people detected with items")
        time.sleep(1)

        print("\n[ALERT] JD.com attack simulation complete!")
        print("[i] Physical sensors detected the attack in real-time")
        print("[i] This data will be correlated with QR scan data to trigger alerts")

    def close(self):
        """Close simulator"""
        self.producer.close()


def main():
    """Main simulation function"""
    print("[*] Business Guardian AI - IoT Sensor Simulator")
    print("=" * 70)
    print()

    try:
        # Initialize simulator
        simulator = WarehouseSensorSimulator()

        # Run normal operations for 10 seconds
        simulator.simulate_normal_operations(duration_seconds=10)

        # Simulate JD.com attack
        simulator.simulate_jdcom_attack()

        # Final flush
        print("\n[*] Flushing sensor data to Kafka...")
        simulator.close()

        print("\n" + "=" * 70)
        print("[SUCCESS] IoT sensor simulation complete!")
        print("[i] Check 'inventory-physical' topic in Confluent Cloud")
        print()

    except KeyboardInterrupt:
        print("\n\n[WARN] Interrupted by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
