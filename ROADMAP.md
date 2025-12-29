# Business Guardian AI - Complete Implementation Roadmap

> **Mission:** Build the most advanced real-time business protection platform to win the Confluent Challenge ($12,500 first prize)

**Target:** Confluent Challenge - AI on Data in Motion
**Deadline:** December 31, 2025 @ 10:00pm GMT
**Inspired by:** JD.com France warehouse robbery (QR code fraud attack)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technical Architecture](#technical-architecture)
3. [Implementation Timeline](#implementation-timeline)
4. [Day-by-Day Breakdown](#day-by-day-breakdown)
5. [Feature Specifications](#feature-specifications)
6. [Data Pipeline Design](#data-pipeline-design)
7. [ML/AI Components](#mlai-components)
8. [Frontend Development](#frontend-development)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Plan](#deployment-plan)
11. [Documentation Requirements](#documentation-requirements)
12. [Demo Preparation](#demo-preparation)
13. [Submission Checklist](#submission-checklist)

---

## Project Overview

### Core Problem Statement

**The JD.com Attack Vector:**
- December 2024: JD.com warehouse in France robbed of 3C devices worth millions
- **Sophisticated Attack:** Thieves changed QR codes to mark items as "already shipped"
- System showed items out of warehouse, so alarms didn't trigger
- Walked out with legitimate-looking inventory
- Traditional security completely bypassed

### Our Solution

**Business Guardian AI** - Real-time fraud detection platform that:
1. **Cryptographically verifies QR codes** - Tamper-proof product tracking
2. **Reconciles physical vs digital inventory** - Real-time stream processing
3. **Detects behavioral anomalies** - ML-powered pattern recognition
4. **Prevents sophisticated attacks** - Multi-layer threat intelligence
5. **Protects any business** - Scalable from small shops to large warehouses

### Value Proposition

- **For Large Businesses:** Prevent multi-million dollar losses like JD.com
- **For Small Businesses:** Affordable AI-powered security (60% fail after major theft)
- **Market Impact:** $1.2B annual global warehouse theft prevention
- **Technical Innovation:** First real-time physical-digital inventory reconciliation

---

## Technical Architecture

### High-Level Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS GUARDIAN AI                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │  Frontend  │  │  Backend   │  │   ML/AI    │           │
│  │   React    │  │  Services  │  │ Vertex AI  │           │
│  │  Dashboard │  │  Cloud Run │  │   Gemini   │           │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘           │
│         │                │                │                  │
│         └────────────────┼────────────────┘                  │
│                          │                                   │
│         ┌────────────────▼────────────────┐                 │
│         │   CONFLUENT CLOUD (Kafka)       │                 │
│         │  ┌──────────────────────────┐   │                 │
│         │  │  Data Streaming Layer    │   │                 │
│         │  │  • Kafka Topics          │   │                 │
│         │  │  • Flink SQL Processing  │   │                 │
│         │  │  • Stream Connectors     │   │                 │
│         │  └──────────────────────────┘   │                 │
│         └────────────────┬────────────────┘                 │
│                          │                                   │
│         ┌────────────────▼────────────────┐                 │
│         │      GOOGLE CLOUD PLATFORM      │                 │
│         │  • BigQuery (Analytics)         │                 │
│         │  • Cloud Storage (Data Lake)    │                 │
│         │  • Cloud Functions (Triggers)   │                 │
│         │  • Firestore (Real-time DB)     │                 │
│         └─────────────────────────────────┘                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘

         ▲                           ▲                    ▲
         │                           │                    │
    ┌────┴────┐               ┌─────┴─────┐        ┌────┴────┐
    │ Data    │               │ External  │        │ Mock    │
    │ Sources │               │ APIs      │        │ Data    │
    └─────────┘               └───────────┘        └─────────┘
```

### Technology Stack Details

#### **Confluent Cloud Components**
- **Apache Kafka:** Core event streaming (10+ topics)
- **Flink SQL:** Real-time stream processing and joins
- **Schema Registry:** Data schema management
- **Connectors:**
  - HTTP Source Connector (API ingestion)
  - BigQuery Sink Connector (analytics)
  - Custom connectors for IoT devices

#### **Google Cloud Platform**
- **Vertex AI:**
  - Anomaly detection model
  - Fraud pattern classification
  - Behavioral analytics
- **Gemini API:**
  - Context analysis
  - Alert message generation
  - Intelligent recommendations
- **BigQuery:**
  - Historical analytics
  - Trend analysis
  - Reporting
- **Cloud Run:**
  - Microservices hosting
  - API endpoints
  - Scalable compute
- **Cloud Functions:**
  - Event-driven triggers
  - Alert dispatch
  - Integration logic
- **Firestore:**
  - Real-time database
  - User settings
  - Alert history
- **Cloud Storage:**
  - Data lake
  - Model artifacts
  - Video/image storage

#### **Frontend**
- **React 18+** with TypeScript
- **TailwindCSS** for styling
- **Recharts** for visualizations
- **Socket.io** for real-time updates
- **React Query** for data fetching

#### **Additional Tools**
- **Docker** for containerization
- **GitHub Actions** for CI/CD
- **Jest/Pytest** for testing
- **Terraform** (optional) for IaC

---

## Implementation Timeline

### Total Duration: 7-10 Days (Flexible)

**Phase 1: Foundation (Days 1-2)**
- Environment setup
- Confluent Cloud configuration
- Google Cloud project setup
- Basic data pipeline

**Phase 2: Core Streaming (Days 3-4)**
- Kafka topic design
- Flink SQL jobs
- Data connectors
- Stream processing logic

**Phase 3: AI/ML Development (Days 5-6)**
- Vertex AI models
- Gemini integration
- Fraud detection algorithms
- QR code cryptography

**Phase 4: Frontend & Integration (Days 7-8)**
- React dashboard
- Real-time visualizations
- Alert system
- End-to-end testing

**Phase 5: Demo & Polish (Days 9-10)**
- Demo scenarios
- Video production
- Documentation
- Submission preparation

---

## Day-by-Day Breakdown

### **DAY 1: Environment Setup & Architecture**

#### Morning (4 hours) - Cloud Setup

**1.1 Confluent Cloud Setup** ⏱️ 1 hour
```bash
# Tasks:
□ Sign up for Confluent Cloud account
□ Apply trial code: CONFLUENTDEV1
□ Create new environment: "business-guardian-prod"
□ Create Kafka cluster: "fraud-detection-cluster"
  - Region: AWS us-west-2 (or closest)
  - Type: Basic (sufficient for demo)
□ Note bootstrap server URL
□ Create API keys (save securely)

# Validation:
✓ Can access Confluent Cloud console
✓ Cluster shows "Running" status
✓ API keys generated and saved
```

**1.2 Google Cloud Platform Setup** ⏱️ 1.5 hours
```bash
# Tasks:
□ Create new GCP project: "business-guardian-ai"
□ Enable billing (free tier $300 credit)
□ Enable required APIs:
  - Vertex AI API
  - Cloud Run API
  - Cloud Functions API
  - BigQuery API
  - Cloud Storage API
  - Firestore API
  - Gemini API (Generative AI)
□ Create service account with appropriate roles:
  - Vertex AI Admin
  - BigQuery Admin
  - Cloud Run Admin
  - Storage Admin
□ Download service account JSON key
□ Set up gcloud CLI locally

# Commands:
gcloud auth login
gcloud config set project business-guardian-ai
gcloud services enable aiplatform.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable bigquery.googleapis.com
gcloud services enable firestore.googleapis.com

# Validation:
✓ All APIs enabled
✓ Service account created
✓ gcloud CLI working
```

**1.3 Local Development Setup** ⏱️ 1.5 hours
```bash
# Tasks:
□ Install required tools:
  - Node.js 18+ (for frontend)
  - Python 3.10+ (for backend)
  - Docker Desktop
  - Git
  - VS Code (recommended)

□ Create GitHub repository:
  - Repository name: "business-guardian-ai"
  - Visibility: Public
  - Initialize with README
  - Add MIT License
  - Create .gitignore (Node, Python, secrets)

□ Clone repository locally
□ Set up project structure:

business-guardian-ai/
├── README.md
├── LICENSE
├── .gitignore
├── .env.example
├── docs/
│   ├── ROADMAP.md (this file)
│   ├── architecture.md
│   ├── API.md
│   └── deployment.md
├── backend/
│   ├── confluent/
│   │   ├── kafka_setup/
│   │   ├── flink_jobs/
│   │   └── connectors/
│   ├── google_cloud/
│   │   ├── vertex_ai/
│   │   ├── gemini/
│   │   ├── cloud_functions/
│   │   └── models/
│   ├── services/
│   │   ├── qr_verification/
│   │   ├── fraud_detection/
│   │   └── alert_manager/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── Dockerfile
├── data/
│   ├── mock_generators/
│   ├── sample_data/
│   └── schemas/
├── scripts/
│   ├── setup.sh
│   ├── deploy.sh
│   └── generate_mock_data.py
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/

□ Install Python dependencies:
pip install -r requirements.txt

# requirements.txt:
confluent-kafka==2.3.0
google-cloud-aiplatform==1.38.0
google-cloud-bigquery==3.14.0
google-generativeai==0.3.1
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.0
python-dotenv==1.0.0
redis==5.0.1
pytest==7.4.3

□ Install Node.js dependencies:
cd frontend && npm install

# package.json dependencies:
react, react-dom, typescript
@tanstack/react-query
recharts, d3
tailwindcss, autoprefixer
socket.io-client
axios
zustand

# Validation:
✓ Repository created and cloned
✓ Project structure in place
✓ Dependencies installed
✓ No errors in setup
```

#### Afternoon (4 hours) - Architecture & Data Design

**1.4 Kafka Topic Design** ⏱️ 2 hours
```yaml
# Create topics in Confluent Cloud Console

Topics to Create:
# Core Data Streams
1. qr-code-scans
   Partitions: 3
   Retention: 7 days
   Schema: {
     product_id: string,
     qr_data: object,
     location: string,
     scanner_id: string,
     timestamp: timestamp,
     hash_signature: string
   }

2. inventory-digital
   Partitions: 3
   Retention: 30 days
   Schema: {
     product_id: string,
     status: string (in_stock|shipped|delivered),
     quantity: int,
     location: string,
     updated_by: string,
     updated_at: timestamp
   }

3. inventory-physical
   Partitions: 3
   Retention: 7 days
   Schema: {
     product_id: string,
     location: string,
     quantity: int,
     weight_kg: float,
     rfid_detected: boolean,
     sensor_id: string,
     timestamp: timestamp
   }

4. employee-activity
   Partitions: 2
   Retention: 30 days
   Schema: {
     employee_id: string,
     action: string,
     resource: string,
     location: string,
     ip_address: string,
     timestamp: timestamp
   }

5. shipping-logistics
   Partitions: 2
   Retention: 90 days
   Schema: {
     shipment_id: string,
     truck_id: string,
     departure_time: timestamp,
     manifest: array,
     destination: string
   }

6. social-media-feed
   Partitions: 2
   Retention: 3 days
   Schema: {
     source: string (twitter|reddit|news),
     content: string,
     sentiment: float,
     location: string,
     timestamp: timestamp
   }

# Processing & Alerts
7. fraud-alerts
   Partitions: 3
   Retention: 90 days
   Schema: {
     alert_id: string,
     alert_type: string,
     severity: string (low|medium|high|critical),
     description: string,
     evidence: object,
     recommended_actions: array,
     timestamp: timestamp
   }

8. threat-scores
   Partitions: 2
   Retention: 30 days
   Schema: {
     entity_id: string (product|employee|location),
     entity_type: string,
     risk_score: float (0-100),
     factors: object,
     timestamp: timestamp
   }

9. ml-predictions
   Partitions: 2
   Retention: 7 days
   Schema: {
     prediction_id: string,
     model_name: string,
     input_features: object,
     prediction: object,
     confidence: float,
     timestamp: timestamp
   }

10. system-events
    Partitions: 1
    Retention: 30 days
    Schema: {
      event_type: string,
      component: string,
      status: string,
      message: string,
      timestamp: timestamp
    }

# Tasks:
□ Create all 10 topics in Confluent Cloud
□ Verify topics are created successfully
□ Document topic naming conventions
□ Set up topic access permissions

# Validation:
✓ All topics visible in Confluent Console
✓ Correct partition count
✓ Retention policies set
```

**1.5 Database Schema Design** ⏱️ 1 hour
```sql
-- BigQuery Dataset & Tables

-- Create Dataset
CREATE SCHEMA business_guardian;

-- Historical Alerts Table
CREATE TABLE business_guardian.alerts_history (
  alert_id STRING NOT NULL,
  alert_type STRING,
  severity STRING,
  description STRING,
  evidence JSON,
  recommended_actions ARRAY<STRING>,
  status STRING,
  created_at TIMESTAMP,
  resolved_at TIMESTAMP,
  resolved_by STRING
);

-- Fraud Incidents Table
CREATE TABLE business_guardian.fraud_incidents (
  incident_id STRING NOT NULL,
  incident_type STRING,
  products_affected ARRAY<STRING>,
  employee_involved STRING,
  loss_estimate FLOAT64,
  prevented BOOLEAN,
  detection_method STRING,
  occurred_at TIMESTAMP,
  discovered_at TIMESTAMP,
  investigation_notes STRING
);

-- QR Code Registry Table
CREATE TABLE business_guardian.qr_code_registry (
  qr_id STRING NOT NULL,
  product_id STRING,
  generated_at TIMESTAMP,
  hash_signature STRING,
  current_location STRING,
  status STRING,
  scan_count INT64,
  last_scanned_at TIMESTAMP,
  is_valid BOOLEAN
);

-- Analytics/Metrics Table
CREATE TABLE business_guardian.system_metrics (
  metric_id STRING NOT NULL,
  metric_name STRING,
  metric_value FLOAT64,
  dimensions JSON,
  recorded_at TIMESTAMP
);

# Firestore Collections (for real-time data)
Collections:
- users (user settings, preferences)
- active_alerts (current alerts, auto-deleted when resolved)
- dashboard_state (real-time dashboard data)
- notification_queue (pending notifications)

# Tasks:
□ Create BigQuery dataset
□ Create all tables with schemas
□ Set up Firestore collections
□ Create indexes for performance
□ Set up data retention policies

# Validation:
✓ BigQuery tables created
✓ Firestore collections initialized
✓ No schema errors
```

**1.6 API Design & Documentation** ⏱️ 1 hour
```yaml
# REST API Endpoints Design

Base URL: https://api.businessguardian.ai

# Authentication
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh

# QR Code Management
POST /api/v1/qr/generate
  Body: { product_id, location }
  Returns: { qr_code, hash_signature }

POST /api/v1/qr/verify
  Body: { qr_data, scanned_location }
  Returns: { is_valid, tampering_detected, alert_triggered }

GET /api/v1/qr/{product_id}/history
  Returns: [ scan_events ]

# Inventory
GET /api/v1/inventory/status
  Query: location, product_category
  Returns: { digital, physical, discrepancies }

POST /api/v1/inventory/reconcile
  Trigger: Manual reconciliation
  Returns: { job_id, status }

# Alerts
GET /api/v1/alerts
  Query: severity, status, from_date, to_date
  Returns: [ alerts ]

GET /api/v1/alerts/{alert_id}
  Returns: { alert_details }

PATCH /api/v1/alerts/{alert_id}
  Body: { status, notes }
  Returns: { updated_alert }

# Analytics
GET /api/v1/analytics/dashboard
  Returns: { metrics, charts, risk_score }

GET /api/v1/analytics/threats
  Query: time_range, location
  Returns: { threat_timeline, predictions }

# Streaming (WebSocket)
WS /api/v1/stream/alerts
  Real-time: Alert notifications

WS /api/v1/stream/inventory
  Real-time: Inventory updates

# Tasks:
□ Document all API endpoints
□ Define request/response schemas
□ Set up API authentication strategy
□ Create OpenAPI/Swagger spec

# Validation:
✓ API design documented
✓ Consistent naming conventions
✓ Clear error handling
```

#### Evening Wrap-up (1 hour)

```bash
# End of Day 1 Checklist:
□ All cloud accounts created and configured
□ Development environment fully set up
□ Project structure in place
□ Kafka topics designed and created
□ Database schemas defined
□ API endpoints documented
□ Git repository initialized with initial commit
□ Environment variables documented in .env.example

# Git Commit:
git add .
git commit -m "Day 1: Initial project setup and architecture"
git push origin main

# Documentation Update:
□ Update README.md with setup instructions
□ Create architecture.md with diagrams
□ Document all credentials in secure location (NOT in repo)
```

---

### **DAY 2: Data Ingestion & Streaming Pipeline**

#### Morning (4 hours) - Mock Data Generators

**2.1 QR Code Generator System** ⏱️ 1.5 hours
```python
# File: backend/services/qr_verification/qr_system.py

import hashlib
import time
import json
import uuid
from datetime import datetime
from confluent_kafka import Producer
from typing import Dict, Optional

class SecureQRCodeSystem:
    """
    Cryptographically secure QR code generation and verification
    """

    def __init__(self, kafka_producer: Producer, secret_key: str):
        self.producer = kafka_producer
        self.secret_key = secret_key
        self.algorithm = 'sha256'

    def generate_qr_code(self,
                         product_id: str,
                         location: str,
                         employee_id: str) -> Dict:
        """
        Generate secure QR code with cryptographic hash

        Returns:
            {
                "qr_id": "uuid",
                "product_id": "SKU-123",
                "location": "warehouse-A-shelf-12",
                "timestamp": 1234567890,
                "hash_signature": "sha256_hash",
                "version": "2.0"
            }
        """
        qr_id = str(uuid.uuid4())
        timestamp = int(time.time())

        # Create data string for hashing
        data_components = [
            product_id,
            location,
            str(timestamp),
            qr_id,
            employee_id
        ]
        data_string = "|".join(data_components)

        # Generate cryptographic signature
        hash_signature = self._generate_hash(data_string)

        qr_data = {
            "qr_id": qr_id,
            "product_id": product_id,
            "location": location,
            "generated_by": employee_id,
            "timestamp": timestamp,
            "hash_signature": hash_signature,
            "version": "2.0",
            "algorithm": self.algorithm
        }

        # Stream to Kafka
        self._publish_to_kafka('qr-code-scans', qr_data)

        return qr_data

    def verify_qr_code(self,
                       scanned_data: Dict,
                       scanned_location: str,
                       scanner_id: str) -> Dict:
        """
        Verify QR code integrity and detect tampering

        Returns:
            {
                "is_valid": True/False,
                "tampering_detected": True/False,
                "alert_level": "none|low|high|critical",
                "reason": "description"
            }
        """
        # Reconstruct original data string
        data_components = [
            scanned_data.get('product_id'),
            scanned_data.get('location'),  # Original location
            str(scanned_data.get('timestamp')),
            scanned_data.get('qr_id'),
            scanned_data.get('generated_by')
        ]
        data_string = "|".join(data_components)

        # Calculate expected hash
        expected_hash = self._generate_hash(data_string)
        actual_hash = scanned_data.get('hash_signature')

        # Verification result
        result = {
            "is_valid": True,
            "tampering_detected": False,
            "alert_level": "none",
            "reason": "QR code verified successfully",
            "scanned_at": datetime.utcnow().isoformat(),
            "scanned_location": scanned_location,
            "scanner_id": scanner_id
        }

        # Check hash integrity
        if expected_hash != actual_hash:
            result.update({
                "is_valid": False,
                "tampering_detected": True,
                "alert_level": "critical",
                "reason": "Hash signature mismatch - QR code has been tampered"
            })

            # Trigger critical alert
            self._trigger_fraud_alert({
                "type": "QR_CODE_TAMPERING",
                "severity": "critical",
                "product_id": scanned_data.get('product_id'),
                "location": scanned_location,
                "evidence": {
                    "expected_hash": expected_hash,
                    "actual_hash": actual_hash,
                    "original_location": scanned_data.get('location'),
                    "scanned_location": scanned_location
                }
            })

        # Check location consistency
        elif scanned_data.get('location') != scanned_location:
            # Not necessarily fraud, but worth monitoring
            result.update({
                "alert_level": "low",
                "reason": f"QR scanned at different location than generated"
            })

        # Log verification event
        self._publish_to_kafka('qr-code-scans', {
            **scanned_data,
            "verification": result
        })

        return result

    def _generate_hash(self, data_string: str) -> str:
        """Generate SHA-256 hash with secret key"""
        combined = f"{data_string}|{self.secret_key}"
        return hashlib.sha256(combined.encode()).hexdigest()

    def _publish_to_kafka(self, topic: str, data: Dict):
        """Publish event to Kafka topic"""
        self.producer.produce(
            topic,
            key=data.get('product_id', '').encode('utf-8'),
            value=json.dumps(data).encode('utf-8'),
            callback=self._delivery_callback
        )
        self.producer.flush()

    def _trigger_fraud_alert(self, alert_data: Dict):
        """Trigger fraud alert in Kafka"""
        alert = {
            "alert_id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat(),
            **alert_data
        }
        self._publish_to_kafka('fraud-alerts', alert)

    @staticmethod
    def _delivery_callback(err, msg):
        """Kafka delivery callback"""
        if err:
            print(f'Message delivery failed: {err}')
        else:
            print(f'Message delivered to {msg.topic()} [{msg.partition()}]')

# Tasks:
□ Implement QR code generation
□ Implement verification logic
□ Add tampering detection
□ Test with valid and tampered codes
□ Integrate with Kafka producer

# Validation:
✓ Can generate QR codes
✓ Hash verification works
✓ Tampering detection works
✓ Events published to Kafka
```

**2.2 Mock IoT Sensor Data Generator** ⏱️ 1.5 hours
```python
# File: data/mock_generators/iot_sensors.py

import random
import time
import json
from datetime import datetime, timedelta
from confluent_kafka import Producer
from typing import List, Dict

class IoTSensorSimulator:
    """
    Simulate IoT sensors for physical inventory tracking
    - Weight sensors
    - RFID readers
    - Motion detectors
    - Door access sensors
    """

    def __init__(self, kafka_producer: Producer):
        self.producer = kafka_producer
        self.warehouse_zones = [
            'A-01', 'A-02', 'A-03', 'A-04',
            'B-01', 'B-02', 'B-03', 'B-04',
            'C-01', 'C-02', 'Loading-Dock', 'Office'
        ]
        self.products = self._generate_product_inventory()

    def _generate_product_inventory(self) -> List[Dict]:
        """Generate mock product inventory"""
        categories = ['smartphones', 'laptops', 'tablets', 'accessories']
        products = []

        for i in range(200):  # 200 products
            product = {
                'product_id': f'SKU-{1000 + i}',
                'category': random.choice(categories),
                'weight_kg': round(random.uniform(0.2, 2.5), 2),
                'location': random.choice(self.warehouse_zones),
                'quantity': random.randint(5, 50),
                'rfid_tag': f'RFID-{uuid.uuid4().hex[:12]}'
            }
            products.append(product)

        return products

    def simulate_normal_operations(self, duration_minutes: int = 60):
        """
        Simulate normal warehouse operations
        - Regular inventory scans
        - Employee movements
        - Shipments
        """
        end_time = time.time() + (duration_minutes * 60)

        while time.time() < end_time:
            # Random sensor events
            event_type = random.choices(
                ['rfid_scan', 'weight_check', 'motion', 'door_access'],
                weights=[40, 20, 30, 10]
            )[0]

            if event_type == 'rfid_scan':
                self._simulate_rfid_scan()
            elif event_type == 'weight_check':
                self._simulate_weight_sensor()
            elif event_type == 'motion':
                self._simulate_motion_detector()
            elif event_type == 'door_access':
                self._simulate_door_access()

            # Sleep between events (realistic intervals)
            time.sleep(random.uniform(1, 5))

    def simulate_fraud_scenario(self, scenario: str = 'jd_com_attack'):
        """
        Simulate specific fraud scenarios for demo

        Scenarios:
        - jd_com_attack: Mass QR code changes + no shipment
        - after_hours_theft: Suspicious after-hours activity
        - gradual_theft: Small amounts over time
        """
        if scenario == 'jd_com_attack':
            self._simulate_jd_com_attack()
        elif scenario == 'after_hours_theft':
            self._simulate_after_hours_theft()
        elif scenario == 'gradual_theft':
            self._simulate_gradual_theft()

    def _simulate_jd_com_attack(self):
        """
        Simulate the JD.com attack scenario:
        1. After hours (23:30-00:00)
        2. Mass QR code status changes
        3. No corresponding shipment
        4. No weight sensor changes
        5. Unusual employee activity
        """
        print("🚨 Simulating JD.com Attack Scenario...")

        # Timeline
        attack_start = datetime.now()

        # Phase 1: Employee logs in after hours (23:30)
        self._publish_event('employee-activity', {
            'employee_id': 'EMP-1547',
            'action': 'login',
            'resource': 'warehouse_system',
            'location': 'warehouse-A',
            'ip_address': '192.168.1.101',
            'timestamp': (attack_start + timedelta(minutes=0)).isoformat(),
            'is_after_hours': True
        })

        time.sleep(2)

        # Phase 2: Access QR code management system (23:35)
        self._publish_event('employee-activity', {
            'employee_id': 'EMP-1547',
            'action': 'access_qr_system',
            'resource': 'qr_management',
            'location': 'warehouse-A',
            'timestamp': (attack_start + timedelta(minutes=5)).isoformat()
        })

        time.sleep(3)

        # Phase 3: Generate new QR codes (23:42)
        print("  → Generating fraudulent QR codes...")
        for i in range(15):
            self._publish_event('qr-code-scans', {
                'qr_id': str(uuid.uuid4()),
                'product_id': f'SKU-{1100 + i}',
                'action': 'qr_regenerated',
                'location': 'warehouse-A',
                'generated_by': 'EMP-1547',
                'timestamp': (attack_start + timedelta(minutes=12, seconds=i*2)).isoformat(),
                'suspicious': True
            })
            time.sleep(0.5)

        time.sleep(3)

        # Phase 4: Mass inventory status changes (23:45-23:47)
        print("  → Changing inventory status to 'shipped'...")
        products_to_steal = random.sample(self.products, 127)

        for i, product in enumerate(products_to_steal):
            # Change digital status to "shipped"
            self._publish_event('inventory-digital', {
                'product_id': product['product_id'],
                'status': 'shipped',
                'quantity': 0,  # Marked as shipped out
                'location': 'warehouse-A',
                'updated_by': 'EMP-1547',
                'updated_at': (attack_start + timedelta(minutes=15, seconds=i*4)).isoformat(),
                'shipment_id': f'FAKE-SHIP-{uuid.uuid4().hex[:8]}'
            })

            # But physical inventory hasn't changed!
            self._publish_event('inventory-physical', {
                'product_id': product['product_id'],
                'location': 'warehouse-A',  # Still in warehouse!
                'quantity': product['quantity'],
                'weight_kg': product['weight_kg'] * product['quantity'],
                'rfid_detected': True,  # RFID still detecting it
                'sensor_id': 'SENSOR-A-12',
                'timestamp': (attack_start + timedelta(minutes=15, seconds=i*4)).isoformat()
            })

            if i % 20 == 0:
                print(f"  → {i}/127 items marked as 'shipped'...")

            time.sleep(0.3)

        time.sleep(2)

        # Phase 5: NO shipping logistics event (this is the red flag!)
        print("  → No truck departure logged (CRITICAL FRAUD INDICATOR)")
        # Deliberately NOT publishing to 'shipping-logistics' topic

        # Phase 6: Suspicious door access (23:50)
        for zone in ['A-01', 'A-02', 'Loading-Dock']:
            self._publish_event('employee-activity', {
                'employee_id': 'EMP-1547',
                'action': 'door_access',
                'resource': f'door_{zone}',
                'location': zone,
                'timestamp': (attack_start + timedelta(minutes=20)).isoformat(),
                'access_granted': True
            })
            time.sleep(1)

        print("✅ JD.com attack scenario simulation complete")
        print("   Expected Result: CRITICAL fraud alert should trigger")

    def _simulate_weight_sensor(self):
        """Simulate weight sensor reading"""
        product = random.choice(self.products)

        # Normal variance in weight (±2%)
        expected_weight = product['weight_kg'] * product['quantity']
        actual_weight = expected_weight * random.uniform(0.98, 1.02)

        self._publish_event('inventory-physical', {
            'product_id': product['product_id'],
            'location': product['location'],
            'quantity': product['quantity'],
            'weight_kg': round(actual_weight, 2),
            'sensor_id': f"WEIGHT-{product['location']}",
            'rfid_detected': True,
            'timestamp': datetime.utcnow().isoformat()
        })

    def _simulate_rfid_scan(self):
        """Simulate RFID reader scan"""
        zone = random.choice(self.warehouse_zones)
        products_in_zone = [p for p in self.products if p['location'] == zone]

        if products_in_zone:
            product = random.choice(products_in_zone)
            self._publish_event('inventory-physical', {
                'product_id': product['product_id'],
                'location': zone,
                'quantity': product['quantity'],
                'rfid_tag': product['rfid_tag'],
                'rfid_detected': True,
                'sensor_id': f"RFID-{zone}",
                'timestamp': datetime.utcnow().isoformat()
            })

    def _publish_event(self, topic: str, data: Dict):
        """Publish event to Kafka"""
        self.producer.produce(
            topic,
            key=data.get('product_id', str(uuid.uuid4())).encode('utf-8'),
            value=json.dumps(data).encode('utf-8')
        )
        self.producer.poll(0)

# Tasks:
□ Implement normal operations simulation
□ Implement JD.com attack scenario
□ Add other fraud scenarios
□ Test data generation
□ Verify Kafka publishing

# Validation:
✓ Mock data generates correctly
✓ JD.com scenario triggers expected alerts
✓ Data flows to Kafka topics
```

**2.3 External API Data Ingestion** ⏱️ 1 hour
```python
# File: backend/confluent/connectors/external_apis.py

import requests
import json
from datetime import datetime
from confluent_kafka import Producer
from typing import List, Dict
import os

class ExternalAPIConnector:
    """
    Fetch data from external APIs and stream to Kafka
    - News APIs (crime reports, business news)
    - Social media (Twitter, Reddit)
    - Weather (for predictive analysis)
    """

    def __init__(self, kafka_producer: Producer):
        self.producer = kafka_producer
        self.news_api_key = os.getenv('NEWS_API_KEY')
        self.twitter_bearer_token = os.getenv('TWITTER_BEARER_TOKEN')

    def fetch_crime_news(self, location: str = 'Paris, France') -> List[Dict]:
        """
        Fetch crime-related news for location
        Using NewsAPI.org
        """
        url = 'https://newsapi.org/v2/everything'
        params = {
            'q': f'robbery OR theft OR crime AND {location}',
            'apiKey': self.news_api_key,
            'language': 'en',
            'sortBy': 'publishedAt',
            'pageSize': 20
        }

        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            articles = response.json().get('articles', [])

            for article in articles:
                event = {
                    'source': 'newsapi',
                    'title': article.get('title'),
                    'content': article.get('description'),
                    'url': article.get('url'),
                    'published_at': article.get('publishedAt'),
                    'location': location,
                    'category': 'crime_news',
                    'sentiment': self._analyze_sentiment(article.get('title', '') + ' ' + article.get('description', '')),
                    'timestamp': datetime.utcnow().isoformat()
                }

                # Publish to Kafka
                self.producer.produce(
                    'social-media-feed',
                    value=json.dumps(event).encode('utf-8')
                )

            self.producer.flush()
            return articles

        except Exception as e:
            print(f"Error fetching news: {e}")
            return []

    def fetch_twitter_mentions(self, keywords: List[str]) -> List[Dict]:
        """
        Fetch recent tweets mentioning keywords
        Using Twitter API v2
        """
        # Mock implementation (use real Twitter API in production)
        mock_tweets = [
            {
                'text': 'Warehouse robbery in industrial zone last night',
                'created_at': datetime.utcnow().isoformat(),
                'location': 'Paris',
                'engagement': 45
            },
            {
                'text': 'Increased security concerns during holiday season',
                'created_at': datetime.utcnow().isoformat(),
                'location': 'France',
                'engagement': 120
            }
        ]

        for tweet in mock_tweets:
            event = {
                'source': 'twitter',
                'content': tweet['text'],
                'location': tweet.get('location'),
                'engagement_score': tweet.get('engagement'),
                'sentiment': self._analyze_sentiment(tweet['text']),
                'category': 'social_media',
                'timestamp': tweet['created_at']
            }

            self.producer.produce(
                'social-media-feed',
                value=json.dumps(event).encode('utf-8')
            )

        self.producer.flush()
        return mock_tweets

    def _analyze_sentiment(self, text: str) -> float:
        """
        Simple sentiment analysis
        Returns: -1.0 to 1.0 (negative to positive)
        """
        # Mock implementation - use real sentiment analysis in production
        negative_keywords = ['robbery', 'theft', 'crime', 'danger', 'risk', 'threat']
        positive_keywords = ['safe', 'secure', 'protected', 'prevention']

        text_lower = text.lower()
        neg_count = sum(1 for word in negative_keywords if word in text_lower)
        pos_count = sum(1 for word in positive_keywords if word in text_lower)

        if neg_count + pos_count == 0:
            return 0.0

        sentiment = (pos_count - neg_count) / (pos_count + neg_count)
        return round(sentiment, 2)

    def start_continuous_feed(self, interval_seconds: int = 300):
        """
        Start continuous data fetching
        Run this in background thread/process
        """
        import time
        while True:
            print(f"[{datetime.now()}] Fetching external data...")
            self.fetch_crime_news()
            self.fetch_twitter_mentions(['warehouse', 'robbery', 'theft'])
            time.sleep(interval_seconds)

# Tasks:
□ Implement NewsAPI integration
□ Add mock social media data
□ Create continuous feed mechanism
□ Test API connections
□ Handle rate limits gracefully

# Validation:
✓ External data fetched successfully
✓ Data published to Kafka
✓ Sentiment analysis working
```

#### Afternoon (4 hours) - Flink SQL Stream Processing

**2.4 Flink SQL Jobs for Real-Time Processing** ⏱️ 2 hours
```sql
-- File: backend/confluent/flink_jobs/inventory_reconciliation.sql

-- Create Flink SQL tables from Kafka topics

-- Physical Inventory Source
CREATE TABLE physical_inventory (
    product_id STRING,
    location STRING,
    quantity INT,
    weight_kg DOUBLE,
    rfid_detected BOOLEAN,
    sensor_id STRING,
    event_time TIMESTAMP(3),
    WATERMARK FOR event_time AS event_time - INTERVAL '5' SECOND
) WITH (
    'connector' = 'kafka',
    'topic' = 'inventory-physical',
    'properties.bootstrap.servers' = '<confluent-bootstrap-server>',
    'properties.group.id' = 'flink-physical-inventory',
    'format' = 'json',
    'scan.startup.mode' = 'latest-offset'
);

-- Digital Inventory Source
CREATE TABLE digital_inventory (
    product_id STRING,
    status STRING,
    quantity INT,
    location STRING,
    updated_by STRING,
    updated_at TIMESTAMP(3),
    shipment_id STRING,
    WATERMARK FOR updated_at AS updated_at - INTERVAL '5' SECOND
) WITH (
    'connector' = 'kafka',
    'topic' = 'inventory-digital',
    'properties.bootstrap.servers' = '<confluent-bootstrap-server>',
    'properties.group.id' = 'flink-digital-inventory',
    'format' = 'json',
    'scan.startup.mode' = 'latest-offset'
);

-- Shipping Logistics Source
CREATE TABLE shipping_logistics (
    shipment_id STRING,
    truck_id STRING,
    departure_time TIMESTAMP(3),
    manifest ARRAY<STRING>,
    destination STRING,
    WATERMARK FOR departure_time AS departure_time - INTERVAL '5' SECOND
) WITH (
    'connector' = 'kafka',
    'topic' = 'shipping-logistics',
    'properties.bootstrap.servers' = '<confluent-bootstrap-server>',
    'properties.group.id' = 'flink-shipping',
    'format' = 'json',
    'scan.startup.mode' = 'latest-offset'
);

-- Employee Activity Source
CREATE TABLE employee_activity (
    employee_id STRING,
    action STRING,
    resource STRING,
    location STRING,
    ip_address STRING,
    is_after_hours BOOLEAN,
    event_time TIMESTAMP(3),
    WATERMARK FOR event_time AS event_time - INTERVAL '5' SECOND
) WITH (
    'connector' = 'kafka',
    'topic' = 'employee-activity',
    'properties.bootstrap.servers' = '<confluent-bootstrap-server>',
    'properties.group.id' = 'flink-employee-activity',
    'format' = 'json',
    'scan.startup.mode' = 'latest-offset'
);

-- Fraud Alerts Sink
CREATE TABLE fraud_alerts (
    alert_id STRING,
    alert_type STRING,
    severity STRING,
    description STRING,
    evidence STRING,
    recommended_actions ARRAY<STRING>,
    timestamp_detected TIMESTAMP(3)
) WITH (
    'connector' = 'kafka',
    'topic' = 'fraud-alerts',
    'properties.bootstrap.servers' = '<confluent-bootstrap-server>',
    'format' = 'json'
);

------------------------------------------------------------
-- FRAUD DETECTION QUERY 1: Physical-Digital Mismatch
------------------------------------------------------------

INSERT INTO fraud_alerts
SELECT
    UUID() as alert_id,
    'INVENTORY_MISMATCH' as alert_type,
    CASE
        WHEN ABS(d.quantity - p.quantity) > 50 THEN 'critical'
        WHEN ABS(d.quantity - p.quantity) > 20 THEN 'high'
        WHEN ABS(d.quantity - p.quantity) > 5 THEN 'medium'
        ELSE 'low'
    END as severity,
    CONCAT(
        'Inventory discrepancy detected: Product ',
        d.product_id,
        ' shows ', d.quantity, ' units in system but ',
        p.quantity, ' units physically detected'
    ) as description,
    JSON_OBJECT(
        'product_id', d.product_id,
        'digital_quantity', d.quantity,
        'physical_quantity', p.quantity,
        'digital_status', d.status,
        'physical_location', p.location,
        'digital_location', d.location,
        'updated_by', d.updated_by
    ) as evidence,
    ARRAY[
        'Immediate physical inventory count',
        'Review recent transactions',
        'Check employee access logs',
        'Verify shipment records'
    ] as recommended_actions,
    CURRENT_TIMESTAMP as timestamp_detected
FROM digital_inventory d
INNER JOIN physical_inventory p
    ON d.product_id = p.product_id
    AND d.updated_at BETWEEN p.event_time - INTERVAL '2' MINUTE
                          AND p.event_time + INTERVAL '2' MINUTE
WHERE
    ABS(d.quantity - p.quantity) > 5
    OR (d.status IN ('shipped', 'delivered') AND p.rfid_detected = TRUE);

------------------------------------------------------------
-- FRAUD DETECTION QUERY 2: JD.com Attack Pattern
-- Detects mass status changes without shipping logistics
------------------------------------------------------------

INSERT INTO fraud_alerts
SELECT
    UUID() as alert_id,
    'MASS_SHIPMENT_FRAUD' as alert_type,
    'critical' as severity,
    CONCAT(
        'CRITICAL: ',
        COUNT(DISTINCT d.product_id),
        ' items marked shipped without corresponding truck departure. ',
        'Potential QR code fraud attack similar to JD.com incident.'
    ) as description,
    JSON_OBJECT(
        'items_affected', COUNT(DISTINCT d.product_id),
        'time_window', '10_minutes',
        'updated_by', ANY_VALUE(d.updated_by),
        'shipment_ids', ARRAY_AGG(d.shipment_id),
        'actual_shipments', 0
    ) as evidence,
    ARRAY[
        'IMMEDIATE: Lock all warehouse exits',
        'IMMEDIATE: Freeze inventory transactions',
        'Dispatch security to warehouse floor',
        'Review surveillance footage',
        'Investigate employee access',
        'Contact law enforcement if confirmed'
    ] as recommended_actions,
    CURRENT_TIMESTAMP as timestamp_detected
FROM digital_inventory d
LEFT JOIN shipping_logistics s
    ON d.shipment_id = s.shipment_id
    AND s.departure_time BETWEEN d.updated_at - INTERVAL '10' MINUTE
                              AND d.updated_at + INTERVAL '10' MINUTE
WHERE
    d.status IN ('shipped', 'in_transit')
    AND s.shipment_id IS NULL  -- No matching shipment!
    AND d.updated_at > CURRENT_TIMESTAMP - INTERVAL '10' MINUTE
GROUP BY
    TUMBLING(d.updated_at, INTERVAL '10' MINUTE)
HAVING
    COUNT(DISTINCT d.product_id) > 20;  -- Mass change threshold

------------------------------------------------------------
-- FRAUD DETECTION QUERY 3: After-Hours Suspicious Activity
------------------------------------------------------------

INSERT INTO fraud_alerts
SELECT
    UUID() as alert_id,
    'AFTER_HOURS_QR_MANIPULATION' as alert_type,
    'high' as severity,
    CONCAT(
        'Suspicious after-hours activity: Employee ',
        e.employee_id,
        ' accessed QR system and modified ',
        COUNT(DISTINCT e.resource),
        ' records at ',
        CAST(e.event_time AS STRING)
    ) as description,
    JSON_OBJECT(
        'employee_id', e.employee_id,
        'actions', COUNT(*),
        'resources_accessed', ARRAY_AGG(e.resource),
        'location', e.location,
        'time', CAST(MIN(e.event_time) AS STRING)
    ) as evidence,
    ARRAY[
        'Notify security immediately',
        'Review employee background',
        'Check physical presence in warehouse',
        'Monitor ongoing activity',
        'Prepare incident report'
    ] as recommended_actions,
    CURRENT_TIMESTAMP as timestamp_detected
FROM employee_activity e
WHERE
    e.is_after_hours = TRUE
    AND e.action IN ('access_qr_system', 'qr_regenerated', 'inventory_update')
    AND e.event_time > CURRENT_TIMESTAMP - INTERVAL '30' MINUTE
GROUP BY
    e.employee_id,
    e.location,
    e.event_time,
    TUMBLING(e.event_time, INTERVAL '15' MINUTE)
HAVING
    COUNT(*) > 5;

------------------------------------------------------------
-- QUERY 4: Real-Time Inventory Dashboard
-- Continuous aggregation for dashboard
------------------------------------------------------------

CREATE VIEW inventory_dashboard AS
SELECT
    p.location,
    COUNT(DISTINCT p.product_id) as total_products,
    SUM(p.quantity) as physical_count,
    SUM(CASE WHEN d.status = 'in_stock' THEN d.quantity ELSE 0 END) as digital_count,
    SUM(p.weight_kg) as total_weight_kg,
    SUM(CASE
        WHEN ABS(COALESCE(d.quantity, 0) - p.quantity) > 0
        THEN 1 ELSE 0
    END) as discrepancies,
    MAX(p.event_time) as last_updated
FROM physical_inventory p
LEFT JOIN digital_inventory d
    ON p.product_id = d.product_id
    AND d.updated_at BETWEEN p.event_time - INTERVAL '5' MINUTE
                          AND p.event_time + INTERVAL '5' MINUTE
WHERE
    p.event_time > CURRENT_TIMESTAMP - INTERVAL '1' HOUR
GROUP BY
    p.location,
    TUMBLING(p.event_time, INTERVAL '5' MINUTE);

# Tasks:
□ Create all Flink SQL tables
□ Implement fraud detection queries
□ Test queries with mock data
□ Verify alerts are generated correctly
□ Optimize query performance

# Validation:
✓ Flink SQL jobs running
✓ Fraud alerts trigger on attack scenarios
✓ Dashboard view updates in real-time
✓ No query errors
```

**2.5 Kafka Connect Setup** ⏱️ 1 hour
```json
// File: backend/confluent/connectors/bigquery_sink_config.json

{
  "name": "business-guardian-bigquery-sink",
  "config": {
    "connector.class": "com.wepay.kafka.connect.bigquery.BigQuerySinkConnector",
    "tasks.max": "1",
    "topics": "fraud-alerts,qr-code-scans,inventory-digital",
    "sanitizeTopics": "true",
    "autoCreateTables": "true",
    "autoUpdateSchemas": "true",
    "schemaRetriever": "com.wepay.kafka.connect.bigquery.retrieve.IdentitySchemaRetriever",
    "project": "business-guardian-ai",
    "defaultDataset": "business_guardian",
    "keyfile": "/path/to/service-account-key.json",
    "key.converter": "org.apache.kafka.connect.storage.StringConverter",
    "value.converter": "org.apache.kafka.connect.json.JsonConverter",
    "value.converter.schemas.enable": "false"
  }
}

# Tasks:
□ Set up BigQuery Sink Connector in Confluent Cloud
□ Configure connector with correct credentials
□ Test data flow to BigQuery
□ Verify tables are created automatically
□ Monitor connector status

# Validation:
✓ Connector running without errors
✓ Data appearing in BigQuery tables
✓ Schema auto-update working
```

**2.6 Test End-to-End Data Pipeline** ⏱️ 1 hour
```python
# File: tests/integration/test_data_pipeline.py

import pytest
import time
import json
from confluent_kafka import Consumer, Producer
from backend.services.qr_verification.qr_system import SecureQRCodeSystem
from data.mock_generators.iot_sensors import IoTSensorSimulator

def test_qr_code_generation_to_kafka():
    """Test QR code generation flows to Kafka"""
    producer = get_kafka_producer()
    qr_system = SecureQRCodeSystem(producer, secret_key="test-key")

    # Generate QR code
    qr_data = qr_system.generate_qr_code(
        product_id="TEST-123",
        location="warehouse-A",
        employee_id="EMP-TEST"
    )

    # Verify QR data structure
    assert 'qr_id' in qr_data
    assert 'hash_signature' in qr_data
    assert qr_data['product_id'] == "TEST-123"

    # Consume from Kafka and verify
    consumer = get_kafka_consumer('qr-code-scans')
    msg = consumer.poll(timeout=5.0)

    assert msg is not None
    event = json.loads(msg.value())
    assert event['product_id'] == "TEST-123"

def test_fraud_detection_triggers_alert():
    """Test that fraud scenario triggers alert"""
    producer = get_kafka_producer()
    simulator = IoTSensorSimulator(producer)

    # Run JD.com attack scenario
    simulator.simulate_fraud_scenario('jd_com_attack')

    # Wait for Flink SQL processing
    time.sleep(10)

    # Check fraud-alerts topic
    consumer = get_kafka_consumer('fraud-alerts')
    alerts = []

    for _ in range(5):  # Check for alerts
        msg = consumer.poll(timeout=2.0)
        if msg:
            alert = json.loads(msg.value())
            alerts.append(alert)

    # Verify alert was triggered
    assert len(alerts) > 0
    assert any(alert['alert_type'] == 'MASS_SHIPMENT_FRAUD' for alert in alerts)

    critical_alerts = [a for a in alerts if a['severity'] == 'critical']
    assert len(critical_alerts) > 0

def test_bigquery_data_sink():
    """Test data flows to BigQuery"""
    from google.cloud import bigquery

    client = bigquery.Client(project="business-guardian-ai")

    # Query recent alerts from BigQuery
    query = """
        SELECT COUNT(*) as alert_count
        FROM business_guardian.fraud_alerts
        WHERE created_at > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)
    """

    results = client.query(query).result()
    row = next(results)

    assert row.alert_count >= 0  # Should have data

# Tasks:
□ Write integration tests
□ Test QR code flow
□ Test fraud detection
□ Test BigQuery sink
□ Run all tests and fix issues

# Validation:
✓ All tests passing
✓ End-to-end pipeline working
✓ Data flowing correctly
```

#### Evening Wrap-up (1 hour)

```bash
# End of Day 2 Checklist:
□ QR code generation system implemented
□ Mock data generators working
□ IoT sensor simulation complete
□ External API connectors functional
□ Flink SQL jobs deployed and running
□ Kafka Connect configured
□ BigQuery sink operational
□ Integration tests passing
□ Data pipeline fully functional

# Git Commit:
git add .
git commit -m "Day 2: Complete data ingestion and streaming pipeline"
git push origin main

# Validation:
□ Run mock JD.com attack scenario
□ Verify fraud alerts are generated
□ Check BigQuery for data
□ Review Confluent Cloud metrics
```

---

### **DAY 3-4: ML/AI Development**

[Continue with detailed breakdown for remaining days...]

---

## Quick Reference

### Environment Variables
```bash
# .env file structure
CONFLUENT_BOOTSTRAP_SERVER=pkc-xxxxx.us-west-2.aws.confluent.cloud:9092
CONFLUENT_API_KEY=xxxxx
CONFLUENT_API_SECRET=xxxxx
CONFLUENT_CLUSTER_ID=lkc-xxxxx

GOOGLE_CLOUD_PROJECT=business-guardian-ai
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

NEWS_API_KEY=xxxxx
TWITTER_BEARER_TOKEN=xxxxx

QR_SECRET_KEY=your-secret-key-here
JWT_SECRET=your-jwt-secret
```

### Key Commands
```bash
# Start mock data generation
python data/mock_generators/run_simulation.py

# Run JD.com attack scenario
python scripts/simulate_jd_attack.py

# Test fraud detection
pytest tests/integration/test_fraud_detection.py

# Deploy to Cloud Run
./scripts/deploy.sh

# Check Kafka topics
confluent kafka topic list

# Monitor Flink jobs
confluent flink statement list
```

---

## Success Metrics

**Technical Targets:**
- ✅ <100ms alert latency
- ✅ 95%+ fraud detection accuracy
- ✅ Zero data loss (Kafka reliability)
- ✅ Processes 1000+ events/second

**Hackathon Targets:**
- ✅ Working demo of JD.com attack prevention
- ✅ Professional dashboard
- ✅ 3-minute compelling video
- ✅ Complete documentation
- ✅ Public GitHub repo with MIT license
- ✅ Deployed live application

---

*This roadmap will be continuously updated as implementation progresses.*
