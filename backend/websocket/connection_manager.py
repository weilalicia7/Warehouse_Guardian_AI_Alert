"""
WebSocket Connection Manager
Manages WebSocket connections for multi-tenant real-time updates
"""

from typing import Dict, List
from fastapi import WebSocket
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """
    Manages WebSocket connections grouped by company_id.
    Ensures multi-tenant isolation - only send alerts to the correct company.
    """

    def __init__(self):
        # Dictionary mapping company_id -> list of WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, company_id: str):
        """
        Accept WebSocket connection and add to company's connection pool.

        Args:
            websocket: WebSocket connection
            company_id: Company ID for multi-tenant isolation
        """
        await websocket.accept()

        if company_id not in self.active_connections:
            self.active_connections[company_id] = []

        self.active_connections[company_id].append(websocket)

        logger.info(f"[WebSocket] New connection for company {company_id}. "
                   f"Total connections: {len(self.active_connections[company_id])}")

    def disconnect(self, websocket: WebSocket, company_id: str):
        """
        Remove WebSocket connection from company's pool.

        Args:
            websocket: WebSocket connection to remove
            company_id: Company ID
        """
        if company_id in self.active_connections:
            try:
                self.active_connections[company_id].remove(websocket)
                logger.info(f"[WebSocket] Connection closed for company {company_id}. "
                           f"Remaining: {len(self.active_connections[company_id])}")

                # Clean up empty lists
                if not self.active_connections[company_id]:
                    del self.active_connections[company_id]
            except ValueError:
                pass  # Connection already removed

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """
        Send message to a specific WebSocket connection.

        Args:
            message: JSON-serializable message
            websocket: Target WebSocket connection
        """
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"[WebSocket] Error sending personal message: {e}")

    async def broadcast_to_company(self, company_id: str, message: dict):
        """
        Broadcast message to all connections for a specific company.

        Args:
            company_id: Target company ID
            message: JSON-serializable message
        """
        if company_id not in self.active_connections:
            logger.warning(f"[WebSocket] No active connections for company {company_id}")
            return

        # Get list of connections to avoid modification during iteration
        connections = self.active_connections[company_id].copy()

        disconnected = []

        for websocket in connections:
            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.error(f"[WebSocket] Error broadcasting to company {company_id}: {e}")
                disconnected.append(websocket)

        # Remove disconnected clients
        for websocket in disconnected:
            self.disconnect(websocket, company_id)

    async def broadcast_to_all(self, message: dict):
        """
        Broadcast message to all connected clients (use sparingly).

        Args:
            message: JSON-serializable message
        """
        for company_id in list(self.active_connections.keys()):
            await self.broadcast_to_company(company_id, message)

    def get_connection_count(self, company_id: str = None) -> int:
        """
        Get number of active connections.

        Args:
            company_id: Specific company ID, or None for total count

        Returns:
            Number of active connections
        """
        if company_id:
            return len(self.active_connections.get(company_id, []))

        return sum(len(conns) for conns in self.active_connections.values())


# Global connection manager instance
manager = ConnectionManager()
