-- Business Guardian AI - Real-Time Fraud Detection Queries
-- These queries correlate QR scans, physical sensors, and digital inventory
-- to detect sophisticated warehouse fraud attacks

-- ==================================================
-- QUERY 1: Detect Invalid QR Code Scans
-- ==================================================
-- Immediately flag any QR code that fails cryptographic verification
-- This catches thieves who modify QR codes

INSERT INTO fraud_alerts
SELECT
    CONCAT('QR-INVALID-', qr_id, '-', CAST(UNIX_TIMESTAMP() AS STRING)) AS alert_id,
    'invalid_qr_code' AS alert_type,
    CASE
        WHEN threat_level = 'critical' THEN 'critical'
        WHEN threat_level = 'high' THEN 'high'
        ELSE 'medium'
    END AS severity,
    'Invalid QR Code Detected' AS title,
    CONCAT(
        'QR code ', qr_id, ' failed verification at ', scan_location,
        '. Reason: ', reason, '. Threat level: ', threat_level
    ) AS description,
    product_info.product_id AS product_id,
    product_info.name AS product_name,
    scan_location AS location,
    ARRAY[
        CONCAT('QR verification failed: ', reason),
        CONCAT('Scan location: ', scan_location),
        CONCAT('Product value: $', CAST(product_info.value AS STRING)),
        CONCAT('Fraud indicators: ', CAST(CARDINALITY(fraud_indicators) AS STRING))
    ] AS evidence,
    CASE
        WHEN threat_level = 'critical' THEN 95.0
        WHEN threat_level = 'high' THEN 80.0
        WHEN threat_level = 'medium' THEN 60.0
        ELSE 40.0
    END AS threat_score,
    timestamp AS timestamp_detected,
    TRUE AS requires_action
FROM qr_code_scans
WHERE is_valid = FALSE
AND alert = TRUE;


-- ==================================================
-- QUERY 2: Physical-Digital Inventory Discrepancy Detection
-- ==================================================
-- Detect when physical sensors show missing items but digital
-- records claim they were shipped (warehouse fraud attack pattern!)

INSERT INTO fraud_alerts
SELECT
    CONCAT('INV-MISMATCH-', phys.sensor_id, '-', CAST(UNIX_TIMESTAMP() AS STRING)) AS alert_id,
    'inventory_discrepancy' AS alert_type,
    'critical' AS severity,
    'Physical-Digital Inventory Mismatch Detected' AS title,
    CONCAT(
        'CRITICAL: Physical sensors detect ', CAST(phys.expected_items_count - phys.detected_items_count AS STRING),
        ' missing items at ', phys.location,
        ', but digital records show normal inventory levels. Possible theft in progress!'
    ) AS description,
    dig.product_id AS product_id,
    dig.product_name AS product_name,
    phys.location AS location,
    ARRAY[
        CONCAT('Physical expected: ', CAST(phys.expected_items_count AS STRING), ' items'),
        CONCAT('Physical detected: ', CAST(phys.detected_items_count AS STRING), ' items'),
        CONCAT('Items missing: ', CAST(phys.expected_items_count - phys.detected_items_count AS STRING)),
        CONCAT('Weight drop: ', CAST(phys.delta_kg AS STRING), ' kg'),
        CONCAT('Digital inventory: ', CAST(dig.quantity_on_hand AS STRING), ' units'),
        'ATTACK PATTERN: Matches €37M Paris warehouse fraud scenario'
    ] AS evidence,
    98.0 AS threat_score,  -- Highest priority alert
    phys.timestamp AS timestamp_detected,
    TRUE AS requires_action
FROM inventory_physical phys
INNER JOIN inventory_digital dig
    ON phys.location = dig.location
    AND phys.event_time BETWEEN dig.event_time - INTERVAL '30' SECOND AND dig.event_time + INTERVAL '30' SECOND
WHERE phys.event_type = 'weight_sensor'
AND phys.anomaly_detected = TRUE
AND (phys.expected_items_count - phys.detected_items_count) >= 5  -- At least 5 items missing
AND ABS(phys.delta_kg) > 10.0;  -- Significant weight drop


-- ==================================================
-- QUERY 3: Suspicious User Activity Detection
-- ==================================================
-- Flag fraudulent ERP transactions from compromised accounts

INSERT INTO fraud_alerts
SELECT
    CONCAT('USER-FRAUD-', transaction_id) AS alert_id,
    'suspicious_user' AS alert_type,
    'critical' AS severity,
    'Fraudulent ERP Transaction Detected' AS title,
    CONCAT(
        'ALERT: User "', user_id, '" created suspicious transaction marking ',
        CAST(ABS(quantity_change) AS STRING), ' items as shipped. ',
        'Transaction notes: ', notes
    ) AS description,
    product_id,
    product_name,
    warehouse_id AS location,
    ARRAY[
        CONCAT('Transaction ID: ', transaction_id),
        CONCAT('User ID: ', user_id),
        CONCAT('Type: ', transaction_type),
        CONCAT('Quantity change: ', CAST(quantity_change AS STRING)),
        CONCAT('Notes: ', notes)
    ] AS evidence,
    92.0 AS threat_score,
    timestamp AS timestamp_detected,
    TRUE AS requires_action
FROM inventory_digital
WHERE transaction_type = 'fraud_adjust'
OR (user_id LIKE '%COMPROMISED%' OR user_id LIKE '%UNKNOWN%')
OR (notes LIKE '%FRAUDULENT%' OR notes LIKE '%SUSPICIOUS%');


