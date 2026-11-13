-- ClinicFlow AI - Updated Schema (run this on your PostgreSQL database)
-- Changes from original: medicines column is now TEXT[] (array) not TEXT

CREATE TABLE IF NOT EXISTS clinics (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  clinic_type TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  clinic_id INT REFERENCES clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  age INT,
  gender TEXT,
  no_phone_contact BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS visits (
  id SERIAL PRIMARY KEY,
  clinic_id INT REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
  visit_date TIMESTAMPTZ DEFAULT now(),
  problem TEXT,
  diagnosis_or_solution TEXT,
  medicines TEXT[] DEFAULT '{}',
  advice TEXT,
  charges NUMERIC(10,2) DEFAULT 0,
  payment_mode TEXT CHECK (payment_mode IN ('cash','online')),
  payment_status TEXT DEFAULT 'paid',
  follow_up_date DATE,
  ai_draft JSONB,
  final_note TEXT
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  clinic_id INT REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id INT REFERENCES patients(id),
  visit_id INT REFERENCES visits(id),
  amount NUMERIC(10,2),
  mode TEXT,
  status TEXT DEFAULT 'paid',
  paid_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id SERIAL PRIMARY KEY,
  clinic_id INT REFERENCES clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  unit TEXT,
  quantity INT DEFAULT 0,
  threshold INT DEFAULT 0,
  expiry_date DATE,
  archived BOOLEAN DEFAULT false
);
