CREATE TABLE clinics (
  id SERIAL PRIMARY KEY, name TEXT, email TEXT UNIQUE, phone TEXT,
  password_hash TEXT, clinic_type TEXT, settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE patients (
  id SERIAL PRIMARY KEY, clinic_id INT REFERENCES clinics(id),
  name TEXT NOT NULL, phone TEXT, age INT, gender TEXT,
  no_phone_contact BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE visits (
  id SERIAL PRIMARY KEY, clinic_id INT, patient_id INT REFERENCES patients(id),
  visit_date TIMESTAMPTZ DEFAULT now(), problem TEXT, diagnosis_or_solution TEXT,
  medicines TEXT, advice TEXT, charges NUMERIC(10,2) DEFAULT 0,
  payment_mode TEXT CHECK (payment_mode IN ('cash','online')),
  payment_status TEXT DEFAULT 'paid', follow_up_date DATE,
  ai_draft JSONB, final_note TEXT);

CREATE TABLE payments (
  id SERIAL PRIMARY KEY, clinic_id INT, patient_id INT, visit_id INT,
  amount NUMERIC(10,2), mode TEXT, status TEXT, paid_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE inventory_items (
  id SERIAL PRIMARY KEY, clinic_id INT, name TEXT, category TEXT, unit TEXT,
  quantity INT DEFAULT 0, threshold INT DEFAULT 0, expiry_date DATE,
  archived BOOLEAN DEFAULT false);