# StyleSphere (S4-I-16) — Azure Deployment & Migration Guide

This guide provides step-by-step instructions for running StyleSphere locally as an MVP, deploying to **Azure Static Web Apps** and **Azure App Service / Azure Functions**, and migrating the database from local MySQL (Port 8001) to **Azure Database for MySQL Flexible Server** or **Azure SQL**.

---

## 1. Local MVP Execution (Current Working Setup)

Both layers and the database are fully configured and verified locally:

### Prerequisites:
- **MySQL Server 8.0**: Active on Port **8001** (Database: `stylesphere_db`).
- **Node.js**: v18+ or v20+.

### Step 1: Start the Backend API Server
In a terminal:
```powershell
cd server
npm install
node dev-server.js
```
The server will boot on `http://localhost:7071/` and expose:
- `POST /api/login` — Authentication & JWT tokens
- `GET  /api/products` & `GET /api/products/{id}` — Catalogue with category, theme, size filters
- `GET  /api/cart`, `POST /api/cart`, `DELETE /api/cart` — User shopping bag synced with MySQL
- `GET  /api/orders`, `POST /api/orders` — Order placement & history tracking
- `GET  /api/recommendations` — AI Core recommendation rack & Gemini 2.5 Flash narratives

### Step 2: Start the Angular 20 Frontend
In a second terminal:
```powershell
cd client
npm start
```
Open your browser at `http://localhost:4200/`.

**Test Credentials:**
- Email: `user@stylesphere.com`
- Password: `password123`

---

## 2. Deploying Frontend to Azure Static Web Apps (Free Tier — ₹0)

Azure Static Web Apps Free tier provides SSL, global CDN distribution, and custom domains with ₹0 budget impact.

### Option A: Using Azure CLI (`az`)
1. Log in to your Azure account:
   ```bash
   az login
   ```
2. Build the Angular client for production:
   ```bash
   cd client
   npm run build
   ```
3. Deploy to Azure Static Web Apps:
   ```bash
   az staticwebapp create \
     --name stylesphere-client \
     --resource-group rg-stylesphere \
     --source dist/client/browser \
     --location "eastus2"
   ```

### Option B: Using GitHub Actions (Recommended)
1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete StyleSphere full-stack MVP with 5 screens"
   git push origin main
   ```
2. In the Azure Portal:
   - Search for **Static Web Apps** → click **Create**.
   - Select your Subscription and Resource Group (`rg-stylesphere`).
   - Hosting Plan: **Free** (₹0).
   - Source: **GitHub**.
   - Build Presets:
     - **App location**: `client`
     - **Api location**: `server`
     - **Output location**: `dist/client/browser`
3. Azure will automatically generate a GitHub Actions workflow `.github/workflows/azure-static-web-apps-*.yml` and deploy the live URL.

---

## 3. Deploying Backend to Azure App Service / Azure Functions

### Option A: Azure Functions (Consumption Free Tier — 1 Million executions/month free)
1. In the `server` directory, ensure Azure Functions Core Tools is installed (`npm i -g azure-functions-core-tools@4`).
2. Deploy the functions backend:
   ```bash
   cd server
   func azure functionapp publish <your-function-app-name>
   ```
3. Set environment variables in the Azure Portal (Configuration / App Settings):
   - `DB_HOST`: `<your-db-host>`
   - `DB_USER`: `<your-db-user>`
   - `DB_PASSWORD`: `<your-db-password>`
   - `DB_DATABASE`: `stylesphere_db`
   - `DB_PORT`: `3306`
   - `JWT_SECRET`: `stylesphere_jwt_secret_key_2026`

### Option B: Azure App Service (F1 Free Tier)
1. Initialize an Azure App Service with Linux Node 20 runtime.
2. Deploy via Local Git or VS Code Azure Extension.

---

## 4. Database Migration: Local MySQL to Azure Flexible Server

### Automated 1-Step Migration:
Run the automated migration script with your Azure MySQL credentials:

```powershell
# Set environment variables for your Azure Database for MySQL Flexible Server
$env:AZURE_DB_HOST="<your-server-name>.mysql.database.azure.com"
$env:AZURE_DB_USER="<your-azure-admin-user>"
$env:AZURE_DB_PASSWORD="<your-azure-password>"

# Run the automated migration
node database/migrate-to-azure.js
```

The script connects over SSL, creates `stylesphere_db` with all 10 normalized 3NF tables, populates catalogue products, and seeds test accounts with valid bcrypt hashes.

### Alternative: Azure SQL Database Migration
If migrating to Azure SQL (T-SQL):
1. Create a serverless Azure SQL database.
2. Use the provided [database/schema.sql](file:///c:/Users/ranjith.gopalakrishn/StyleSphere/StyleSphere/database/schema.sql) with MySQL-specific syntax converted to T-SQL (`AUTO_INCREMENT` → `IDENTITY(1,1)`, `ENUM` → `VARCHAR(50) CHECK`).
3. Connect using `mssql` or `@azure/identity` in Node.js.

---

## 5. Verification Checklist

- [x] **Screen 1 — Product Catalogue**: Filtering by category, pop-culture themes (Marvel, Anime, DC, Harry Potter), price range, and gender (`/men`, `/women`).
- [x] **Screen 2 — Product Detail**: Size selection, quantity picker, AI Styling Narrative, collapsible specs, and Add to Bag / View Bag CTAs (`/product/:id`).
- [x] **Screen 3 — Shopping Cart**: Free shipping indicator, itemized bag list, stepper controls, coupon code (`STYLE2026`), and one-click checkout (`/cart`).
- [x] **Screen 4 — Order History**: Order timeline stepper (*Confirmed*, *Shipped*, *Delivered*), item breakdown, date stamps, and invoice summary (`/orders`).
- [x] **Screen 5 — AI Recommendations**: StyleSphere AI Fashion Studio, Gemini 2.5 Flash merchandising narratives, aesthetic filter chips, and "Complete the Look" pairing rack (`/ai-recommendations`).
- [x] **Database Connectivity**: 10 normalized 3NF tables in MySQL, transactional orders, and behavioral event logging.
- [x] **Offline Resilience**: Instant fallback to cached state if backend is offline.
