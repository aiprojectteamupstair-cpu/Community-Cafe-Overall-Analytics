# Community Cafe Analytics

## Assumptions

- Estimated table occupancy is the interval from an invoice's first order to last order. It does not measure seating before the first order or after the last order. Single-time invoices are excluded.
- The POS export has no item prices. Item rankings use quantity or invoice count; item revenue is not calculated.
- Student Service accounts are bulk department purchases and are excluded from normal-sale item, payment, and customer comparisons by default.
- A unique Guest is treated as one collective category for the unique-customer donut because guest identity is unavailable.
- Student “new” means first seen in the selected file period; prior months are unavailable.

## Run

```bash
npm install
npm run dev
npm run build
npm run test
```

Open the Vite URL, upload an `.xlsx` or `.csv` export, or choose **Load sample data**. The bundled sample is anonymized while preserving invoice metrics. Uploaded files are parsed in a Web Worker; their content stays in memory in the browser tab. Only language, theme, and masking preferences are stored in `localStorage`.

## Rules

`src/domain/config.ts` contains the default service-account pattern, outlet creator, payment mapping, item aliases, categories, and day-part boundaries. The Settings page edits these rules as JSON and reprocesses the current data. Changes last only for the current tab session.

## Exports

Each chart offers a table view, CSV, and PNG. **Full report PPTX** downloads an editable PowerPoint report with the current global filters and name-masking setting. The deck covers overview, sales mix, items, daily activity, time, table occupancy, payments, customers, outlets, and data quality. Global filters are reflected in the URL.

See [Metric definitions](METRICS.md) for the chart and KPI definitions.

## Deploy to Vercel

Import this directory as a Vercel project. The included `vercel.json` selects the Vite framework, runs `npm run build`, serves `dist`, and supports direct links to the app. If the project was already imported, set its Root Directory to this folder and redeploy after pushing these changes. No server functions or environment variables are needed; POS uploads and PowerPoint generation run in the browser.
