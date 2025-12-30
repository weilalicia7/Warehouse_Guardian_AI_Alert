"""
Business Guardian AI - QR Code Cryptographic Verification System
Prevents sophisticated warehouse fraud attacks where thieves modify QR codes to bypass security

This module implements:
1. Tamper-proof QR code generation with HMAC-SHA256
2. Real-time verification to detect fake/modified codes
3. Kafka event streaming for all scan attempts
"""

import hashlib
import hmac
import json
import time
import uuid
from datetime import datetime
from typing import Dict, Optional, Tuple
from dataclasses import dataclass, asdict
import os
from dotenv import load_dotenv

load_dotenv()

# Secret key for cryptographic operations (from environment)
QR_SECRET_KEY = os.getenv('QR_SECRET_KEY', 'default-secret-key-change-in-production')


@dataclass
class Product:
    """Product information for QR code"""
    product_id: str
    name: str
    category: str
    value: float
    warehouse_location: str


@dataclass
class QRCodeData:
    """Complete QR code data structure"""
    qr_id: str
    product: Product
    timestamp: int
    warehouse_id: str
    shipment_id: Optional[str]
    status: str  # 'in_warehouse', 'ready_for_shipment', 'shipped'
    signature: str  # HMAC signature


@dataclass
class VerificationResult:
    """Result of QR code verification"""
    qr_id: str
    is_valid: bool
    threat_level: str  # 'none', 'low', 'medium', 'high', 'critical'
    reason: str
    timestamp: int
    scan_location: str
    product_info: Dict
    fraud_indicators: list


