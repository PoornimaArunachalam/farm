# AgriConnect 🌱 - Live Agriculture Marketplace (Farmer ↔ Company)

**AgriConnect** is a full-stack, production-grade real-time agriculture marketplace connecting **Farmers** and **Companies** directly.

Built with **React**, **Vite**, **Tailwind CSS**, and **Convex** as the real-time database and serverless backend.

---

## 🌟 Key Features

* **🌾 Farmer Workspace**:
  * Create & manage verified farmer profile with landholding records.
  * List available crops with expected rates, quantity, quality grade, harvest dates, and location.
  * Live matching algorithm recommending company procurement demands matching crops you grow.
  * Receive trade proposals, submit counter-offers, accept agreements, and update dispatch/delivery logs.
* **🏭 Company Workspace**:
  * Create company procurement profile and publish bulk crop demands with price brackets.
  * Search verified regional farmers and available harvest lots with multi-criteria filters.
  * Send official purchase offers directly into instant chat channels.
  * Track active agreements from confirmation to weighbridge settlement.
* **💬 Real-Time Chat & Integrated Negotiation**:
  * Direct farmer-to-buyer messaging with live unread indicators.
  * **Interactive Offer Cards** right inside the chat window: Accept, Reject, or Propose Counter-Offer in real-time without reloading.
  * Automatic deal creation upon agreement acceptance.
* **🔔 Live Reactive Notifications**:
  * Instant unread badge alerts when new demands are posted, trade offers submitted, counter-offers proposed, or deals confirmed.
* **🛡️ Admin Management & Governance**:
  * Monitor platform metrics: Total farmers, companies, active lots, demands, trade value, and chat volume.
  * Moderation workflows to toggle user active status and remove non-compliant listings.
  * Review community dispute reports with 1-click status updates and CSV export.
* **⚡ 1-Click Multi-Role Demo Switcher**:
  * Top-right role selector allows evaluating two-sided real-time interactions across Farmer (Raj Kumar), Company (ABC Foods), and Admin in separate tabs seamlessly.

---

## 🚀 Technology Stack

* **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Lucide React icons, Canvas Confetti.
* **Backend & Database**: Convex (reactive real-time queries, mutations, schema indexes, and authorization).

---

## 🛠️ Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## ☁️ Running with Convex Cloud Backend

1. **Initialize Convex**:
   ```bash
   npx convex dev
   ```
2. Log in or create a free account on [Convex](https://convex.dev).
3. Convex will generate your `_generated/` server code and connect your cloud development database.
4. Paste the provided `CONVEX_URL` into your `.env.local`:
   ```env
   VITE_CONVEX_URL=https://your-convex-deployment.convex.cloud
   ```
5. Deploy to production when ready:
   ```bash
   npx convex deploy
   ```

---

## 🧪 Testing the Live Real-Time Multi-Party Flow

Open the application in two separate browser windows or tabs:

1. **Window 1 (Farmer - Raj Kumar)**:
   * Select **"Role: Farmer"** from top-right.
   * Go to **"Add New Crop"** and publish **Tomato** (1500 kg @ ₹28/kg).
2. **Window 2 (Company - ABC Foods)**:
   * Select **"Role: Company"** from top-right.
   * Notice the new Tomato listing appears **instantly in real time** without refreshing.
   * Go to **"Live Messages"**, chat with Raj Kumar, and click **"Make Trade Offer"** (e.g. ₹26/kg).
3. **Window 1 (Farmer)**:
   * Real-time notification and offer bubble arrives in the chat.
   * Click **"Counter"** and propose **₹27/kg**.
4. **Window 2 (Company)**:
   * Counter-offer appears instantly. Click **"Accept Deal"**.
5. **Both Windows**:
   * Deal confirmed! Confetti celebration triggers and deal `#...` appears under **"Active Deals"** in both dashboards simultaneously.

---

## 👥 Seed Demo Accounts

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Farmer** | Raj Kumar | `raj.kumar@agriconnect.com` | `farmer123` |
| **Farmer** | Priya Sharma | `priya.sharma@agriconnect.com` | `farmer123` |
| **Company** | ABC Foods Pvt Ltd | `procure@abcfoods.com` | `company123` |
| **Company** | GreenFresh Logistics | `contact@greenfresh.com` | `company123` |
| **Admin** | Poornima (Administrator) | `poornima@gmail.com` | `poornima` |

---

## 📄 License
MIT © 2026 AgriConnect.
