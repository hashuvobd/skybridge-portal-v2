# Sky Bridge Visa Operations Portal

A modern, high-density candidate management and visa pipeline portal for **Sky Bridge Visa Consultancy**, built to track North Macedonia employment migration candidates across regional partner agencies.

---

## Features

- **Operations Dashboard**: Real-time KPI tracking for intake, submitted files, municipal clearances, and clearance ratios.
- **Urgent Action Alerts**: Instant surfacing of approved files missing physical passports or Police Clearance Certificates (PCC).
- **Candidate Directory (Spreadsheet Mode)**: High-density data table with instant search, multi-criteria filtering (Agency, Macedonian Municipality, Stage), and inline one-click status updates.
- **Pipeline Kanban Board**: Visual 4-stage pipeline tracking (Intake $\rightarrow$ Submitted $\rightarrow$ Approved $\rightarrow$ Deployment Ready).
- **Partner Agency Network**: Performance metrics and conversion monitoring across 17 regional sourcing agencies.
- **Excel Ingestion & Export**: Synchronize bidirectionally with spreadsheet records.
- **Role Scoping**: Switch between Head Office Admin and restricted Agent Portal views.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui design patterns
- **Database**: PostgreSQL on Supabase via Prisma ORM
- **State & Tables**: TanStack Table patterns + Lucide Icons

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and add your Supabase credentials:
```bash
cp .env.example .env.local
```

### 3. Database Setup & Migrations
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the portal.
