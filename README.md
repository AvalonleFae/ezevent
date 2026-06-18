## EZEvent: University Event Management and Registration Application
ezevent is a university-centric, serverless event management and ticketing platform. It provides a role-based environment for participants to discover and register for events, organizers to manage listings, and administrators to oversee platform health and validate credentials.
## Features
### Participant Portal
* Event Discovery: Search, filter, and view upcoming university events.
* Ticketing: Register and pay for events securely via Stripe.
* Ticket Receipts: Automated invoice and ticket generation.
* Live Chat: Communicate directly with event organizers and peers.
* QR Check-in: In-app camera-based scanner for automatic event attendance check-in.
* Event Reviews: Rate and leave feedback for attended events.
### Organizer Portal
* Event Management: Draft, submit, and manage events.
* Dashboard Metrics: Track event registration, income, and status.
* Attendance Lists: Access live logs of participants checked in versus absent.
* Analytics Reports: Exportable visual reports of check-in rates and ticket sales.
### Admin Portal
* Organizer Verification: Review and approve organizer credentials to control publishing rights.
* Event Moderation: Approve or reject drafted events prior to publication.
* Platform Management: Configure universities, faculties, and core metadata.
* System Analytics: High-level KPI monitoring including total active events, users, and transaction volumes.
## Technology Stack
### Frontend
* React (v19)
* Vite (Build tool)
* React Router DOM (v7 Routing)
* Chart.js & React-Chartjs-2 (Data Visualization)
* HTML5 / CSS3
### Backend and Database
* Firebase Auth (Authentication & Session Management)
* Cloud Firestore (NoSQL Database)
* Firebase Storage (Media & Verification Document Hosting)
* Firebase Cloud Functions (v2 Serverless Endpoints)
* Firebase Hosting
### Third-Party APIs
* Stripe API (Payment Processing)
* EmailJS (Client-side Notifications)
## API Reference (Firebase Cloud Functions)
The serverless backend exposes the following HTTPS endpoints:
### 1. Create Stripe Checkout Session
* **Endpoint:** `createStripeCheckout` (CORS-enabled)
* **Method:** `POST`
* **Payload:** `{ eventId: string, userId: string, userEmail: string, price: number }`
* **Response:** `{ url: string }` redirects user to secure checkout page.
### 2. Handle Stripe Webhook
* **Endpoint:** `handleStripeWebhook`
* **Method:** `POST`
* **Description:** Verifies Stripe signatures and handles `checkout.session.completed` events to create registration entries and attendance logs inside Firestore.
