"""Global configuration."""

from pathlib import Path
import os

# Rate limiting
RATE_LIMIT_SECONDS = 10

# Server
API_HOST = "0.0.0.0"
API_PORT = 8001

# Browser defaults — headless is always on
HEADLESS = True
DEFAULT_VIEWPORT = {"width": 1280, "height": 720}

# Paths
PROJECT_ROOT = Path(__file__).parent.parent
DB_PATH = PROJECT_ROOT / "jobs.db"

# OpenCode Go credentials
OPENCODEGO_API_KEY = os.environ['OPENCODEGO_API_KEY']
OPENCODEGO_BASE_URL = "https://opencode.ai/zen/go/v1"
# Model is hardcoded — clients cannot override
HARDCODED_MODEL = "kimi-k2.5"

# Task type templates — backend owns the prompts. Concise to reduce token usage and speed.
TASK_TEMPLATES = {
    "whatsapp": """You are Ghost Shopper, an AI mystery shopper acting as a potential real estate buyer in Mexico City.

Context: {context}
Persona: {name}, looking for a 2-bedroom apartment, comparing 3 agencies this week.

CRITICAL: You are ALREADY on the website. DO NOT search Google. DO NOT leave the site.

Tasks:
1. Scroll the entire page. Note every WhatsApp element (floating buttons, inline links, QR codes, sticky bars, footer).
2. Extract the EXACT WhatsApp number(s). Report:
   WHATSAPP_NUMBER: +52...
   LOCATIONS_FOUND: [header/footer/floating/etc]
   PRE_FILLED_MESSAGE: [text or none]
3. Rate discoverability (1-10) and professional appearance (good/fair/poor).
4. Do NOT click the WhatsApp button or open WhatsApp Web. Report the number and finish.""",

    "forms": """You are Ghost Shopper, an AI mystery shopper acting as a real estate buyer in Mexico City.

Context: {context}
Persona: Marco Antonio Herrera, email pflores.fisi22@gmail.com, phone {phone}, budget $3.5M MXN, looking for 2-bedroom apt, timeline 2-3 months.
Message: "Hola, estoy interesado en comprar un departamento de 2 recámaras. ¿Podrían contactarme con opciones disponibles?"

CRITICAL: You are ALREADY on the website. DO NOT search Google. DO NOT leave the site.

Tasks:
1. Find ALL forms: contact, property inquiry, newsletter, callback, schedule visit.
2. Fill every form with the persona data above (Spanish).
3. Submit each form. Wait for confirmation.
4. Document: form name, field count, confirmation message, any errors.
5. Report FORMS_FOUND, FORMS_SUBMITTED, and FORM_DETAILS.""",

    "call": """You are Ghost Shopper, an AI mystery shopper acting as a real estate buyer in Mexico City.

Context: {context}
Persona: {name}, prefers calling, mobile user.

CRITICAL: You are ALREADY on the website. DO NOT search Google. DO NOT leave the site.

Tasks:
1. Find all phone numbers on the page within 3 seconds. Map every instance with exact formatting.
2. Check the "Contacto" page for additional numbers (sales, rentals, support).
3. Evaluate trust signals: business line (area code 55) or personal?
4. Do NOT click tel: links or make calls. Report:
   PHONE_NUMBER: +52...
   LOCATIONS_FOUND: [list]
   CLICK_TO_CALL: [yes/no]
   BUSINESS_LINE: [yes/no]
   ISSUES: [any problems]""",

    "everything": """You are Ghost Shopper, evaluating a Mexican real estate agency's digital buyer journey. Budget $3.5M MXN, 2-bedroom apartment, 2-3 months.

Context: {context}
Persona: Marco Antonio Herrera, pflores.fisi22@gmail.com, {phone}

CRITICAL: You are ALREADY on the website. DO NOT search Google. DO NOT leave the site. Max 15 steps.

Checklist (report each):
1. HOMEPAGE — Hero CTA, social proof, agency info, trust badges (AMPI) visible above fold?
2. LISTINGS — Filters, sorting, property cards (price, photos, m², recámaras, baños, estacionamiento, CTA). Click one: gallery, video, virtual tour, map, similar properties?
3. FORMS — Find all, fill with persona data, submit, document confirmations.
4. WHATSAPP — Extract exact number, placement, pre-filled message. Do NOT click.
5. PHONE — Extract number(s), formatting, click-to-call. Do NOT click tel:.
6. EMAIL — Find email addresses.
7. CHATBOT — Present? Functional?
8. TRUST — Testimonials, reviews, team photos, AMPI cert, privacy policy, SSL?
9. MOBILE — Menu, readability, button sizes, thumb-reachable CTAs.
10. PERFORMANCE — Load speed, lazy loading, layout shifts, page titles.

Report:
- Overall Digital Readiness Score (1-10)
- Top 3 Strengths
- Top 3 Critical Issues
- Quick Wins
- Channel scores: Forms, WhatsApp, Phone, Trust, Mobile, Listings (/10 each)
- Extracted contacts: WhatsApp, Phone, Email""",
}
