"""
Business Guardian AI - Digital Inventory Producer
Simulates ERP system inventory updates (digital records)

This represents the "official" inventory records that attackers
manipulate in the JD.com scenario. We'll compare this with physical
sensor data to detect discrepancies.
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
class InventoryRecord:
    """Digital inventory record from ERP system"""
    product_id: str
    product_name: str
    category: str
    sku: str
    location: str
    quantity_on_hand: int
    quantity_reserved: int
    quantity_available: int
    last_updated: int
    status: str  # 'available', 'reserved', 'shipped', 'pending'
    warehouse_id: str


@dataclass
class InventoryTransaction:
    """Inventory transaction event"""
    transaction_id: str
    transaction_type: str  # 'receive', 'ship', 'adjust', 'reserve', 'fraud_adjust'
    product_id: str
    quantity_change: int
    new_quantity: int
    warehouse_id: str
    user_id: str
    timestamp: int
    notes: str


class DigitalInventoryProducer:
    """Kafka producer for digital inventory data"""

    def __init__(self):
        """Initialize producer"""
        self.conf = {
            'bootstrap.servers': os.getenv('CONFLUENT_BOOTSTRAP_SERVER'),
            'security.protocol': 'SASL_SSL',
            'sasl.mechanisms': 'PLAIN',
            'sasl.username': os.getenv('CONFLUENT_API_KEY'),
            'sasl.password': os.getenv('CONFLUENT_API_SECRET'),
            'client.id': 'digital-inventory-producer',
            'acks': 'all',
            'compression.type': 'snappy'
        }

        if not all([self.conf['bootstrap.servers'], self.conf['sasl.username'], self.conf['sasl.password']]):
            raise ValueError("Missing Confluent Cloud credentials")

        self.producer = Producer(self.conf)
        self.topic = 'inventory-digital'

        print(f"[OK] Digital Inventory Producer initialized")
        print(f"[>] Topic: {self.topic}")

    def delivery_callback(self, err, msg):
        """Message delivery callback"""
        if err:
            print(f"[ERROR] Delivery failed: {err}")
        else:
            if random.random() < 0.2:  # 20% sampling
                print(f"[OK] Inventory update -> {msg.topic()} [{msg.partition()}]")

    def send_inventory_update(self, data: Dict):
        """Send inventory update to Kafka"""
        try:
            self.producer.produce(
                topic=self.topic,
                key=data.get('product_id'),
                value=json.dumps(data),
                callback=self.delivery_callback
            )
            self.producer.poll(0)
        except Exception as e:
            print(f"[ERROR] Failed to send: {e}")

    def flush(self):
        """Flush messages"""
        remaining = self.producer.flush(timeout=10)
        if remaining == 0:
            print(f"[OK] All inventory updates delivered")

    def close(self):
        """Close producer"""
        self.flush()


class ERPSimulator:
    """
    Simulates an ERP (Enterprise Resource Planning) system
    Tracks digital inventory records
    """

    def __init__(self, warehouse_id: str = 'JD-FRANCE-WAREHOUSE-01'):
        """Initialize ERP simulator"""
        self.warehouse_id = warehouse_id
        self.producer = DigitalInventoryProducer()

        # Initial inventory state
        self.inventory = {
            '3C-LAPTOP-001': {
                'name': 'Dell XPS 15 Laptop',
                'category': '3C Electronics',
                'sku': 'DELL-XPS15-2024',
                'location': 'Shelf-A-5',
                'quantity': 100,
                'reserved': 0,
                'status': 'available'
            },
            '3C-PHONE-002': {
                'name': 'iPhone 15 Pro Max',
                'category': '3C Electronics',
                'sku': 'APPL-IP15PM-256',
                'location': 'Shelf-A-7',
                'quantity': 500,
                'reserved': 0,
                'status': 'available'
            },
            '3C-TABLET-003': {
                'name': 'iPad Pro 12.9"',
                'category': '3C Electronics',
                'sku': 'APPL-IPADPRO-129',
                'location': 'Shelf-A-9',
                'quantity': 250,
                'reserved': 0,
                'status': 'available'
            },
            '3C-HEADPHONE-004': {
                'name': 'Sony WH-1000XM5',
                'category': '3C Electronics',
                'sku': 'SONY-WH1000XM5',
                'location': 'Shelf-B-3',
                'quantity': 150,
                'reserved': 0,
                'status': 'available'
            },
        }

        print(f"[i] ERP System: {warehouse_id}")
        print(f"[i] Products in catalog: {len(self.inventory)}")
        print()

    def get_inventory_record(self, product_id: str) -> InventoryRecord:
        """Get current inventory record for product"""
        item = self.inventory[product_id]
        return InventoryRecord(
            product_id=product_id,
            product_name=item['name'],
            category=item['category'],
            sku=item['sku'],
            location=item['location'],
            quantity_on_hand=item['quantity'],
            quantity_reserved=item['reserved'],
            quantity_available=item['quantity'] - item['reserved'],
            last_updated=int(time.time()),
            status=item['status'],
            warehouse_id=self.warehouse_id
        )

    def process_transaction(
        self,
        transaction_type: str,
        product_id: str,
        quantity_change: int,
        user_id: str = 'system',
        notes: str = ''
    ) -> InventoryTransaction:
        """Process an inventory transaction"""
        item = self.inventory[product_id]

        # Update quantity based on transaction type
        if transaction_type in ['ship', 'adjust']:
            item['quantity'] += quantity_change  # quantity_change will be negative for shipments

        new_quantity = item['quantity']

        # Create transaction record
        transaction = InventoryTransaction(
            transaction_id=f'TXN-{int(time.time())}-{random.randint(1000, 9999)}',
            transaction_type=transaction_type,
            product_id=product_id,
            quantity_change=quantity_change,
            new_quantity=new_quantity,
            warehouse_id=self.warehouse_id,
            user_id=user_id,
            timestamp=int(time.time()),
            notes=notes
        )

        return transaction

    def simulate_normal_operations(self, duration_seconds: int = 10):
        """Simulate normal ERP operations"""
        print("[SCENARIO] Normal ERP Operations")
        print("-" * 70)

        end_time = time.time() + duration_seconds
        transaction_count = 0

        while time.time() < end_time:
            # Random product
            product_id = random.choice(list(self.inventory.keys()))

            # Random operation
            operation = random.choice(['inventory_check', 'reserve', 'ship'])

            if operation == 'inventory_check':
                # Periodic inventory record update
                record = self.get_inventory_record(product_id)
                self.producer.send_inventory_update({
                    'event_type': 'inventory_snapshot',
                    **asdict(record)
                })

            elif operation == 'reserve':
                # Reserve items for order
                quantity = random.randint(1, 5)
                self.inventory[product_id]['reserved'] += quantity
                transaction = self.process_transaction(
                    'reserve',
                    product_id,
                    quantity,
                    user_id=f'user-{random.randint(1, 10)}',
                    notes='Order reservation'
                )
                self.producer.send_inventory_update({
                    'event_type': 'inventory_transaction',
                    **asdict(transaction)
                })

            elif operation == 'ship':
                # Ship reserved items
                quantity = -random.randint(1, 3)  # Negative for shipment
                transaction = self.process_transaction(
                    'ship',
                    product_id,
                    quantity,
                    user_id='shipping-system',
                    notes='Order fulfilled'
                )
                self.producer.send_inventory_update({
                    'event_type': 'inventory_transaction',
                    **asdict(transaction)
                })

            transaction_count += 1
            time.sleep(1)

        print(f"\n[i] Processed {transaction_count} ERP transactions")

    def simulate_fraud_adjustments(self):
        """
        Simulate attackers manipulating digital records
        In the JD.com scenario, thieves marked items as 'shipped'
        to bypass alarms
        """
        print("\n")
        print("[ATTACK SCENARIO] Fraudulent Digital Inventory Adjustments")
        print("-" * 70)

        print("\n[ATTACK] Thieves accessing ERP system...")
        print("[ATTACK] Creating fake 'shipped' transactions to hide theft...")
        time.sleep(1)

        # Attackers create fake shipment records
        stolen_products = ['3C-LAPTOP-001', '3C-PHONE-002', '3C-TABLET-003']

        for i, product_id in enumerate(stolen_products, 1):
            # Fraudulent transaction marking items as shipped
            stolen_quantity = random.randint(15, 25)

            transaction = self.process_transaction(
                'fraud_adjust',  # Special marker for fraudulent transactions
                product_id,
                -stolen_quantity,  # Negative = items removed
                user_id='COMPROMISED-ACCOUNT-X',  # Suspicious user ID
                notes='FRAUDULENT: Items marked as shipped but were stolen'
            )

            self.producer.send_inventory_update({
                'event_type': 'inventory_transaction',
                **asdict(transaction)
            })

            print(f"[{i}] FRAUDULENT TRANSACTION:")
            print(f"    Product: {self.inventory[product_id]['name']}")
            print(f"    Quantity: {stolen_quantity} items marked as 'shipped'")
            print(f"    User: {transaction.user_id} (SUSPICIOUS!)")
            print(f"    Transaction ID: {transaction.transaction_id}")

            # Send updated inventory record
            record = self.get_inventory_record(product_id)
            self.producer.send_inventory_update({
                'event_type': 'inventory_snapshot',
                **asdict(record)
            })

            time.sleep(1)

        print("\n[ALERT] Digital records show items as 'shipped'")
        print("[CRITICAL] But physical sensors detected theft!")
        print("[i] Fraud detection system will correlate these discrepancies")

    def close(self):
        """Close simulator"""
        self.producer.close()


def main():
    """Main simulation"""
    print("[*] Business Guardian AI - Digital Inventory (ERP) Simulator")
    print("=" * 70)
    print()

    try:
        # Initialize
        erp = ERPSimulator()

        # Normal operations
        erp.simulate_normal_operations(duration_seconds=10)

        # Fraud scenario
        erp.simulate_fraud_adjustments()

        # Flush
        print("\n[*] Flushing inventory data to Kafka...")
        erp.close()

        print("\n" + "=" * 70)
        print("[SUCCESS] Digital inventory simulation complete!")
        print("[i] Check 'inventory-digital' topic in Confluent Cloud")
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
