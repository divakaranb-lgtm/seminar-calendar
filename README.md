# Seminar Pipeline Dashboard

Live at: **https://seminar-calendar-azure.vercel.app**

A calendar + pipeline dashboard for college seminars, built on top of two live Google Sheets:

- The **seminar sheet** — college, date/status, stream, student count, BDM, speaker, branch.
- The **calling sheet** — one row per student called after a completed session, used to derive Prospects and Future Intake.

Both are refetched fresh on every page load and on "Refresh" — no server, no database, no build step needed to reflect a sheet edit (though Google's own "publish to web" caching can add up to ~5 minutes of lag on the seminar sheet).

## What's on the page

- **Dashboard cards** — Sessions Done, In Pipeline (Finalised), In Pipeline (Not Confirmed), and a compact Postponed row. Each expands into a quick-view table of the matching seminars, sorted by date.
- **Monthly calendar** — color-coded by stream, filled dots for confirmed dates, hollow rings for estimated ones, a slashed dot for postponed sessions. Click a day for full details.
- **BDM breakdown** — sessions, students, prospects, and future intake per BDM.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying

```bash
npx vercel deploy --prod
```

The GitHub repo is connected to the Vercel project, so a push to `main` should also trigger a deployment automatically.