-- ==================================================
-- QUERY 4: Exit Gate Alert - Invalid QR at Exit
-- ==================================================
-- Critical alert when invalid QR code is scanned at warehouse exit
-- This is the final checkpoint where warehouse fraud attacks must be stopped!

INSERT INTO fraud_alerts
SELECT
    CONCAT('EXIT-BLOCK-', qr_id, '-', CAST(UNIX_TIMESTAMP() AS STRING)) AS alert_id,
    'unauthorized_exit' AS alert_type,
    'critical' AS severity,
    '🚨 BLOCK EXIT - Invalid QR Code at Gate' AS title,
    CONCAT(
        'IMMEDIATE ACTION REQUIRED: Product "', product_info.name,
        '" with invalid QR code detected at exit gate. Value: $', CAST(product_info.value AS STRING),
        '. Verification failed: ', reason
    ) AS description,
    product_info.product_id AS product_id,
    product_info.name AS product_name,
    scan_location AS location,
    ARRAY[
        'EXIT GATE SCAN FAILED',
        CONCAT('Product: ', product_info.name),
        CONCAT('Value: $', CAST(product_info.value AS STRING)),
        CONCAT('Threat level: ', threat_level),
        CONCAT('Failure reason: ', reason),
        'ACTION: SECURITY ALERT - BLOCK EXIT'
    ] AS evidence,
    100.0 AS threat_score,  -- Maximum priority!
    timestamp AS timestamp_detected,
    TRUE AS requires_action
FROM qr_code_scans
WHERE is_valid = FALSE
AND scan_location LIKE '%exit%'
AND product_info.value > 500.0;  -- High-value items


-- ==================================================
-- QUERY 5: Suspicious Camera Activity Correlation
-- ==================================================
-- Correlate suspicious camera detections with inventory anomalies

INSERT INTO fraud_alerts
SELECT
    CONCAT('CAM-ALERT-', cam.camera_id, '-', CAST(UNIX_TIMESTAMP() AS STRING)) AS alert_id,
    'suspicious_activity' AS alert_type,
    'high' AS severity,
    'Suspicious Activity Detected by Security Camera' AS title,
    CONCAT(
        'Camera ', cam.camera_id, ' detected ', cam.detection_type,
        ' with ', CAST(cam.confidence * 100 AS STRING), '% confidence at ', cam.location,
        '. ', CAST(cam.object_count AS STRING), ' objects detected.'
    ) AS description,
    'UNKNOWN' AS product_id,
    'Multiple Products' AS product_name,
    cam.location AS location,
    ARRAY[
        CONCAT('Camera: ', cam.camera_id),
        CONCAT('Detection: ', cam.detection_type),
        CONCAT('Confidence: ', CAST(cam.confidence * 100 AS STRING), '%'),
        CONCAT('Object count: ', CAST(cam.object_count AS STRING)),
        'Recommendation: Security review required'
    ] AS evidence,
    cam.confidence * 85.0 AS threat_score,
    cam.timestamp AS timestamp_detected,
    TRUE AS requires_action
FROM inventory_physical cam
WHERE cam.event_type = 'camera_detection'
AND cam.detection_type = 'suspicious_activity'
AND cam.alert = TRUE
AND cam.confidence > 0.7;


-- ==================================================
-- QUERY 6: Calculate Product-Level Threat Scores
-- ==================================================
-- Aggregate threat indicators for each product over 5-minute windows

INSERT INTO threat_scores
SELECT
    product_info.product_id AS product_id,
    product_info.name AS product_name,
    scan_location AS location,
    AVG(
        CASE
            WHEN threat_level = 'critical' THEN 95.0
            WHEN threat_level = 'high' THEN 80.0
            WHEN threat_level = 'medium' THEN 60.0
            WHEN threat_level = 'low' THEN 30.0
            ELSE 10.0
        END
    ) AS threat_score,
    COLLECT(DISTINCT reason) AS risk_factors,
    MAX(timestamp) AS last_updated
FROM qr_code_scans
WHERE window_start >= CURRENT_TIMESTAMP - INTERVAL '5' MINUTE
GROUP BY
    TUMBLE(event_time, INTERVAL '5' MINUTE),
    product_info.product_id,
    product_info.name,
    scan_location;


-- ==================================================
-- QUERY 7: Real-Time Anomaly Dashboard View
-- ==================================================
-- Create a real-time view of all active threats for the dashboard

CREATE VIEW live_threats AS
SELECT
    alert_id,
    alert_type,
    severity,
    title,
    description,
    product_id,
    product_name,
    location,
    threat_score,
    timestamp_detected,
    CURRENT_TIMESTAMP AS viewed_at
FROM fraud_alerts
WHERE timestamp_detected >= UNIX_TIMESTAMP() - 3600  -- Last hour
AND requires_action = TRUE
ORDER BY threat_score DESC, timestamp_detected DESC
LIMIT 100;


-- ==================================================
-- NOTES FOR DEPLOYMENT
-- ==================================================
-- To deploy these queries in Confluent Cloud:
--
-- 1. Go to Confluent Cloud Console
-- 2. Navigate to your cluster
-- 3. Click "Flink SQL" in the left menu
-- 4. Create a new Flink compute pool
-- 5. Execute 01_create_tables.sql first to create all tables
-- 6. Then execute each INSERT INTO query separately
-- 7. Queries will run continuously, processing streaming data
--
-- Each INSERT INTO query becomes a continuous streaming job that:
-- - Reads from source Kafka topics
-- - Applies fraud detection logic
-- - Writes alerts to output topics in real-time
--
-- The queries use Flink's event time processing with watermarks
-- to handle out-of-order events and ensure accurate results.
