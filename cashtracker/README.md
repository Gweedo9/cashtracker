# CashTracker

Follow a single banknote as it moves through the world.

Someone scans the QR sticker → lands on this page → logs their city → the map grows.

---

## Setup (30 minutes, free)

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. Open the **SQL editor** and run:

```sql
create table sightings (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  note_id text not null,
  city text not null,
  country text not null,
  handler_number int not null,
  note text,
  lat float,
  lon float
);

-- Allow anyone to read and insert (no account required for sighters)
alter table sightings enable row level security;

create policy "Public read" on sightings for select using (true);
create policy "Public insert" on sightings for insert with check (true);
```

3. Go to **Settings → API** and copy:
   - `Project URL`
   - `anon public` key

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_NOTE_ID=EH4829-1053A   ← the serial number of your note
```

### 3. Deploy to Vercel

Option A — drag and drop:
1. Run `npm install && npm run build` locally
2. Go to [vercel.com](https://vercel.com) → New Project → drag this folder
3. Add the three env vars in Vercel's settings

Option B — GitHub:
1. Push this repo to GitHub
2. Import it on Vercel
3. Add env vars → Deploy

### 4. Print the QR sticker

1. Go to `your-vercel-url.vercel.app/admin`
2. Click **Download QR as PNG**
3. Print at ~2×2 cm on an Avery label sheet
4. Stick on the back lower corner of the note

### 5. Release the note

Spend it somewhere interesting. Then watch.

---

## Pages

| URL | What it does |
|-----|--------------|
| `/` | Public tracker — what sighters see |
| `/admin` | Your dashboard — QR download + all sightings |

---

## Tips for the Instagram angle

- Post a photo of the note + sticker before you release it
- Screenshot the tracker page each time a new sighting appears
- Add the tracker URL to your bio
- Post a "where is it now?" story every week

---

## Stack

- **Next.js 14** — frontend + API routes
- **Supabase** — Postgres database (free tier: 500MB, 50k rows)
- **Vercel** — hosting (free tier: plenty for personal use)
- **Nominatim** — free geocoding (OpenStreetMap) — no API key needed
- **qrcode** — QR generation, runs server-side
