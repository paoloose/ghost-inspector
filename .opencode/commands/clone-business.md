---
description: Clone a business website, make it bot-ready with loading states, session simulation, and updated contact info
agent: general
subtask: true
model: opencode-go/kimi-k2.6
---

You are in the repo root folder. The task is to create a new static HTML demo clone of a real business website under `demos/<business-slug>/`.

**Target URL:** `$1`

## 0. Abort if SPA
Before doing any work, inspect the target page source (fetch the raw HTML). If the site is a **Single Page Application** — i.e., it uses React, Vue, Angular, or any client-side framework where the initial HTML is a nearly empty `<div id="root"></div>` or `<div id="app"></div>` and all content is rendered by JavaScript — **abort immediately**. Do not proceed. Report that the target is an SPA and cannot be cloned into a static demo.

If it is a normal server-rendered/static HTML page, continue.

First, determine a short slug for the business from the URL (e.g., `ramirezvazquez.com`). Create the directory `demos/<business-slug>/` and build the entire clone there using only HTML, CSS, and vanilla JavaScript.

## 1. Clone the Website
- Replicate the target business URL as a static site.
- Download all images and assets (logos, backgrounds, photos, icons) into a local `assets/` folder. Use `curl` or `wget` via bash to fetch them. If an image cannot be downloaded, fall back to hotlinking via its original full URL. Update all references in HTML and CSS to point to the local `assets/` paths where available.
- Keep original branding, colors, layout, and sections.
- Add a `Ghost Shopper Audit` tracker panel (fixed bottom-left) that logs every user interaction with timestamps.

## 2. Update Contact Information
- **Find and replace ALL phone numbers and WhatsApp references** across every file with:
  - **Phone:** `+52 5529196649`
  - **WhatsApp link format:** `https://wa.me/525529196649`
- Update visible text (e.g., "Tel: +52 5529196649").
- If the original site **does not have a WhatsApp floating button**, add one:
  - Fixed position, bottom-right.
  - WhatsApp logo image.
  - Link to `https://wa.me/525529196649`.
  - Track clicks on it.

## 3. Remove Irrelevant/Unwanted Channels
- Remove references to channels not requested (e.g., Telegram, Skype, etc.).
- Keep only: **email, phone, WhatsApp**.

## 4. Fix Broken or Incomplete Elements
- **Property/Portfolio Lists:** If the site has property cards, image galleries, or service listings:
  - Ensure hover overlays work on desktop.
  - Ensure overlays/buttons are **visible and clickable on mobile/touch devices** (use `@media (hover: none)`).
  - Add `onerror` handlers to images so if an external image fails, the card shows a CSS gradient fallback and remains usable.
  - Add fallback backgrounds on card containers.
- **Navigation:** Ensure smooth scroll, active link highlighting on scroll, and mobile hamburger menu work.
- **Forms:** All forms must validate client-side and show success states.

## 5. Add Loading States for Async Actions
For **every user action that should feel asynchronous**, add a loading state that lasts **200–500 ms** (randomized):

- **Global full-page overlay spinner** (fixed, centered, dark backdrop, spinning circle).
- **Button-level spinners** inside buttons (disable button, show mini spinner + text like "Enviando...").

Apply loading states to:
- Form submissions (contact form, any inquiry form).
- "Request Visit" / "Book Appointment" / CTA buttons.
- Register form submission.
- WhatsApp clicks (brief "Abriendo WhatsApp..." overlay).
- Email clicks (brief "Abriendo correo..." overlay).
- Phone clicks (brief "Iniciando llamada..." overlay).
- External link clicks on cards/services.
- Logout action.

**Important:** Do NOT actually send data anywhere. Simulate the delay with `setTimeout`, then show the success message or redirect.

## 6. Authentication Flow (Register, Not Login)
- Replace any "Login" page/link with **"Register / Crear Cuenta"**.
- The registration form accepts **any email and password**.
- On submit:
  - Show loading.
  - After 200–500ms, store a **dummy session** in `localStorage` under key `rvbr_session`:
    ```json
    {"email": "user@example.com", "name": "user", "registeredAt": "2026-01-01T00:00:00.000Z"}
    ```
  - Show success message.
  - Redirect to homepage.
- On the homepage:
  - If session exists in `localStorage`, hide the "Register" link and show a user session indicator in the header (e.g., "Hola, [name]") with a **Logout** button.
  - Logout clears `localStorage` and reloads the page (with a brief loading overlay).

## 7. Ensure Mobile Responsiveness
- Test grid layouts at `768px` and `480px` breakpoints.
- Ensure mobile menu slides in/out correctly.
- Ensure tap targets are at least `44px`.

## 8. Final Cleanup
- Remove any `PAGE_LOAD` auto-logging that triggers on every refresh (keep manual interaction tracking only).
- Ensure no `console.error` or broken JS occurs on page load.
- Ensure all file paths and links are relative and correct.

## Output
Write the complete source code for the cloned site into `demos/<business-slug>/`, including at minimum:
- `index.html`
- `register.html`
- `styles.css`
- `script.js`

Verify the files are created in the correct directory before finishing.

## 9. Write README.md
Create a file `demos/<business-slug>/README.md` containing **all** site-specific data you extracted from the original website. Be extremely verbose — include every detail you found:

- **Business name** (exact spelling).
- **Full business description / tagline / mission statement** (copy all text verbatim if possible).
- **Contact info:**
  - Email addresses found.
  - Phone number used in the clone (`+52 5529196649`) and note that it replaced the original.
  - WhatsApp link (`https://wa.me/525529196649`).
  - Physical address if listed.
- **People:** Any names of founders, agents, team members, or authors mentioned.
- **Services / Products:** Full list with descriptions.
- **Properties / Portfolio items:** List every item by name with any details (price, location, size, description).
- **Social media links:** Facebook, Instagram, X/Twitter, YouTube, LinkedIn, TikTok, etc.
- **External links:** Any other domains or pages referenced.
- **Sections / Pages:** List every section you cloned (Hero, About, Services, Properties, Contact, etc.).
- **Brand colors / fonts:** Note any colors, typography, or visual style cues you replicated.
- **Images / Assets:** List downloaded assets and their filenames in `assets/`.
- **Notes:** Any quirks, dynamic content you had to mock, or deviations from the original.

Write this README in **Spanish** if the original site is Spanish, otherwise in **English**.

## 10. Commit and Push
After verifying everything is correct, commit the new demo site to the repo and push it:
- Stage all files under `demos/<business-slug>/` (including the README).
- Write a concise commit message following the repo style (e.g., `feat(demo): add <business-name> bot-ready clone`).
- Push to `origin/main` (or the current upstream branch).
- Return the commit hash and the pushed branch name.
