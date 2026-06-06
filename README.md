# FieldOps Web — Alberta Safety Control
### Next.js · Tailwind CSS · Supabase · Vercel

---

## 🚀 Deploy to Vercel

1. Push this repo to GitHub ✅
2. Go to [vercel.com](https://vercel.com) → Import your GitHub repo
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click Deploy

---

## 💻 Run Locally

```bash
npm install
cp .env.example .env.local
# Fill in your Supabase credentials in .env.local
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Get your URL + anon key from Project Settings → API
3. Run the SQL schema in `/supabase/schema.sql` (coming soon)

---

## 📱 Pages

| Route | Description |
|-------|-------------|
| `/` | Login |
| `/supervisor/dashboard` | Supervisor command center |
| `/supervisor/create-task` | 5-step task wizard |
| `/supervisor/inventory` | Stock management |
| `/supervisor/schedule` | Worker availability |
| `/supervisor/history` | Task log + PDF reports |
| `/worker/dashboard` | Worker home + clock in/out |
| `/worker/timesheet` | Weekly timesheet |

---

## 🎨 Design
Dark industrial theme · Safety orange `#FF6B35` · Inter font

## 👤 Developer
Justin Okeke — justin.chinaza@gmail.com
