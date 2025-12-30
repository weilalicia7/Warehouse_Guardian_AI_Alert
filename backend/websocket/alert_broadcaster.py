"""
Alert Broadcaster
Consumes fraud alerts from Kafka and broadcasts to WebSocket clients
"""

import asyncio
import json
import logging
from typing import Optional
from confluent_kafka import Consumer, KafkaError
from websocket.connection_manager import manager
from datetime import datetime

logger = logging.getLogger(__name__)


class AlertBroadcaster:
    """
    Kafka consumer that streams fraud alerts to WebSocket connections.
    Runs in background task during FastAPI lifespan.
    """

    def __init__(self, kafka_config: dict, topic: str = "fraud-alerts"):
        """
        Initialize Kafka consumer.

        Args:
            kafka_config: Kafka consumer configuration
            topic: Kafka topic to consume from
        """
        self.kafka_config = kafka_config
        self.topic = topic
        self.consumer: Optional[Consumer] = None
        self.running = False

    def start_consumer(self):
        """Initialize Kafka consumer."""
        try:
            self.consumer = Consumer(self.kafka_config)
            self.consumer.subscribe([self.topic])
            logger.info(f"[Kafka] Subscribed to topic: {self.topic}")
        except Exception as e:
            logger.error(f"[Kafka] Failed to initialize consumer: {e}")
            raise

    def stop_consumer(self):
        """Close Kafka consumer."""
        self.running = False
        if self.consumer:
            self.consumer.close()
            logger.info("[Kafka] Consumer closed")

    async def consume_and_broadcast(self):
        """
        Main loop: consume Kafka messages and broadcast to WebSocket clients.
        Runs as background task during FastAPI lifespan.
        """
        self.running = True
        self.start_consumer()

        logger.info("[Kafka → WebSocket] Alert broadcaster started")

        while self.running:
            try:
                # Poll Kafka (non-blocking with timeout)
                msg = self.consumer.poll(timeout=1.0)

                if msg is None:
                    # No message, continue loop
                    await asyncio.sleep(0.1)
                    continue

                if msg.error():
                    if msg.error().code() == KafkaError._PARTITION_EOF:
                        # End of partition, not an error
                        continue
                    else:
                        logger.error(f"[Kafka] Consumer error: {msg.error()}")
                        continue

                # Parse message
                try:
                    alert_data = json.loads(msg.value().decode('utf-8'))
                    await self.process_alert(alert_data)
                except json.JSONDecodeError as e:
                    logger.error(f"[Kafka] Invalid JSON in message: {e}")
                    continue

            except Exception as e:
                logger.error(f"[Kafka] Error in consume loop: {e}")
                await asyncio.sleep(1)

        logger.info("[Kafka → WebSocket] Alert broadcaster stopped")

    async def process_alert(self, alert_data: dict):
        """
        Process fraud alert and broadcast to relevant WebSocket clients.

        Args:
            alert_data: Alert data from Kafka (includes company_id)
        """
        try:
            # Extract company_id for multi-tenant routing
            company_id = alert_data.get('company_id')

            if not company_id:
                logger.warning(f"[Alert] Missing company_id in alert: {alert_data.get('alert_id')}")
                return

            # Prepare WebSocket message
            ws_message = {
                'type': 'fraud_alert',
                'timestamp': datetime.utcnow().isoformat(),
                'payload': alert_data
            }

            # Broadcast to company's WebSocket connections
            await manager.broadcast_to_company(company_id, ws_message)

            logger.info(f"[Alert] Broadcasted alert {alert_data.get('alert_id')} "
                       f"to company {company_id} "
                       f"({manager.get_connection_count(company_id)} connections)")

        except Exception as e:
            logger.error(f"[Alert] Error processing alert: {e}")


# Global broadcaster instance (initialized in lifespan)
broadcaster: Optional[AlertBroadcaster] = None


def get_broadcaster() -> Optional[AlertBroadcaster]:
    """Get global broadcaster instance."""
    return broadcaster


def set_broadcaster(instance: AlertBroadcaster):
    """Set global broadcaster instance."""
    global broadcaster
    broadcaster = instance
