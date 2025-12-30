"""
Business Guardian AI - Gemini AI Alert Generation Service
Uses Google Gemini to generate intelligent, actionable fraud alerts
"""

import os
import sys
import json
import time
from typing import Dict, List
from dotenv import load_dotenv
import google.generativeai as genai
from confluent_kafka import Consumer, Producer

load_dotenv()


class GeminiAlertService:
    """
    Intelligent alert generation using Google Gemini

    Features:
    - Natural language alert descriptions
    - Actionable recommendations
    - Evidence summarization
    - Risk assessment explanations
    - Prevention strategies
    """

    def __init__(self):
        """Initialize Gemini alert service"""
        # Configure Gemini
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment")

        genai.configure(api_key=api_key)

        # Use Gemini 2.5 Flash for fast, cost-effective generation
        self.model = genai.GenerativeModel('models/gemini-2.5-flash')

        print("[OK] Gemini AI configured")

        # Kafka configuration
        conf = {
            'bootstrap.servers': os.getenv('CONFLUENT_BOOTSTRAP_SERVER'),
            'security.protocol': 'SASL_SSL',
            'sasl.mechanisms': 'PLAIN',
            'sasl.username': os.getenv('CONFLUENT_API_KEY'),
            'sasl.password': os.getenv('CONFLUENT_API_SECRET'),
        }

        # Consumer for fraud alerts
        consumer_conf = {
            **conf,
            'group.id': 'gemini-alert-service',
            'auto.offset.reset': 'latest',
            'enable.auto.commit': True,
        }

        # Producer for enhanced alerts
        producer_conf = {
            **conf,
            'client.id': 'gemini-alert-producer',
            'acks': 'all',
            'compression.type': 'snappy'
        }

        self.consumer = Consumer(consumer_conf)
        self.producer = Producer(producer_conf)

        # Subscribe to fraud alerts
        self.consumer.subscribe(['fraud-alerts', 'ml-predictions'])

        print("[OK] Gemini Alert Service initialized")
        print("[>] Subscribed to: fraud-alerts, ml-predictions")
        print("[>] Publishing to: system-events (enhanced alerts)")
        print()

    def generate_alert_description(self, alert: Dict) -> str:
        """
        Generate intelligent alert description using Gemini

        Args:
            alert: Fraud alert data

        Returns:
            AI-generated description
        """
        # Build prompt for Gemini
        prompt = f"""
You are a security analyst for Business Guardian AI, a fraud detection system for warehouses.

A fraud alert has been detected. Generate a concise, professional alert description for security personnel.

**Alert Details:**
- Alert Type: {alert.get('alert_type', 'unknown')}
- Severity: {alert.get('severity', 'medium')}
- Location: {alert.get('location', 'unknown')}
- Product: {alert.get('product_name', 'unknown')} (ID: {alert.get('product_id', 'unknown')})
- Threat Score: {alert.get('threat_score', 0)}/100

**Evidence:**
{chr(10).join(['- ' + str(e) for e in alert.get('evidence', [])])}

**Context:**
This system prevents sophisticated warehouse fraud attacks where thieves modify QR codes and steal high-value electronics.

**Task:**
Generate a 2-3 sentence alert description that:
1. Explains WHAT happened in clear terms
2. States WHY it's suspicious
3. Suggests IMMEDIATE ACTION

Be specific, actionable, and urgent if severity is high/critical.
"""

        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"[WARN] Gemini generation failed: {e}")
            # Fallback to template
            return self._generate_template_description(alert)

    def generate_recommendations(self, alert: Dict) -> List[str]:
        """
        Generate actionable recommendations using Gemini

        Returns:
            List of recommended actions
        """
        prompt = f"""
Based on this fraud alert, provide 3-4 specific, actionable recommendations for warehouse security:

Alert Type: {alert.get('alert_type', 'unknown')}
Severity: {alert.get('severity', 'medium')}
Threat Score: {alert.get('threat_score', 0)}/100

Evidence:
{chr(10).join(['- ' + str(e) for e in alert.get('evidence', [])])}

Format as a numbered list. Be specific and actionable.
"""

        try:
            response = self.model.generate_content(prompt)
            # Parse numbered list
            recommendations = []
            for line in response.text.strip().split('\n'):
                line = line.strip()
                if line and (line[0].isdigit() or line.startswith('-')):
                    # Remove numbering
                    rec = line.lstrip('0123456789.-) ').strip()
                    if rec:
                        recommendations.append(rec)
            return recommendations[:4]  # Max 4
        except Exception as e:
            print(f"[WARN] Gemini recommendations failed: {e}")
            return self._generate_template_recommendations(alert)

    def explain_fraud_pattern(self, alert: Dict) -> str:
        """
        Explain the fraud pattern detected

        Returns:
            Explanation of the attack pattern
        """
        prompt = f"""
Explain this fraud pattern in 1-2 sentences for a security report:

Alert Type: {alert.get('alert_type', 'unknown')}
Evidence: {', '.join([str(e) for e in alert.get('evidence', [])][:3])}

Focus on HOW this attack works and WHY it's dangerous.
"""

        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"[WARN] Gemini pattern explanation failed: {e}")
            return "Fraudulent activity detected based on multiple security indicators."

    def _generate_template_description(self, alert: Dict) -> str:
        """Fallback template-based description"""
        severity = alert.get('severity', 'medium').upper()
        alert_type = alert.get('alert_type', 'unknown').replace('_', ' ').title()
        location = alert.get('location', 'unknown location')
        product = alert.get('product_name', 'unknown product')

        return (f"{severity} ALERT: {alert_type} detected at {location}. "
                f"Product '{product}' shows suspicious activity. "
                f"Immediate security review required.")

    def _generate_template_recommendations(self, alert: Dict) -> List[str]:
        """Fallback template-based recommendations"""
        recommendations = [
            "Review security camera footage for the affected location",
            "Verify physical inventory matches digital records",
            "Interview staff who accessed the area recently",
            "Enhance monitoring for similar patterns"
        ]

        if alert.get('severity') == 'critical':
            recommendations.insert(0, "IMMEDIATELY block all exits and secure the warehouse")

        return recommendations[:4]

    def enhance_alert(self, alert: Dict) -> Dict:
        """
        Enhance alert with Gemini AI insights

        Args:
            alert: Original fraud alert

        Returns:
            Enhanced alert with AI-generated content
        """
        print(f"\n[*] Enhancing alert: {alert.get('alert_id', 'unknown')}")
        print(f"[i] Severity: {alert.get('severity', 'unknown')}, Threat: {alert.get('threat_score', 0)}/100")

        # Generate AI content
        ai_description = self.generate_alert_description(alert)
        recommendations = self.generate_recommendations(alert)
        pattern_explanation = self.explain_fraud_pattern(alert)

        # Build enhanced alert
        enhanced = {
            **alert,  # Include original data
            'ai_generated': {
                'description': ai_description,
                'recommendations': recommendations,
                'pattern_explanation': pattern_explanation,
                'generated_at': int(time.time()),
                'model': 'gemini-2.5-flash'
            },
            'enhanced_by': 'gemini-alert-service'
        }

        print(f"[OK] Alert enhanced")
        print(f"     AI Description: {ai_description[:100]}...")

        return enhanced

    def publish_enhanced_alert(self, enhanced_alert: Dict):
        """Publish enhanced alert to Kafka"""
        try:
            self.producer.produce(
                topic='system-events',
                key=enhanced_alert.get('alert_id', 'unknown'),
                value=json.dumps(enhanced_alert)
            )
            self.producer.poll(0)
            print(f"[OK] Enhanced alert published to system-events topic")
        except Exception as e:
            print(f"[ERROR] Failed to publish: {e}")

    def process_alert(self, msg):
        """Process incoming alert"""
        try:
            alert = json.loads(msg.value().decode('utf-8'))

            # Only enhance high-priority alerts
            severity = alert.get('severity', 'medium')
            if severity in ['high', 'critical']:
                enhanced = self.enhance_alert(alert)
                self.publish_enhanced_alert(enhanced)

        except Exception as e:
            print(f"[ERROR] Failed to process alert: {e}")

    def run(self):
        """Start processing alerts"""
        print("[*] Gemini Alert Service running...")
        print("[i] Waiting for fraud alerts...")
        print()

        try:
            alert_count = 0

            while True:
                msg = self.consumer.poll(1.0)

                if msg is None:
                    continue

                if msg.error():
                    continue

                self.process_alert(msg)

                alert_count += 1

        except KeyboardInterrupt:
            print("\n[WARN] Service interrupted by user")
        finally:
            self.consumer.close()
            self.producer.flush()
            print("[i] Gemini Alert Service stopped")


