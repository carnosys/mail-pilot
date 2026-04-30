# MailPilot UI Refresh Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh MailPilot into a polished, light product-style interface with stronger hierarchy, cleaner mailbox states, and more refined auth and message views.

**Architecture:** Keep the existing Django app structure and mail API intact. Update the shared layout, auth templates, inbox shell, static styles, and client-side mailbox rendering so the redesign is mostly presentational and low-risk.

**Tech Stack:** Django templates, vanilla JavaScript, CSS, Bootstrap 4.

---

## Chunk 1: Shared Shell and Auth Screens

**Files:**
- Modify: `mail/templates/mail/layout.html`
- Modify: `mail/templates/mail/login.html`
- Modify: `mail/templates/mail/register.html`
- Modify: `mail/static/mail/styles.css`

- [ ] **Step 1: Update the shared page shell**

Add a lightweight app frame, page background, and flexible body classes so authenticated and auth pages can share the same visual language.

- [ ] **Step 2: Restyle login and registration**

Wrap the auth forms in polished cards with clearer spacing, helper copy, and consistent button hierarchy.

- [ ] **Step 3: Add the global light product palette**

Define reusable color, spacing, radius, and shadow tokens in `styles.css` and apply them to body, buttons, forms, and cards.

## Chunk 2: Mailbox, Message Detail, and Compose Views

**Files:**
- Modify: `mail/templates/mail/inbox.html`
- Modify: `mail/static/mail/inbox.js`
- Modify: `mail/static/mail/styles.css`

- [ ] **Step 1: Redesign the inbox shell**

Convert the mailbox page into a clearer product frame with a branded header, navigation pills, and better section spacing.

- [ ] **Step 2: Improve message list rendering**

Render each email as a cleaner card/list row with sender, subject, preview text, timestamp, and empty-state messaging.

- [ ] **Step 3: Polish compose and message detail states**

Give the compose form and single-message view stronger visual hierarchy, action placement, and clearer archived/read state handling.

- [ ] **Step 4: Add active-tab and empty-state behavior**

Make the selected mailbox obvious in the UI and show a friendly empty state when no messages exist.

- [ ] **Step 5: Verify the UI**

Run `python manage.py check`, start the server, and inspect the login, inbox, compose, and detail views in a browser.
