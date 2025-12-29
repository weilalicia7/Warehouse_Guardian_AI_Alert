"""
Business Guardian AI - Kafka Topics Creation Script
This script creates all required Kafka topics in Confluent Cloud
"""

import os
import sys
from dotenv import load_dotenv
from confluent_kafka.admin import AdminClient, NewTopic
from confluent_kafka import KafkaException

# Load environment variables
load_dotenv()

# Confluent Cloud configuration
conf = {
    'bootstrap.servers': os.getenv('CONFLUENT_BOOTSTRAP_SERVER'),
    'security.protocol': 'SASL_SSL',
    'sasl.mechanisms': 'PLAIN',
    'sasl.username': os.getenv('CONFLUENT_API_KEY'),
    'sasl.password': os.getenv('CONFLUENT_API_SECRET'),
}

# Validate configuration
if not all([conf['bootstrap.servers'], conf['sasl.username'], conf['sasl.password']]):
    print("[ERROR] Error: Missing Confluent Cloud credentials in .env file")
    print("Please ensure CONFLUENT_BOOTSTRAP_SERVER, CONFLUENT_API_KEY, and CONFLUENT_API_SECRET are set")
    sys.exit(1)

# Define all topics for Business Guardian AI
TOPICS = [
    {
        'name': 'qr-code-scans',
        'partitions': 3,
        'replication': 3,
        'description': 'QR code scanning events and verification results'
    },
    {
        'name': 'inventory-physical',
        'partitions': 3,
        'replication': 3,
        'description': 'Physical inventory data from IoT sensors (weight, RFID, cameras)'
    },
    {
        'name': 'inventory-digital',
        'partitions': 3,
        'replication': 3,
        'description': 'Digital inventory status from ERP system'
    },
    {
        'name': 'employee-activity',
        'partitions': 2,
        'replication': 3,
        'description': 'Employee access logs and system actions'
    },
    {
        'name': 'shipping-logistics',
        'partitions': 2,
        'replication': 3,
        'description': 'Shipping events, truck departures, manifests'
    },
    {
        'name': 'social-media-feed',
        'partitions': 2,
        'replication': 3,
        'description': 'Social media and news sentiment analysis'
    },
    {
        'name': 'fraud-alerts',
        'partitions': 3,
        'replication': 3,
        'description': 'Real-time fraud alerts and warnings'
    },
    {
        'name': 'threat-scores',
        'partitions': 2,
        'replication': 3,
        'description': 'ML-generated threat risk scores'
    },
    {
        'name': 'ml-predictions',
        'partitions': 2,
        'replication': 3,
        'description': 'Machine learning model predictions'
    },
    {
        'name': 'system-events',
        'partitions': 1,
        'replication': 3,
        'description': 'Application system events and logs'
    },
]


def create_topics():
    """Create all Kafka topics"""
    print("[*] Business Guardian AI - Kafka Topics Setup")
    print("=" * 60)
    print(f"[>] Connecting to: {conf['bootstrap.servers']}")
    print(f"[+] Using API Key: {conf['sasl.username'][:8]}...")
    print()

    # Create AdminClient
    try:
        admin_client = AdminClient(conf)
        print("[OK] Connected to Confluent Cloud")
        print()
    except Exception as e:
        print(f"[ERROR] Failed to connect to Confluent Cloud: {e}")
        sys.exit(1)

    # Get existing topics
    try:
        metadata = admin_client.list_topics(timeout=10)
        existing_topics = set(metadata.topics.keys())
        print(f"[i] Found {len(existing_topics)} existing topics")
        print()
    except Exception as e:
        print(f"[WARN] Warning: Could not list existing topics: {e}")
        existing_topics = set()

    # Create new topics
    new_topics = []
    for topic_config in TOPICS:
        topic_name = topic_config['name']

        if topic_name in existing_topics:
            print(f"[>>] Topic '{topic_name}' already exists - skipping")
        else:
            new_topic = NewTopic(
                topic=topic_name,
                num_partitions=topic_config['partitions'],
                replication_factor=topic_config['replication']
            )
            new_topics.append(new_topic)
            print(f"[+] Queuing topic '{topic_name}' for creation")
            print(f"    Partitions: {topic_config['partitions']}, Replication: {topic_config['replication']}")
            print(f"    Description: {topic_config['description']}")

    print()

    # Create topics
    if new_topics:
        print(f"[*] Creating {len(new_topics)} new topics...")
        print()

        # Call create_topics
        fs = admin_client.create_topics(new_topics, request_timeout=30)

        # Wait for operations to complete
        for topic_name, future in fs.items():
            try:
                future.result()  # Block until topic is created
                print(f"[OK] Successfully created topic: {topic_name}")
            except KafkaException as e:
                if e.args[0].code() == 36:  # TopicAlreadyExists
                    print(f"[>>] Topic '{topic_name}' already exists")
                else:
                    print(f"[ERROR] Failed to create topic '{topic_name}': {e}")
            except Exception as e:
                print(f"[ERROR] Error creating topic '{topic_name}': {e}")

    else:
        print("[i] All topics already exist - nothing to create")

    print()
    print("=" * 60)
    print("[SUCCESS] Topic setup complete!")
    print()
    print("[i] Summary:")
    print(f"    Total topics defined: {len(TOPICS)}")
    print(f"    New topics created: {len(new_topics)}")
    print(f"    Already existing: {len(TOPICS) - len(new_topics)}")
    print()
    print("[OK] Ready to start streaming data!")
    print()

    # List all topics for verification
    print("[i] All topics in cluster:")
    try:
        metadata = admin_client.list_topics(timeout=10)
        for topic_name in sorted(metadata.topics.keys()):
            if topic_name in [t['name'] for t in TOPICS]:
                print(f"    [OK] {topic_name}")
            else:
                print(f"    [i] {topic_name} (not part of Business Guardian)")
    except Exception as e:
        print(f"[WARN] Could not list topics: {e}")

    print()


if __name__ == '__main__':
    try:
        create_topics()
    except KeyboardInterrupt:
        print("\n\n[WARN] Script interrupted by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n[ERROR] Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