def demo_gemini_alerts():
    """Demo Gemini alert generation without Kafka"""
    print("[*] Business Guardian AI - Gemini Alert Generation Demo")
    print("=" * 70)
    print()

    # Initialize Gemini
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("[ERROR] GEMINI_API_KEY not found")
        return

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('models/gemini-2.5-flash')

    # Sample fraud alert
    sample_alert = {
        'alert_id': 'EXIT-BLOCK-123',
        'alert_type': 'unauthorized_exit',
        'severity': 'critical',
        'title': 'Invalid QR Code at Exit Gate',
        'product_id': '3C-LAPTOP-001',
        'product_name': 'Dell XPS 15 Laptop',
        'location': 'Exit Gate A',
        'threat_score': 98.5,
        'evidence': [
            'QR code cryptographic signature mismatch',
            'Product value: $1,299.99',
            'Weight sensor detected 20 items missing from shelf',
            'Camera detected suspicious activity',
            'Attempt to exit during night shift'
        ]
    }

    print("[DEMO] Generating AI alert for:")
    print(f"  Product: {sample_alert['product_name']}")
    print(f"  Severity: {sample_alert['severity'].upper()}")
    print(f"  Threat Score: {sample_alert['threat_score']}/100")
    print()

    # Generate description
    print("[*] Generating alert description...")
    prompt_desc = f"""
You are a security analyst. Generate a 2-3 sentence alert for security personnel:

Alert: {sample_alert['alert_type']} - {sample_alert['severity']}
Product: {sample_alert['product_name']}
Evidence: {', '.join(sample_alert['evidence'][:3])}

Be urgent, specific, and actionable.
"""

    response_desc = model.generate_content(prompt_desc)
    print(f"\n[AI DESCRIPTION]")
    print(response_desc.text)

    # Generate recommendations
    print("\n[*] Generating recommendations...")
    prompt_rec = f"""
Provide 4 specific actions for this security alert:

{sample_alert['severity'].upper()} - {sample_alert['alert_type']}
Evidence: {chr(10).join(['- ' + e for e in sample_alert['evidence']])}

Format as numbered list.
"""

    response_rec = model.generate_content(prompt_rec)
    print(f"\n[AI RECOMMENDATIONS]")
    print(response_rec.text)

    print("\n" + "=" * 70)
    print("[SUCCESS] Gemini alert generation demo complete!")
    print()


def main():
    """Main entry point"""
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == 'demo':
        demo_gemini_alerts()
    else:
        try:
            service = GeminiAlertService()
            service.run()
        except Exception as e:
            print(f"\n[ERROR] Service failed: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)


if __name__ == '__main__':
    main()
