"""
Business Guardian AI - QR Code Scan Event Producer
Streams QR code verification events to Confluent Cloud Kafka
"""

import json
import os
import sys
import time
from typing import Dict
from dotenv import load_dotenv
from confluent_kafka import Producer
from confluent_kafka.admin import AdminClient

# Add parent directory to path to import qr_verification
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
from core.qr_verification import QRCodeVerifier, Product, create_kafka_event

load_dotenv()


class QRScanProducer:
    """
    Kafka producer for QR code scan events
    Sends verification results to 'qr-code-scans' topic
    """

    def __init__(self):
        """Initialize Kafka producer"""
        # Confluent Cloud configuration
        self.conf = {
            'bootstrap.servers': os.getenv('CONFLUENT_BOOTSTRAP_SERVER'),
            'security.protocol': 'SASL_SSL',
            'sasl.mechanisms': 'PLAIN',
            'sasl.username': os.getenv('CONFLUENT_API_KEY'),
            'sasl.password': os.getenv('CONFLUENT_API_SECRET'),
            # Producer-specific configs
            'client.id': 'qr-scan-producer',
            'acks': 'all',  # Wait for all replicas to acknowledge
            'retries': 3,
            'compression.type': 'snappy'
        }

        # Validate configuration
        if not all([self.conf['bootstrap.servers'], self.conf['sasl.username'], self.conf['sasl.password']]):
            raise ValueError("Missing Confluent Cloud credentials in .env file")

        # Create producer
        self.producer = Producer(self.conf)
        self.topic = 'qr-code-scans'

        print(f"[OK] QR Scan Producer initialized")
        print(f"[>] Connected to: {self.conf['bootstrap.servers']}")
        print(f"[>] Topic: {self.topic}")
        print()

    def delivery_callback(self, err, msg):
        """Callback for message delivery reports"""
        if err:
            print(f"[ERROR] Message delivery failed: {err}")
        else:
            print(f"[OK] Message delivered to {msg.topic()} [{msg.partition()}] @ offset {msg.offset()}")

    def send_scan_event(self, event: Dict):
        """
        Send QR code scan event to Kafka

        Args:
            event: Scan event dictionary
        """
        try:
            # Convert event to JSON
            event_json = json.dumps(event)

            # Send to Kafka
            self.producer.produce(
                topic=self.topic,
                key=event['qr_id'],  # Use QR ID as key for partitioning
                value=event_json,
                callback=self.delivery_callback
            )

            # Trigger delivery reports
            self.producer.poll(0)

        except Exception as e:
            print(f"[ERROR] Failed to send event: {e}")

    def flush(self):
        """Flush remaining messages"""
        remaining = self.producer.flush(timeout=10)
        if remaining > 0:
            print(f"[WARN] {remaining} messages were not delivered")
        else:
            print(f"[OK] All messages delivered successfully")

    def close(self):
        """Close producer connection"""
        self.flush()
        print("[i] Producer closed")


