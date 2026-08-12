# Warehouse Accessory Stock & Requisition Gate Pass Management System

A full-stack, responsive web application designed for maintaining stock of accessories across brands, managing Job Work production requisitions (Stitching & Finishing units), issuing extra accessories, tracking Lot/Batch numbers, and generating printable **A6-size Gate Pass Delivery Challans** with physical signatures.

---

## Key Features & User Roles

### 1. Master Owner (`owner`)
- **Full System Access**: Complete inventory, requisition, and user rights management.
- **Exclusive Valuation Dashboard**: Only user role authorized to view **Total Monetary Stock Valuation** (total monetary capital locked in accessories in ₹ / $).
- Full brand, category, and user login creation rights.

### 2. Warehouse Manager (`warehouse_manager`)
- **Stock Management**: Add/edit accessory items, brands, categories, style codes, colors, sizes, quantities, and unit cost rates.
- **Financial Security Restriction**: **CANNOT view total monetary value blocked in stock** (valuation summaries are hidden/masked).
- **Approval Workflow**: Review job work requests, adjust approved quantities, and use a **Toggle to issue Extra Accessories** when backup items are given.
- Print A6 Gate Pass Challans.

### 3. Accessory Picker (`accessory_picker`)
- **Processing Queue**: View approved requisitions.
- **Status Updates**: Mark items **"Ready for Pickup"** when packed, and confirm **"Picked Up"** upon handover to job work driver/rep (which automatically deducts stock).
- Print A6 Gate Pass Challans for physical signature collection.

### 4. Job Work - Stitching Unit (`job_work_stitching`)
- **Stitching Accessories Request**: View and request size labels (sizes 28 to 50), rivets, buttons, and sewing threads.
- **Batch / Lot # Tracking**: Enter production Lot Number (e.g., `LOT-2026-889A`).
- **Edit Pending**: Can edit request items/quantities while in `pending` status.

### 5. Job Work - Finishing Unit (`job_work_finishing`)
- **Finishing Accessories Request**: View and request price hang tags, polybags, main labels, and wash care labels.
- **Batch / Lot # Tracking**: Enter production Lot Number.
- **Edit Pending**: Can edit request items/quantities while in `pending` status.

---

## A6 Size Printable Gate Pass Challan
- Every requisition includes a dedicated **A6-size Gate Pass Challan** (105mm x 148mm) formatted specifically for standard A6 paper printers.
- Includes:
  - Challan No, Date & Time Stamp
  - Requesting Unit & Production **LOT / BATCH #**
  - Itemized table: Brand, Style, Accessory Category, Size/Color, Requested Qty, Issued Qty
  - Extra Items Issued Note (if Manager issued backup items)
  - **Dual Signature Blocks**:
    - `____________________` **Issued By (Warehouse Rep)**
    - `____________________` **Received By (Job Work Rep)**

---

## Quick Start & Local Setup

### Prerequisites
- Node.js v18+ and npm

### 1. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Run Locally in Development Mode
```bash
# Terminal 1: Start Backend API (Port 5000)
npm run dev:backend

# Terminal 2: Start Frontend Vite Server (Port 3000)
npm run dev:frontend
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## GitHub Setup Guide (Push to New Repository)

Follow these steps to create a fresh repository on GitHub and push this codebase:

```bash
# 1. Initialize Git repository (if not already initialized)
git init
git branch -M main

# 2. Add files and commit
git add .
git commit -m "Initial commit: Warehouse Accessory Stock Management System"

# 3. Create a fresh repository on GitHub via GitHub CLI (or manually on GitHub.com)
gh repo create warehouse-accessory-app --public --source=. --remote=origin --push

# OR if you created a repository manually on GitHub:
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/warehouse-accessory-app.git
git push -u origin main
```

---

## Render Deployment Guide (Auto-Deployment Setup)

This repository includes a `render.yaml` Blueprint specification for 1-click automatic CI/CD deployment on [Render](https://render.com).

### Deployment Steps on Render:
1. Push your code to GitHub (as shown above).
2. Log in to your [Render Dashboard](https://dashboard.render.com).
3. Click **New +** and select **Blueprint**.
4. Connect your GitHub repository (`warehouse-accessory-app`).
5. Render will automatically detect `render.yaml` and configure:
   - **Service Name**: `warehouse-accessory-app`
   - **Environment**: `Node`
   - **Build Command**: `npm run install-all && npm run build`
   - **Start Command**: `npm start`
6. Click **Apply**.
7. Render will build the React frontend, package static assets, start the Express backend server on port 10000, and issue a live production URL!

Every subsequent `git push` to your `main` branch on GitHub will automatically trigger a production build and deployment on Render!

---

## License
MIT License • Developed for Kaypee Warehouse Operations
