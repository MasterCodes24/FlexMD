// src/mocks/mockData.js

export const mockDashboardStats = {
  todayPatients: 14,
  todayRevenue: 4200,
  todayCash: 1800,
  todayOnline: 2400,
  lowStockItems: 2,
  pendingDrafts: 3
};

export const mockPatients = [
  {
    id: "P-1001",
    name: "Rahul Sharma",
    phone: "9876543210",
    age: 34,
    gender: "Male"
  },
  {
    id: "P-1002",
    name: "Priya Desai",
    phone: "9123456780",
    age: 28,
    gender: "Female"
  },
  {
    id: "P-1003",
    name: "Amit Patel",
    phone: "9988776655",
    age: 45,
    gender: "Male"
  }
];

export const mockVisits = [
  {
    id: "V-5001",
    patientId: "P-1001",
    date: "2026-11-07",
    problem: "Severe headache, nausea for 2 days",
    diagnosis_or_solution: "Migraine",
    medicines: ["Naproxen 500mg - 1 tablet SOS", "Pantoprazole 40mg - 1 before breakfast"],
    charges: 400,
    payment_mode: "online",
    follow_up_date: null
  },
  {
    id: "V-5002",
    patientId: "P-1002",
    date: "2026-11-06",
    problem: "High fever, body ache, dry cough",
    diagnosis_or_solution: "Viral Pyrexia",
    medicines: ["Paracetamol 650mg - 3 times a day", "Cetirizine 10mg - 1 at night"],
    charges: 300,
    payment_mode: "cash",
    follow_up_date: "2026-11-10"
  },
  {
    id: "V-5003",
    patientId: "P-1001", // Rahul returning
    date: "2026-10-15",
    problem: "Routine checkup, mild acidity",
    diagnosis_or_solution: "GERD",
    medicines: ["Digene Gel - 2 spoons after meals"],
    charges: 300,
    payment_mode: "cash",
    follow_up_date: null
  }
];

export const mockInventory = [
  {
    id: "I-001",
    name: "Paracetamol 650mg",
    category: "Tablet",
    quantity: 150,
    unit: "Strips",
    threshold: 50
  },
  {
    id: "I-002",
    name: "Azithromycin 500mg",
    category: "Tablet",
    quantity: 20,
    unit: "Strips",
    threshold: 30 // This will trigger the low-stock badge
  },
  {
    id: "I-003",
    name: "Cough Syrup (Benedryl)",
    category: "Syrup",
    quantity: 12,
    unit: "Bottles",
    threshold: 15 // This will trigger the low-stock badge
  }
];

export const mockRevenue = {
  totalLifetime: 125000,
  currentMonth: {
    total: 24500,
    cash: 10500,
    online: 14000
  },
  dailyHistory: [
    { date: "2026-11-07", total: 4200, cash: 1800, online: 2400 },
    { date: "2026-11-06", total: 3800, cash: 2000, online: 1800 },
    { date: "2026-11-05", total: 5100, cash: 1100, online: 4000 }
  ],
  aiSummaries: {
    daily: "Today, the clinic saw 14 patients and collected ₹4,200. Cash collection was ₹1,800 and online collection was ₹2,400.",
    monthly: "In November so far, the clinic earned ₹24,500. Online payments are currently driving 57% of total collections."
  }
};