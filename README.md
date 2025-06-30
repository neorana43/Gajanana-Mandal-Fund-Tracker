# 🙏 Gajanana Mandal Fund Tracker

A web application to manage Ganesh Mandal donations, expenses, secret sponsors, and fund balances — built using modern, free technologies.

---

## 🛠 Tech Stack

| Feature            | Technology                         |
|--------------------|-------------------------------------|
| Framework          | [Next.js](https://nextjs.org/) (App Router) |
| UI Components      | [shadcn/ui](https://ui.shadcn.com/) + Tailwind CSS |
| Auth & Database    | [Supabase](https://supabase.com/) (free tier) |
| Charts             | [Recharts](https://recharts.org/)   |
| Email Receipt (optional) | [Resend](https://resend.com/) |
| Hosting            | [Vercel](https://vercel.com/)       |

---

## ✨ Features

- 🔐 OTP + Password login for committee members
- 🧾 Record donations with recurring flag and email receipt
- 💸 Track categorized expenses with receipt upload
- 🕵️ Manage private sponsors (murti, lights, events)
- 📊 Public + internal dashboard with charts
- 📋 Admin list views with CSV/PDF export
- 📱 Mobile-first design with floating action buttons
- 🎨 Custom theme (Saffron & Maroon)

---

## 🧪 Roles

- **Admin**: Full access to everything
- **Volunteer**: Can add/edit donations and expenses
- **Public**: Can view dashboard only

---

## 🗃 Folder Structure

```
app/
├── dashboard/       # Public + Internal dashboards
├── donate/          # Donation form + list
├── expense/         # Expense form + list
├── secret/          # Sponsor form + list
├── login/           # Auth page
components/
├── charts/          # Recharts components
├── layouts/         # Navigation bar
├── ui/              # Buttons, inputs (shadcn)
lib/
├── supabase.ts      # Supabase client (RSC + browser)
├── export.ts        # PDF/CSV helpers
middleware.ts        # Route protection
```

---

## 🚀 Deployment

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/gajanana-mandal-app.git
cd gajanana-mandal-app
npm install
```

### 2. Setup `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Create Supabase Tables

Run these SQLs in Supabase SQL editor:

```sql
-- User Roles
create table user_roles (
  id uuid primary key references auth.users(id),
  role text not null check (role in ('admin', 'volunteer'))
);

-- Donations
create table donations (
  id uuid primary key default gen_random_uuid(),
  donor_name text not null,
  contact text,
  amount numeric not null,
  is_recurring boolean default false,
  created_at timestamp default now(),
  created_by uuid references auth.users(id)
);

-- Expenses
create table expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  description text,
  amount numeric not null,
  date date not null default current_date,
  receipt_url text,
  created_by uuid references auth.users(id),
  created_at timestamp default now()
);

-- Sponsors
create table sponsors (
  id uuid primary key default gen_random_uuid(),
  sponsor_name text not null,
  category text not null,
  description text,
  amount numeric not null,
  is_full boolean default false,
  created_by uuid references auth.users(id),
  created_at timestamp default now()
);
```

Create a public **Storage bucket**: `receipts`

---

## 🔐 Auth Setup

In Supabase Dashboard → Auth → Settings:
- Enable **Email + Password**
- (Optional) Enable **Magic Link (OTP)** login

---

## 📤 Deploy to Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import project → Link GitHub
4. Add environment variables
5. Deploy ✅

---

## 👤 Admin Setup

After signup:
1. Go to Supabase → Auth → Users
2. Copy the user ID
3. Run this SQL to assign admin:

```sql
insert into user_roles (id, role) values ('USER_ID', 'admin');
```

---

## 📝 License

MIT — Free to use, modify and share for any Ganesh Mandal 🙏