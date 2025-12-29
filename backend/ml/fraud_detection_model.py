"""
Business Guardian AI - Fraud Detection ML Model
Uses Vertex AI to train and deploy a fraud prediction model

Features:
- QR code validity patterns
- Physical-digital inventory discrepancies
- User behavior patterns
- Time-based anomalies
- Product value and category
"""

import os
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
from dataclasses import dataclass
from dotenv import load_dotenv

# Google Cloud imports
from google.cloud import aiplatform
from google.cloud import bigquery
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import joblib

load_dotenv()


@dataclass
class FraudFeatures:
    """Features for fraud detection ML model"""
    # QR Code features
    qr_signature_valid: int  # 0 or 1
    qr_age_hours: float
    qr_scan_location_risk: float  # 0-1 score based on location

    # Physical inventory features
    weight_delta_kg: float
    weight_anomaly: int  # 0 or 1
    items_missing_count: int
    rfid_signal_strength: float
    camera_confidence: float
    camera_alert: int  # 0 or 1

    # Digital inventory features
    quantity_change: int
    transaction_velocity: float  # transactions per hour
    user_risk_score: float  # 0-1 based on user history

    # Product features
    product_value: float
    product_category_risk: float  # 0-1, 3C electronics = high

    # Temporal features
    hour_of_day: int  # 0-23
    day_of_week: int  # 0-6
    is_weekend: int  # 0 or 1
    is_night_shift: int  # 0 or 1

    # Correlation features
    physical_digital_mismatch: float  # Difference between physical and digital
    qr_sensor_correlation: float  # How well QR scan matches sensor data

    # Label
    is_fraud: int  # 0 or 1


class FraudDataGenerator:
    """Generate synthetic training data for fraud detection"""

    def __init__(self, num_samples: int = 10000):
        self.num_samples = num_samples

    def generate_legitimate_sample(self) -> FraudFeatures:
        """Generate a legitimate (non-fraud) sample"""
        return FraudFeatures(
            qr_signature_valid=1,
            qr_age_hours=np.random.uniform(0, 72),
            qr_scan_location_risk=np.random.uniform(0, 0.3),
            weight_delta_kg=np.random.normal(0, 2),
            weight_anomaly=0,
            items_missing_count=0,
            rfid_signal_strength=np.random.uniform(70, 100),
            camera_confidence=np.random.uniform(0.6, 0.9),
            camera_alert=0,
            quantity_change=np.random.randint(-5, 5),
            transaction_velocity=np.random.uniform(0, 10),
            user_risk_score=np.random.uniform(0, 0.3),
            product_value=np.random.uniform(100, 2000),
            product_category_risk=np.random.uniform(0.3, 0.8),
            hour_of_day=np.random.randint(6, 22),
            day_of_week=np.random.randint(0, 5),
            is_weekend=0,
            is_night_shift=0,
            physical_digital_mismatch=np.random.normal(0, 2),
            qr_sensor_correlation=np.random.uniform(0.7, 1.0),
            is_fraud=0
        )

    def generate_fraud_sample(self) -> FraudFeatures:
        """Generate a fraudulent sample (JD.com attack pattern)"""
        fraud_type = np.random.choice(['qr_tampering', 'inventory_theft', 'insider'])

        if fraud_type == 'qr_tampering':
            # QR code modification attack
            return FraudFeatures(
                qr_signature_valid=0,  # Invalid signature!
                qr_age_hours=np.random.uniform(0, 10),
                qr_scan_location_risk=np.random.uniform(0.7, 1.0),
                weight_delta_kg=np.random.uniform(-50, -10),
                weight_anomaly=1,
                items_missing_count=np.random.randint(5, 50),
                rfid_signal_strength=np.random.uniform(40, 70),
                camera_confidence=np.random.uniform(0.7, 0.95),
                camera_alert=1,
                quantity_change=np.random.randint(-30, -5),
                transaction_velocity=np.random.uniform(15, 50),
                user_risk_score=np.random.uniform(0.7, 1.0),
                product_value=np.random.uniform(500, 3000),
                product_category_risk=np.random.uniform(0.8, 1.0),
                hour_of_day=np.random.choice([2, 3, 4, 22, 23]),
                day_of_week=np.random.randint(0, 7),
                is_weekend=np.random.choice([0, 1]),
                is_night_shift=1,
                physical_digital_mismatch=np.random.uniform(10, 50),
                qr_sensor_correlation=np.random.uniform(0, 0.3),
                is_fraud=1
            )

        elif fraud_type == 'inventory_theft':
            # Physical theft with sensor detection
            return FraudFeatures(
                qr_signature_valid=np.random.choice([0, 1]),
                qr_age_hours=np.random.uniform(0, 24),
                qr_scan_location_risk=np.random.uniform(0.6, 1.0),
                weight_delta_kg=np.random.uniform(-60, -15),
                weight_anomaly=1,
                items_missing_count=np.random.randint(10, 60),
                rfid_signal_strength=np.random.uniform(30, 60),
                camera_confidence=np.random.uniform(0.75, 0.98),
                camera_alert=1,
                quantity_change=np.random.randint(-40, -10),
                transaction_velocity=np.random.uniform(20, 60),
                user_risk_score=np.random.uniform(0.6, 0.95),
                product_value=np.random.uniform(800, 5000),
                product_category_risk=np.random.uniform(0.7, 1.0),
                hour_of_day=np.random.choice([1, 2, 3, 4, 23]),
                day_of_week=np.random.randint(0, 7),
                is_weekend=np.random.choice([0, 1]),
                is_night_shift=1,
                physical_digital_mismatch=np.random.uniform(15, 60),
                qr_sensor_correlation=np.random.uniform(0, 0.4),
                is_fraud=1
            )

        else:  # insider
            # Insider fraud with compromised account
            return FraudFeatures(
                qr_signature_valid=1,  # Valid QR but fraudulent intent
                qr_age_hours=np.random.uniform(0, 48),
                qr_scan_location_risk=np.random.uniform(0.4, 0.8),
                weight_delta_kg=np.random.uniform(-30, -5),
                weight_anomaly=0,
                items_missing_count=np.random.randint(3, 20),
                rfid_signal_strength=np.random.uniform(60, 90),
                camera_confidence=np.random.uniform(0.5, 0.8),
                camera_alert=0,
                quantity_change=np.random.randint(-25, -5),
                transaction_velocity=np.random.uniform(25, 70),
                user_risk_score=np.random.uniform(0.8, 1.0),
                product_value=np.random.uniform(600, 2500),
                product_category_risk=np.random.uniform(0.6, 0.9),
                hour_of_day=np.random.randint(0, 24),
                day_of_week=np.random.randint(0, 7),
                is_weekend=np.random.choice([0, 1]),
                is_night_shift=np.random.choice([0, 1]),
                physical_digital_mismatch=np.random.uniform(5, 25),
                qr_sensor_correlation=np.random.uniform(0.3, 0.7),
                is_fraud=1
            )

    def generate_dataset(self) -> pd.DataFrame:
        """Generate complete training dataset"""
        print(f"[*] Generating {self.num_samples} training samples...")

        samples = []

        # 80% legitimate, 20% fraud (realistic distribution)
        num_fraud = int(self.num_samples * 0.2)
        num_legitimate = self.num_samples - num_fraud

        print(f"[i] Legitimate samples: {num_legitimate}")
        print(f"[i] Fraud samples: {num_fraud}")

        for _ in range(num_legitimate):
            samples.append(self.generate_legitimate_sample().__dict__)

        for _ in range(num_fraud):
            samples.append(self.generate_fraud_sample().__dict__)

        df = pd.DataFrame(samples)

        # Shuffle
        df = df.sample(frac=1).reset_index(drop=True)

        print(f"[OK] Dataset generated: {df.shape}")
        print(f"[i] Fraud rate: {df['is_fraud'].mean():.2%}")

        return df