def simulate_warehouse_scans():
    """
    Simulate warehouse QR code scans
    Demonstrates both legitimate scans and attack scenarios
    """
    print("[*] Business Guardian AI - QR Code Scan Simulator")
    print("=" * 70)
    print()

    # Initialize
    verifier = QRCodeVerifier()
    producer = QRScanProducer()

    # Create sample products
    products = [
        Product(
            product_id='3C-LAPTOP-001',
            name='Dell XPS 15 Laptop',
            category='3C Electronics',
            value=1299.99,
            warehouse_location='A-12-5'
        ),
        Product(
            product_id='3C-PHONE-002',
            name='iPhone 15 Pro Max',
            category='3C Electronics',
            value=1199.99,
            warehouse_location='A-12-7'
        ),
        Product(
            product_id='3C-TABLET-003',
            name='iPad Pro 12.9"',
            category='3C Electronics',
            value=999.99,
            warehouse_location='A-12-9'
        ),
    ]

    print("[SCENARIO 1] Legitimate warehouse operations")
    print("-" * 70)

    # Scenario 1: Normal warehouse scan
    print("\n[1.1] Product received - generating QR code...")
    qr1 = verifier.generate_qr_code(
        product=products[0],
        warehouse_id='JD-FRANCE-WAREHOUSE-01',
        status='in_warehouse'
    )
    print(f"      Product: {products[0].name}")
    print(f"      QR ID: {qr1.qr_id}")

    # Scan at warehouse scanner
    print("\n[1.2] Scanning at warehouse scanner...")
    result1 = verifier.verify_qr_code(qr1, scan_location='warehouse_scanner')
    event1 = create_kafka_event(result1)
    producer.send_scan_event(event1)
    print(f"      Status: {'PASS' if result1.is_valid else 'FAIL'}")
    print(f"      Threat Level: {result1.threat_level}")

    time.sleep(1)

    # Scenario 2: Normal shipment preparation
    print("\n[1.3] Preparing for shipment...")
    qr2 = verifier.generate_qr_code(
        product=products[1],
        warehouse_id='JD-FRANCE-WAREHOUSE-01',
        shipment_id='SHIP-2025-001',
        status='ready_for_shipment'
    )

    result2 = verifier.verify_qr_code(
        qr2,
        scan_location='packing_area',
        expected_status='ready_for_shipment'
    )
    event2 = create_kafka_event(result2)
    producer.send_scan_event(event2)
    print(f"      Product: {products[1].name}")
    print(f"      Status: {'PASS' if result2.is_valid else 'FAIL'}")
    print(f"      Threat Level: {result2.threat_level}")

    time.sleep(1)

    # ATTACK SCENARIOS
    print("\n")
    print("[SCENARIO 2] JD.com Attack Simulations")
    print("-" * 70)

    # Attack 1: QR code tampering - change status to 'shipped'
    print("\n[2.1] ATTACK: Thief changes QR code status to 'shipped'...")
    fake_qr1 = verifier.generate_qr_code(
        product=products[2],
        warehouse_id='JD-FRANCE-WAREHOUSE-01',
        status='in_warehouse'
    )

    # Attacker modifies the QR code
    from core.qr_verification import QRCodeData
    tampered_qr = QRCodeData(
        qr_id=fake_qr1.qr_id,
        product=fake_qr1.product,
        timestamp=fake_qr1.timestamp,
        warehouse_id=fake_qr1.warehouse_id,
        shipment_id='FAKE-SHIPMENT-999',
        status='shipped',  # CHANGED BY ATTACKER
        signature=fake_qr1.signature  # Original signature won't match
    )

    print(f"      Product: {products[2].name}")
    print(f"      Original Status: in_warehouse")
    print(f"      Tampered Status: shipped")

    # Scan at exit gate
    print("\n[2.2] Scanning at EXIT GATE...")
    result3 = verifier.verify_qr_code(
        tampered_qr,
        scan_location='exit_gate',
        expected_status='shipped'
    )
    event3 = create_kafka_event(result3)
    producer.send_scan_event(event3)

    print(f"      Status: {'PASS' if result3.is_valid else 'FAIL - ATTACK DETECTED!'}")
    print(f"      Threat Level: {result3.threat_level.upper()}")
    print(f"      Fraud Indicators: {len(result3.fraud_indicators)}")
    for indicator in result3.fraud_indicators:
        print(f"        - [{indicator['severity'].upper()}] {indicator['description']}")

    time.sleep(1)

    # Attack 2: Completely fake QR code
    print("\n[2.3] ATTACK: Completely forged QR code...")
    forged_product = Product(
        product_id='FAKE-PRODUCT-999',
        name='Fake Product',
        category='3C Electronics',
        value=9999.99,
        warehouse_location='UNKNOWN'
    )

    forged_qr = QRCodeData(
        qr_id='fake-id-12345',
        product=forged_product,
        timestamp=int(time.time()),
        warehouse_id='JD-FRANCE-WAREHOUSE-01',
        shipment_id='FAKE-SHIP-001',
        status='shipped',
        signature='COMPLETELY_FAKE_SIGNATURE_ABCD1234'
    )

    result4 = verifier.verify_qr_code(forged_qr, scan_location='exit_gate')
    event4 = create_kafka_event(result4)
    producer.send_scan_event(event4)

    print(f"      Status: {'PASS' if result4.is_valid else 'FAIL - FORGED QR CODE!'}")
    print(f"      Threat Level: {result4.threat_level.upper()}")
    print(f"      Reason: {result4.reason}")

    print("\n")
    print("=" * 70)

    # Flush and close
    print("\n[*] Flushing messages to Kafka...")
    producer.close()

    print("\n[SUCCESS] All scan events sent to Confluent Cloud!")
    print("[i] Check the Kafka topic 'qr-code-scans' for events")
    print()


if __name__ == '__main__':
    try:
        simulate_warehouse_scans()
    except KeyboardInterrupt:
        print("\n\n[WARN] Script interrupted by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n[ERROR] Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