class QRCodeVerifier:
    """
    Cryptographic QR Code Verification System

    Prevents attacks like the €37M Paris warehouse fraud where
    thieves changed QR codes to mark items as 'shipped'
    """

    def __init__(self, secret_key: str = QR_SECRET_KEY):
        """Initialize verifier with secret key"""
        self.secret_key = secret_key.encode('utf-8')

    def generate_qr_code(
        self,
        product: Product,
        warehouse_id: str,
        shipment_id: Optional[str] = None,
        status: str = 'in_warehouse'
    ) -> QRCodeData:
        """
        Generate a cryptographically secure QR code

        Args:
            product: Product information
            warehouse_id: Warehouse identifier
            shipment_id: Optional shipment ID
            status: Current status of the product

        Returns:
            QRCodeData with cryptographic signature
        """
        qr_id = str(uuid.uuid4())
        timestamp = int(time.time())

        # Create payload for signing
        payload = {
            'qr_id': qr_id,
            'product_id': product.product_id,
            'timestamp': timestamp,
            'warehouse_id': warehouse_id,
            'shipment_id': shipment_id,
            'status': status
        }

        # Generate HMAC-SHA256 signature
        signature = self._generate_signature(payload)

        # Create QR code data
        qr_data = QRCodeData(
            qr_id=qr_id,
            product=product,
            timestamp=timestamp,
            warehouse_id=warehouse_id,
            shipment_id=shipment_id,
            status=status,
            signature=signature
        )

        return qr_data

    def verify_qr_code(
        self,
        qr_data: QRCodeData,
        scan_location: str,
        expected_status: Optional[str] = None
    ) -> VerificationResult:
        """
        Verify a QR code for authenticity and detect tampering

        Args:
            qr_data: QR code data to verify
            scan_location: Location where QR code was scanned
            expected_status: Expected status of the product (optional)

        Returns:
            VerificationResult with fraud detection analysis
        """
        timestamp = int(time.time())
        fraud_indicators = []
        threat_level = 'none'
        is_valid = True
        reason = 'QR code is valid'

        # 1. Verify cryptographic signature
        payload = {
            'qr_id': qr_data.qr_id,
            'product_id': qr_data.product.product_id,
            'timestamp': qr_data.timestamp,
            'warehouse_id': qr_data.warehouse_id,
            'shipment_id': qr_data.shipment_id,
            'status': qr_data.status
        }

        expected_signature = self._generate_signature(payload)

        if qr_data.signature != expected_signature:
            is_valid = False
            threat_level = 'critical'
            reason = 'SIGNATURE MISMATCH - QR code has been tampered with!'
            fraud_indicators.append({
                'type': 'signature_mismatch',
                'severity': 'critical',
                'description': 'QR code signature does not match - likely tampered by attacker'
            })

        # 2. Check for timestamp anomalies
        age_seconds = timestamp - qr_data.timestamp
        if age_seconds < 0:
            fraud_indicators.append({
                'type': 'future_timestamp',
                'severity': 'critical',
                'description': 'QR code timestamp is in the future - possible forgery'
            })
            threat_level = 'critical'
            is_valid = False
        elif age_seconds > 90 * 24 * 3600:  # 90 days
            fraud_indicators.append({
                'type': 'expired_code',
                'severity': 'medium',
                'description': 'QR code is older than 90 days'
            })
            if threat_level == 'none':
                threat_level = 'medium'

        # 3. Detect warehouse fraud attack: Status manipulation
        if qr_data.status == 'shipped' and expected_status != 'shipped':
            fraud_indicators.append({
                'type': 'status_manipulation',
                'severity': 'critical',
                'description': 'Product marked as SHIPPED but should not be - warehouse fraud attack pattern detected!',
                'attack_type': 'qr_code_substitution'
            })
            threat_level = 'critical'
            is_valid = False
            reason = 'FRAUD ATTACK DETECTED - Product falsely marked as shipped!'

        # 4. Location verification
        if scan_location == 'exit_gate' and qr_data.status == 'in_warehouse':
            fraud_indicators.append({
                'type': 'unauthorized_exit',
                'severity': 'high',
                'description': 'Product scanned at exit but still marked as in warehouse'
            })
            if threat_level not in ['critical']:
                threat_level = 'high'

        # 5. Check for duplicate shipment IDs
        if qr_data.shipment_id and qr_data.status != 'shipped' and qr_data.status != 'ready_for_shipment':
            fraud_indicators.append({
                'type': 'shipment_id_mismatch',
                'severity': 'high',
                'description': 'Product has shipment ID but status is not shipped/ready'
            })
            if threat_level == 'none':
                threat_level = 'high'

        # Set final reason
        if fraud_indicators:
            reason = f"Detected {len(fraud_indicators)} fraud indicator(s)"

        return VerificationResult(
            qr_id=qr_data.qr_id,
            is_valid=is_valid,
            threat_level=threat_level,
            reason=reason,
            timestamp=timestamp,
            scan_location=scan_location,
            product_info=asdict(qr_data.product),
            fraud_indicators=fraud_indicators
        )

    def _generate_signature(self, payload: Dict) -> str:
        """
        Generate HMAC-SHA256 signature for payload

        Args:
            payload: Data to sign

        Returns:
            Hexadecimal signature string
        """
        # Convert payload to deterministic JSON string
        payload_str = json.dumps(payload, sort_keys=True)

        # Generate HMAC-SHA256
        signature = hmac.new(
            self.secret_key,
            payload_str.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        return signature

    def encode_qr_string(self, qr_data: QRCodeData) -> str:
        """
        Encode QR code data as string for QR code generation

        Args:
            qr_data: QR code data object

        Returns:
            JSON string to encode in QR code
        """
        data = {
            'qr_id': qr_data.qr_id,
            'product': asdict(qr_data.product),
            'timestamp': qr_data.timestamp,
            'warehouse_id': qr_data.warehouse_id,
            'shipment_id': qr_data.shipment_id,
            'status': qr_data.status,
            'signature': qr_data.signature
        }
        return json.dumps(data)

    def decode_qr_string(self, qr_string: str) -> QRCodeData:
        """
        Decode QR code string back to QRCodeData object

        Args:
            qr_string: JSON string from QR code

        Returns:
            QRCodeData object
        """
        data = json.loads(qr_string)

        product = Product(**data['product'])

        qr_data = QRCodeData(
            qr_id=data['qr_id'],
            product=product,
            timestamp=data['timestamp'],
            warehouse_id=data['warehouse_id'],
            shipment_id=data['shipment_id'],
            status=data['status'],
            signature=data['signature']
        )

        return qr_data


def create_kafka_event(verification_result: VerificationResult) -> Dict:
    """
    Convert verification result to Kafka event format

    Args:
        verification_result: Result of QR code verification

    Returns:
        Dictionary ready for Kafka publishing
    """
    event = {
        'event_type': 'qr_code_scan',
        'timestamp': verification_result.timestamp,
        'qr_id': verification_result.qr_id,
        'is_valid': verification_result.is_valid,
        'threat_level': verification_result.threat_level,
        'reason': verification_result.reason,
        'scan_location': verification_result.scan_location,
        'product_info': verification_result.product_info,
        'fraud_indicators': verification_result.fraud_indicators,
        'alert': verification_result.threat_level in ['high', 'critical']
    }

    return event


# Example usage and testing
if __name__ == '__main__':
    print("[*] Business Guardian AI - QR Code Verification System")
    print("=" * 70)
    print()

    # Initialize verifier
    verifier = QRCodeVerifier()

    # Create a product
    product = Product(
        product_id='3C-LAPTOP-001',
        name='Dell XPS 15 Laptop',
        category='3C Electronics',
        value=1299.99,
        warehouse_location='A-12-5'
    )

    print("[+] Generating legitimate QR code...")
    legit_qr = verifier.generate_qr_code(
        product=product,
        warehouse_id='JD-FRANCE-WAREHOUSE-01',
        status='in_warehouse'
    )
    print(f"    QR ID: {legit_qr.qr_id}")
    print(f"    Status: {legit_qr.status}")
    print(f"    Signature: {legit_qr.signature[:32]}...")
    print()

    # Test 1: Verify legitimate QR code
    print("[TEST 1] Verifying legitimate QR code...")
    result1 = verifier.verify_qr_code(legit_qr, scan_location='warehouse_scanner')
    print(f"    Valid: {result1.is_valid}")
    print(f"    Threat Level: {result1.threat_level}")
    print(f"    Reason: {result1.reason}")
    print()

    # Test 2: Simulate warehouse fraud attack - attacker changes status to 'shipped'
    print("[TEST 2] Simulating warehouse fraud attack - changing status to 'shipped'...")
    fake_qr = QRCodeData(
        qr_id=legit_qr.qr_id,
        product=legit_qr.product,
        timestamp=legit_qr.timestamp,
        warehouse_id=legit_qr.warehouse_id,
        shipment_id='FAKE-SHIPMENT-123',
        status='shipped',  # ATTACKER CHANGED THIS!
        signature=legit_qr.signature  # Old signature won't match
    )

    result2 = verifier.verify_qr_code(fake_qr, scan_location='exit_gate')
    print(f"    Valid: {result2.is_valid}")
    print(f"    Threat Level: {result2.threat_level}")
    print(f"    Reason: {result2.reason}")
    print(f"    Fraud Indicators: {len(result2.fraud_indicators)}")
    for indicator in result2.fraud_indicators:
        print(f"      - [{indicator['severity'].upper()}] {indicator['description']}")
    print()

    # Create Kafka event
    print("[+] Creating Kafka event for alert...")
    kafka_event = create_kafka_event(result2)
    print(f"    Event Type: {kafka_event['event_type']}")
    print(f"    Alert: {kafka_event['alert']}")
    print(f"    Threat Level: {kafka_event['threat_level']}")
    print()

    print("=" * 70)
    print("[SUCCESS] QR Code verification system is working!")
    print("[i] This system prevents sophisticated warehouse fraud attacks by detecting tampering")