class FraudDetectionModel:
    """ML model for fraud prediction"""

    def __init__(self, project_id: str = None):
        self.project_id = project_id or os.getenv('GOOGLE_CLOUD_PROJECT')
        self.model = None
        self.scaler = StandardScaler()
        self.feature_names = None

    def train(self, df: pd.DataFrame):
        """Train fraud detection model"""
        print("\n[*] Training fraud detection model...")

        # Separate features and labels
        X = df.drop('is_fraud', axis=1)
        y = df['is_fraud']

        self.feature_names = X.columns.tolist()

        # Train-test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        print(f"[i] Training set: {X_train.shape}")
        print(f"[i] Test set: {X_test.shape}")

        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        # Train Gradient Boosting model (best for fraud detection)
        print("[i] Training Gradient Boosting Classifier...")
        self.model = GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            random_state=42,
            verbose=1
        )

        self.model.fit(X_train_scaled, y_train)

        # Evaluate
        y_pred = self.model.predict(X_test_scaled)
        y_pred_proba = self.model.predict_proba(X_test_scaled)[:, 1]

        print("\n[*] Model Evaluation")
        print("=" * 60)
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred, target_names=['Legitimate', 'Fraud']))

        print("\nConfusion Matrix:")
        print(confusion_matrix(y_test, y_pred))

        auc = roc_auc_score(y_test, y_pred_proba)
        print(f"\nROC-AUC Score: {auc:.4f}")

        # Feature importance
        feature_importance = pd.DataFrame({
            'feature': self.feature_names,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)

        print("\nTop 10 Most Important Features:")
        print(feature_importance.head(10).to_string(index=False))

        print("\n[OK] Model training complete!")

        return auc

    def predict(self, features: Dict) -> Tuple[int, float]:
        """
        Predict fraud probability

        Returns:
            (prediction, probability) - (0 or 1, 0.0-1.0)
        """
        if self.model is None:
            raise ValueError("Model not trained yet")

        # Convert features dict to DataFrame
        df = pd.DataFrame([features])

        # Ensure all features are present
        for feat in self.feature_names:
            if feat not in df.columns:
                df[feat] = 0

        df = df[self.feature_names]

        # Scale
        X_scaled = self.scaler.transform(df)

        # Predict
        prediction = self.model.predict(X_scaled)[0]
        probability = self.model.predict_proba(X_scaled)[0, 1]

        return int(prediction), float(probability)

    def save(self, path: str = 'backend/ml/models'):
        """Save model and scaler"""
        os.makedirs(path, exist_ok=True)

        model_path = os.path.join(path, 'fraud_model.joblib')
        scaler_path = os.path.join(path, 'scaler.joblib')
        features_path = os.path.join(path, 'features.json')

        joblib.dump(self.model, model_path)
        joblib.dump(self.scaler, scaler_path)

        with open(features_path, 'w') as f:
            json.dump({'features': self.feature_names}, f)

        print(f"\n[OK] Model saved to {path}")
        print(f"  - {model_path}")
        print(f"  - {scaler_path}")
        print(f"  - {features_path}")

    def load(self, path: str = 'backend/ml/models'):
        """Load model and scaler"""
        model_path = os.path.join(path, 'fraud_model.joblib')
        scaler_path = os.path.join(path, 'scaler.joblib')
        features_path = os.path.join(path, 'features.json')

        self.model = joblib.load(model_path)
        self.scaler = joblib.load(scaler_path)

        with open(features_path, 'r') as f:
            self.feature_names = json.load(f)['features']

        print(f"[OK] Model loaded from {path}")


def main():
    """Train and save the fraud detection model"""
    print("[*] Business Guardian AI - ML Model Training")
    print("=" * 70)
    print()

    # Generate training data
    generator = FraudDataGenerator(num_samples=10000)
    df = generator.generate_dataset()

    # Save dataset
    df.to_csv('backend/ml/data/fraud_training_data.csv', index=False)
    print(f"\n[OK] Training data saved to backend/ml/data/fraud_training_data.csv")

    # Train model
    model = FraudDetectionModel()
    auc = model.train(df)

    # Save model
    model.save()

    # Test prediction
    print("\n" + "=" * 70)
    print("[*] Testing Predictions")
    print("=" * 70)

    # Test case 1: Legitimate transaction
    test_legit = {
        'qr_signature_valid': 1,
        'qr_age_hours': 24.0,
        'qr_scan_location_risk': 0.2,
        'weight_delta_kg': 1.5,
        'weight_anomaly': 0,
        'items_missing_count': 0,
        'rfid_signal_strength': 85.0,
        'camera_confidence': 0.75,
        'camera_alert': 0,
        'quantity_change': -2,
        'transaction_velocity': 5.0,
        'user_risk_score': 0.1,
        'product_value': 1200.0,
        'product_category_risk': 0.5,
        'hour_of_day': 14,
        'day_of_week': 2,
        'is_weekend': 0,
        'is_night_shift': 0,
        'physical_digital_mismatch': 1.0,
        'qr_sensor_correlation': 0.95
    }

    pred, prob = model.predict(test_legit)
    print(f"\n[TEST 1] Legitimate transaction")
    print(f"  Prediction: {'FRAUD' if pred == 1 else 'LEGITIMATE'}")
    print(f"  Fraud probability: {prob:.2%}")

    # Test case 2: JD.com attack
    test_fraud = {
        'qr_signature_valid': 0,  # TAMPERED!
        'qr_age_hours': 2.0,
        'qr_scan_location_risk': 0.9,
        'weight_delta_kg': -45.0,  # MASSIVE DROP!
        'weight_anomaly': 1,
        'items_missing_count': 30,  # MANY ITEMS MISSING!
        'rfid_signal_strength': 45.0,
        'camera_confidence': 0.88,
        'camera_alert': 1,
        'quantity_change': -25,
        'transaction_velocity': 40.0,
        'user_risk_score': 0.95,  # SUSPICIOUS USER!
        'product_value': 1500.0,
        'product_category_risk': 0.9,
        'hour_of_day': 3,  # NIGHT TIME!
        'day_of_week': 6,
        'is_weekend': 1,
        'is_night_shift': 1,
        'physical_digital_mismatch': 35.0,  # BIG MISMATCH!
        'qr_sensor_correlation': 0.15
    }

    pred, prob = model.predict(test_fraud)
    print(f"\n[TEST 2] JD.com Attack Scenario")
    print(f"  Prediction: {'FRAUD' if pred == 1 else 'LEGITIMATE'}")
    print(f"  Fraud probability: {prob:.2%}")

    print("\n" + "=" * 70)
    print(f"[SUCCESS] Model training complete! ROC-AUC: {auc:.4f}")
    print("[i] Model ready for deployment to Vertex AI")
    print()


if __name__ == '__main__':
    main()
