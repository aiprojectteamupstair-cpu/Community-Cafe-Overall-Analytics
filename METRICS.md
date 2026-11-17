# Metric definitions

These definitions match the dashboard tooltips. Values always use the current global filters unless a section states its population.

| Metric | Definition |
| --- | --- |
| Total invoices | Count of filtered invoices. |
| Net sales | Sum of invoice Total (MMK). |
| Average invoice | Net sales divided by invoice count. |
| Items sold | Sum of parsed item quantities. |
| Daily invoice rate | Bars count invoices by date. Line is trailing 7-day mean. Click a bar to filter to that date. |
| Daily highlights | Calendar-day statistics over the selected range. |
| Weekday profile | Invoices by weekday, Monday through Sunday. |
| Daily sales by segment | Stacked net sales by day for normal and service account purchases. |
| Segment comparison | Invoice-level net, gross, discounts, average and maximum bill, item quantity, and discount rate. |
| Daily payment trend | Normal-sale net sales by payment group and date. |
| Average ticket by payment | Normal-sale net sales divided by invoice count for each payment group. |
| Student vs Guest payment | Normal-sale invoice counts and net sales by customer segment and payment group. |
| Best-selling items | Normal sales only. Ranked by parsed quantity or invoices containing the item. Item revenue is not available. |
| Item ranking | Quantity, number of invoices, and share of all normal-sale item quantity. |
| Categories | Category assignment comes from Settings; unmapped items are Uncategorized. |
| Peak invoice hour | Hour with the most invoice start times. |
| Median occupancy | Median first-to-last-order interval for qualifying dine-in tables. |
| Mean occupancy | Average first-to-last-order interval for qualifying dine-in tables. |
| P90 occupancy | 90th percentile of qualifying table intervals. |
| Max occupancy | Maximum qualifying table interval. |
| Invoice time analysis | Invoice start times by hour, including the first time in a range. |
| Weekday × hour heatmap | Cell intensity is invoice count; tooltip also shows sales. |
| Day parts | Configurable hour boundaries in Settings. AOV is sales divided by invoices. |
| Duration distribution | Qualifying table intervals grouped into minute buckets. |
| Average duration by hour | Mean qualifying occupancy by invoice start hour. |
| Average duration by table | Only tables with at least three qualifying sessions. |
| Duration vs bill size | Each point is one qualifying dine-in invoice. |
| Table sessions | Sessions are qualifying invoices. Turnover per day is sessions divided by active calendar days. |
| Unique students | Distinct student codes in the filtered period. |
| New students | Student codes first seen in the selected file period; earlier months are unavailable. |
| Student discount cost | Sum of Discount (MMK) on student invoices. |
| Daily student share | 100% stacked count of student and guest invoices by date. |
| Visits per student | Number of distinct student codes with each invoice count. |
| Top repeat customers | Ranked by invoice count. Names and codes are masked by default. |
| Student intake | Student-code prefix before the numeric identifier; indicative cohort only. |
| Cafe vs Express | Side-by-side normal-sale invoice, sales, AOV, item, share, and peak-hour metrics. |
| Daily outlet sales | Normal-sale net sales for Cafe and Express by date. |
| Hourly outlet profile | Normal-sale invoice count by start hour and outlet. |
| Weekday outlet profile | Normal-sale invoice count by weekday and outlet. |
| Cafe branch detail | Cafe 1, Cafe 2, mixed creators, and other Cafe invoices. |
| Classification rules | Edit service patterns, payment mapping, Express creator, item aliases, categories, and day-part boundaries. Changes rerun the local pipeline. |
