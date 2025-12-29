-- Business Guardian AI - Flink SQL Table Definitions
-- Define Kafka topics as Flink SQL tables for stream processing

-- ==================================================
-- QR Code Scan Events Table
-- ==================================================
CREATE TABLE qr_code_scans (
    event_type STRING,
    timestamp BIGINT,
    qr_id STRING,
    is_valid BOOLEAN,
    threat_level STRING,
    reason STRING,
    scan_location STRING,
    product_info ROW<
        product_id STRING,
        name STRING,
        category STRING,
        value DOUBLE,
        warehouse_location STRING
    >,
    fraud_indicators ARRAY<ROW<
        type STRING,
        severity STRING,
        description STRING
    >>,
    alert BOOLEAN,
    event_time AS TO_TIMESTAMP_LTZ(timestamp, 3),
    WATERMARK FOR event_time AS event_time - INTERVAL '5' SECOND
) WITH (
    'connector' = 'kafka',
    'topic' = 'qr-code-scans',
    'properties.bootstrap.servers' = '${CONFLUENT_BOOTSTRAP_SERVER}',
    'properties.security.protocol' = 'SASL_SSL',
    'properties.sasl.mechanism' = 'PLAIN',
    'properties.sasl.jaas.config' = 'org.apache.kafka.common.security.plain.PlainLoginModule required username="${CONFLUENT_API_KEY}" password="${CONFLUENT_API_SECRET}";',
    'scan.startup.mode' = 'earliest-offset',
    'format' = 'json'
);

-- ==================================================
-- Physical Inventory Sensors Table
-- ==================================================
CREATE TABLE inventory_physical (
    event_type STRING,
    sensor_id STRING,
    reader_id STRING,
    camera_id STRING,
    location STRING,
    -- Weight sensor fields
    current_weight_kg DOUBLE,
    previous_weight_kg DOUBLE,
    delta_kg DOUBLE,
    anomaly_detected BOOLEAN,
    expected_items_count INT,
    detected_items_count INT,
    -- RFID fields
    product_id STRING,
    rfid_tag STRING,
    event_type_rfid STRING,
    signal_strength INT,
    -- Camera fields
    detection_type STRING,
    confidence DOUBLE,
    object_count INT,
    alert BOOLEAN,
    timestamp BIGINT,
    event_time AS TO_TIMESTAMP_LTZ(timestamp, 3),
    WATERMARK FOR event_time AS event_time - INTERVAL '5' SECOND
) WITH (
    'connector' = 'kafka',
    'topic' = 'inventory-physical',
    'properties.bootstrap.servers' = '${CONFLUENT_BOOTSTRAP_SERVER}',
    'properties.security.protocol' = 'SASL_SSL',
    'properties.sasl.mechanism' = 'PLAIN',
    'properties.sasl.jaas.config' = 'org.apache.kafka.common.security.plain.PlainLoginModule required username="${CONFLUENT_API_KEY}" password="${CONFLUENT_API_SECRET}";',
    'scan.startup.mode' = 'earliest-offset',
    'format' = 'json'
);

-- ==================================================
-- Digital Inventory (ERP) Table
-- ==================================================
CREATE TABLE inventory_digital (
    event_type STRING,
    -- Inventory snapshot fields
    product_id STRING,
    product_name STRING,
    category STRING,
    sku STRING,
    location STRING,
    quantity_on_hand INT,
    quantity_reserved INT,
    quantity_available INT,
    last_updated BIGINT,
    status STRING,
    warehouse_id STRING,
    -- Transaction fields
    transaction_id STRING,
    transaction_type STRING,
    quantity_change INT,
    new_quantity INT,
    user_id STRING,
    notes STRING,
    timestamp BIGINT,
    event_time AS TO_TIMESTAMP_LTZ(COALESCE(timestamp, last_updated), 3),
    WATERMARK FOR event_time AS event_time - INTERVAL '5' SECOND
) WITH (
    'connector' = 'kafka',
    'topic' = 'inventory-digital',
    'properties.bootstrap.servers' = '${CONFLUENT_BOOTSTRAP_SERVER}',
    'properties.security.protocol' = 'SASL_SSL',
    'properties.sasl.mechanism' = 'PLAIN',
    'properties.sasl.jaas.config' = 'org.apache.kafka.common.security.plain.PlainLoginModule required username="${CONFLUENT_API_KEY}" password="${CONFLUENT_API_SECRET}";',
    'scan.startup.mode' = 'earliest-offset',
    'format' = 'json'
);

-- ==================================================
-- Fraud Alerts Output Table
-- ==================================================
CREATE TABLE fraud_alerts (
    alert_id STRING,
    alert_type STRING,
    severity STRING,  -- 'low', 'medium', 'high', 'critical'
    title STRING,
    description STRING,
    product_id STRING,
    product_name STRING,
    location STRING,
    evidence ARRAY<STRING>,
    threat_score DOUBLE,
    timestamp_detected BIGINT,
    requires_action BOOLEAN,
    PRIMARY KEY (alert_id) NOT ENFORCED
) WITH (
    'connector' = 'upsert-kafka',
    'topic' = 'fraud-alerts',
    'properties.bootstrap.servers' = '${CONFLUENT_BOOTSTRAP_SERVER}',
    'properties.security.protocol' = 'SASL_SSL',
    'properties.sasl.mechanism' = 'PLAIN',
    'properties.sasl.jaas.config' = 'org.apache.kafka.common.security.plain.PlainLoginModule required username="${CONFLUENT_API_KEY}" password="${CONFLUENT_API_SECRET}";',
    'key.format' = 'json',
    'value.format' = 'json'
);

-- ==================================================
-- Threat Scores Output Table
-- ==================================================
CREATE TABLE threat_scores (
    product_id STRING,
    product_name STRING,
    location STRING,
    threat_score DOUBLE,
    risk_factors ARRAY<STRING>,
    last_updated BIGINT,
    PRIMARY KEY (product_id) NOT ENFORCED
) WITH (
    'connector' = 'upsert-kafka',
    'topic' = 'threat-scores',
    'properties.bootstrap.servers' = '${CONFLUENT_BOOTSTRAP_SERVER}',
    'properties.security.protocol' = 'SASL_SSL',
    'properties.sasl.mechanism' = 'PLAIN',
    'properties.sasl.jaas.config' = 'org.apache.kafka.common.security.plain.PlainLoginModule required username="${CONFLUENT_API_KEY}" password="${CONFLUENT_API_SECRET}";',
    'key.format' = 'json',
    'value.format' = 'json'
);
