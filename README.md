# NexaHR — HR Management System

A full-stack professional HR management web application built with Next.js 14, Supabase, and Tailwind CSS.

## 🚀 Features

- **Public Employee Registration** — Multi-step form with photo upload and AI-powered validation
- **Admin Portal** — Manager dashboard with employee management, approval workflows, and attendance tracking
- **Employee Portal** — Personal dashboard with attendance calendar and digital ID card download
- **AI Integration** — Google Gemini AI for candidate analysis and scoring
- **Email Notifications** — Automated approval/rejection emails via Resend

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Auth:** NextAuth.js (Admin) + Custom session (Employee Portal)
- **AI:** Google Gemini 1.5 Flash
- **Email:** Resend
- **PDF:** jsPDF + QRCode

## 📦 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.local` and fill in your keys:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXTAUTH_SECRET=your_random_secret_key
NEXTAUTH_URL=http://localhost:3000
RESEND_API_KEY=your_resend_api_key
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Supabase Database
Go to Supabase → SQL Editor → Run:

```sql
create extension if not exists "uuid-ossp";

create table companies (
  id uuid default uuid_generate_v4() primary key,
  name text not null default 'NexaHR',
  logo_url text,
  created_at timestamp with time zone default now()
);

create table managers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text unique not null,
  password_hash text not null,
  role text default 'manager',
  created_at timestamp with time zone default now()
);

create table employees (
  id uuid default uuid_generate_v4() primary key,
  employee_id text unique,
  full_name text not null,
  email text unique not null,
  phone text not null,
  designation text not null,
  department text not null,
  experience_years integer default 0,
  address text,
  photo_url text,
  resume_url text,
  status text default 'pending',
  ai_summary text,
  ai_validation_score integer,
  join_date date,
  approved_by uuid references managers(id),
  approved_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table attendance (
  id uuid default uuid_generate_v4() primary key,
  employee_id uuid references employees(id) on delete cascade,
  date date not null,
  status text not null,
  check_in_time time,
  check_out_time time,
  notes text,
  marked_by uuid references managers(id),
  created_at timestamp with time zone default now(),
  unique(employee_id, date)
);

create table email_logs (
  id uuid default uuid_generate_v4() primary key,
  employee_id uuid references employees(id),
  email_type text not null,
  sent_to text not null,
  sent_at timestamp with time zone default now(),
  status text default 'sent'
);

-- Default admin (password: Admin@123)
-- Generate hash: node -e "require('bcryptjs').hash('Admin@123',10).then(console.log)"
insert into managers (name, email, password_hash, role)
values ('Admin Manager', 'admin@nexahr.com', '$2b$10$YOUR_BCRYPT_HASH_HERE', 'admin');

-- Enable RLS
alter table employees enable row level security;
alter table attendance enable row level security;
alter table managers enable row level security;

-- Policies
create policy "Public can insert employees" on employees for insert with check (true);
create policy "Anyone can view employees" on employees for select using (true);
create policy "Anyone can update employees" on employees for update using (true);
create policy "Anyone can view attendance" on attendance for select using (true);
create policy "Anyone can insert attendance" on attendance for insert with check (true);
create policy "Anyone can update attendance" on attendance for update using (true);
create policy "Anyone can view managers" on managers for select using (true);
```

**Important:** Generate the bcrypt hash for `Admin@123`:
```bash
node -e "require('bcryptjs').hash('Admin@123', 10).then(h => console.log(h))"
```
Replace `$2b$10$YOUR_BCRYPT_HASH_HERE` with the output.

### 4. Create Supabase Storage Bucket
Go to Supabase → Storage → Create bucket named `employee-photos` (set to **Public**)

### 5. Run Development Server
```bash
npm run dev
```

### 6. Access the Application
- **Landing Page:** http://localhost:3000
- **Registration:** http://localhost:3000/register
- **Admin Login:** http://localhost:3000/admin/login
- **Employee Portal:** http://localhost:3000/portal/login

**Admin Credentials:** admin@nexahr.com / Admin@123

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                           # Landing page
│   ├── layout.tsx                         # Root layout
│   ├── register/page.tsx                  # Registration form
│   ├── admin/
│   │   ├── login/page.tsx                 # Admin login
│   │   └── dashboard/
│   │       ├── layout.tsx                 # Admin sidebar
│   │       ├── page.tsx                   # Dashboard overview
│   │       ├── employees/page.tsx         # Employee management
│   │       └── attendance/page.tsx        # Mark attendance
│   ├── portal/
│   │   ├── login/page.tsx                 # Employee login
│   │   └── dashboard/
│   │       ├── layout.tsx                 # Portal sidebar
│   │       ├── page.tsx                   # Employee dashboard
│   │       └── attendance/page.tsx        # Attendance calendar
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── employees/
│       │   ├── register/route.ts
│       │   ├── approve/route.ts
│       │   ├── decline/route.ts
│       │   └── [id]/route.ts
│       ├── attendance/route.ts
│       ├── gemini/analyze/route.ts
│       └── email/send/route.ts
├── components/
│   └── providers/AuthProvider.tsx
└── lib/
    ├── supabase.ts
    ├── gemini.ts
    ├── email.ts
    ├── idcard.ts
    └── utils.ts
```

## 📄 License

MIT
