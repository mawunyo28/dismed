// Mock data for Smart Pill Dispenser Portal

// Patient data
export const currentPatient = {
  id: "PAT-001",
  name: "Alex Johnson",
  age: 42,
  weight: 78.5,
  bloodType: "O Positive",
  emergencyContact: {
    name: "Sarah J.",
    relationship: "Wife",
    phone: "(555) 123-4567",
  },
}

// Medications
export type MedicationStatus = "Active" | "Low Stock" | "Expired"
export type DoseStatus = "Taken" | "Missed" | "Due" | "Upcoming"

export interface Medication {
  id: string
  slot: number
  name: string
  dosage: string
  frequency: string
  pillCount: number
  capacity: number
  expiry: string
  status: MedicationStatus
  category: string
  nextDose?: string
}

export const medications: Medication[] = [
  {
    id: "MED-001",
    slot: 1,
    name: "Atorvastatin",
    dosage: "20mg",
    frequency: "Once daily",
    pillCount: 42,
    capacity: 90,
    expiry: "12/15/2025",
    status: "Active",
    category: "Cholesterol",
    nextDose: "21:00",
  },
  {
    id: "MED-002",
    slot: 2,
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    pillCount: 8,
    capacity: 30,
    expiry: "8/20/2025",
    status: "Low Stock",
    category: "Blood Pressure",
    nextDose: "08:00",
  },
  {
    id: "MED-003",
    slot: 3,
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    pillCount: 64,
    capacity: 120,
    expiry: "2/10/2026",
    status: "Active",
    category: "Blood Sugar",
    nextDose: "08:00",
  },
  {
    id: "MED-004",
    slot: 4,
    name: "Ibuprofen",
    dosage: "400mg",
    frequency: "As needed",
    pillCount: 15,
    capacity: 50,
    expiry: "5/1/2024",
    status: "Expired",
    category: "Pain Relief",
  },
  {
    id: "MED-005",
    slot: 5,
    name: "Amlodipine",
    dosage: "5mg",
    frequency: "Once daily",
    pillCount: 22,
    capacity: 30,
    expiry: "11/30/2025",
    status: "Active",
    category: "Blood Pressure",
    nextDose: "09:00",
  },
  {
    id: "MED-006",
    slot: 6,
    name: "Multivitamin",
    dosage: "1 Tablet",
    frequency: "Daily Supplement",
    pillCount: 45,
    capacity: 60,
    expiry: "6/30/2026",
    status: "Active",
    category: "Supplement",
    nextDose: "08:00",
  },
  {
    id: "MED-007",
    slot: 7,
    name: "Melatonin",
    dosage: "5mg",
    frequency: "Once daily",
    pillCount: 28,
    capacity: 30,
    expiry: "9/15/2025",
    status: "Active",
    category: "Sleep Aid",
    nextDose: "21:30",
  },
  {
    id: "MED-008",
    slot: 8,
    name: "Omeprazole",
    dosage: "20mg",
    frequency: "Once daily",
    pillCount: 14,
    capacity: 30,
    expiry: "10/20/2025",
    status: "Active",
    category: "Acid Reflux",
    nextDose: "07:00",
  },
]

// Today's schedule
export interface ScheduleItem {
  id: string
  time: string
  medication: string
  dosage: string
  category: string
  status: DoseStatus
  compartment?: number
}

export const todaySchedule: ScheduleItem[] = [
  {
    id: "SCH-001",
    time: "08:00 AM",
    medication: "Multivitamin",
    dosage: "1 Capsule",
    category: "Daily Supplement",
    status: "Taken",
    compartment: 6,
  },
  {
    id: "SCH-002",
    time: "09:00 AM",
    medication: "Ibuprofen",
    dosage: "400mg",
    category: "Pain Relief",
    status: "Missed",
    compartment: 4,
  },
  {
    id: "SCH-003",
    time: "12:30 PM",
    medication: "Metformin",
    dosage: "500mg",
    category: "Blood Sugar",
    status: "Due",
    compartment: 3,
  },
  {
    id: "SCH-004",
    time: "08:00 PM",
    medication: "Atorvastatin",
    dosage: "20mg",
    category: "Cholesterol",
    status: "Upcoming",
    compartment: 1,
  },
  {
    id: "SCH-005",
    time: "09:30 PM",
    medication: "Melatonin",
    dosage: "5mg",
    category: "Sleep Aid",
    status: "Upcoming",
    compartment: 7,
  },
]

// Extended schedule for schedules page
export interface ExtendedScheduleItem extends ScheduleItem {
  pills: number
}

export const fullDaySchedule: ExtendedScheduleItem[] = [
  {
    id: "SCH-101",
    time: "08:00 AM",
    medication: "Metformin (Glucophage)",
    dosage: "500mg",
    category: "Blood Sugar",
    status: "Taken",
    compartment: 1,
    pills: 1,
  },
  {
    id: "SCH-102",
    time: "08:00 AM",
    medication: "Lisinopril",
    dosage: "10mg",
    category: "Blood Pressure",
    status: "Taken",
    compartment: 2,
    pills: 1,
  },
  {
    id: "SCH-103",
    time: "01:30 PM",
    medication: "Multivitamin",
    dosage: "1 Tablet",
    category: "Supplement",
    status: "Missed",
    compartment: 4,
    pills: 1,
  },
  {
    id: "SCH-104",
    time: "06:00 PM",
    medication: "Atorvastatin (Lipitor)",
    dosage: "20mg",
    category: "Cholesterol",
    status: "Upcoming",
    compartment: 3,
    pills: 1,
  },
  {
    id: "SCH-105",
    time: "09:30 PM",
    medication: "Melatonin",
    dosage: "5mg",
    category: "Sleep Aid",
    status: "Upcoming",
    compartment: 5,
    pills: 2,
  },
]

// Devices
export type DeviceStatus = "Online" | "Offline" | "Warning"

export interface Device {
  id: string
  model: string
  status: DeviceStatus
  battery: number
  firmware: string
  latency: string
  lastSeen?: string
}

export const devices: Device[] = [
  {
    id: "SPD-8821-A",
    model: "OmniDispense Pro",
    status: "Online",
    battery: 92,
    firmware: "v2.4.1",
    latency: "12ms",
    lastSeen: "2 minutes ago",
  },
  {
    id: "SPD-4412-B",
    model: "OmniDispense Pro",
    status: "Online",
    battery: 45,
    firmware: "v2.4.1",
    latency: "15ms",
    lastSeen: "5 minutes ago",
  },
  {
    id: "SPD-3329-C",
    model: "OmniDispense Lite",
    status: "Warning",
    battery: 12,
    firmware: "v2.3.9",
    latency: "45ms",
    lastSeen: "10 minutes ago",
  },
  {
    id: "SPD-1102-D",
    model: "OmniDispense Pro",
    status: "Offline",
    battery: 0,
    firmware: "v2.4.0",
    latency: "-",
    lastSeen: "2 hours ago",
  },
  {
    id: "SPD-5592-E",
    model: "OmniDispense Pro",
    status: "Online",
    battery: 88,
    firmware: "v2.4.1",
    latency: "18ms",
    lastSeen: "1 minute ago",
  },
]

// Current device details
export const currentDevice = {
  id: "SPD-8829-XL",
  model: "OmniDispense Pro",
  status: "Online" as DeviceStatus,
  firmware: "v2.4.1-stable",
  latency: "24ms",
  lastSeen: "2 minutes ago",
  wifiSignal: "Excellent",
  batteryLife: 85,
  temperature: 22.4,
  sensorLoad: "Optimal",
}

// Compartments (28 slots - 7x4 grid)
export type CompartmentStatus = "filled" | "empty" | "jammed"

export interface Compartment {
  id: number
  status: CompartmentStatus
}

export const compartments: Compartment[] = Array.from({ length: 28 }, (_, i) => ({
  id: i + 1,
  status: i < 18 ? (i === 12 ? "jammed" : "filled") : "empty",
}))

// Dispensing history
export interface DispenseEvent {
  id: string
  timestamp: string
  eventType: string
  compartment: number | null
  status: "Success" | "Failed" | "Completed"
  details: string
}

export const dispensingHistory: DispenseEvent[] = [
  {
    id: "EVT-001",
    timestamp: "2023-10-27 08:00:12",
    eventType: "Automatic Dispense",
    compartment: 4,
    status: "Success",
    details: "Pill detected by IR sensor",
  },
  {
    id: "EVT-002",
    timestamp: "2023-10-27 07:59:45",
    eventType: "Motor Calibration",
    compartment: null,
    status: "Completed",
    details: "Home position verified",
  },
  {
    id: "EVT-003",
    timestamp: "2023-10-26 20:00:05",
    eventType: "Manual Dispense",
    compartment: 12,
    status: "Failed",
    details: "Mechanical jam detected",
  },
  {
    id: "EVT-004",
    timestamp: "2023-10-26 14:30:22",
    eventType: "Remote Lock",
    compartment: null,
    status: "Success",
    details: "Caregiver override",
  },
  {
    id: "EVT-005",
    timestamp: "2023-10-26 08:00:15",
    eventType: "Automatic Dispense",
    compartment: 3,
    status: "Success",
    details: "Pill detected by IR sensor",
  },
]

// Notifications
export type NotificationPriority = "high" | "medium" | "low"
export type NotificationCategory = "Medication" | "Device" | "System" | "Emergency"

export interface Notification {
  id: string
  title: string
  description: string
  category: NotificationCategory
  priority: NotificationPriority
  timestamp: string
  read: boolean
}

export const notifications: Notification[] = [
  {
    id: "NOT-001",
    title: "Missed Medication: Lisinopril",
    description:
      "Patient missed the 08:00 AM scheduled dose of Lisinopril 10mg. Dispenser motor is active but compartment remained closed.",
    category: "Medication",
    priority: "high",
    timestamp: "12 mins ago",
    read: false,
  },
  {
    id: "NOT-002",
    title: "Refill Warning: Vitamin D3",
    description:
      "Vitamin D3 pill count is low (5 pills remaining). Estimated supply will run out in 3 days.",
    category: "Medication",
    priority: "medium",
    timestamp: "2 hours ago",
    read: false,
  },
  {
    id: "NOT-003",
    title: "Dispenser Offline",
    description:
      "The Smart Dispenser (ID: SPD-409) has lost WiFi connectivity for more than 30 minutes.",
    category: "Device",
    priority: "medium",
    timestamp: "4 hours ago",
    read: false,
  },
  {
    id: "NOT-004",
    title: "System Update Complete",
    description:
      "Firmware v1.4.2 successfully installed. Improvements to battery calibration and motor torque sensing.",
    category: "System",
    priority: "low",
    timestamp: "1 day ago",
    read: true,
  },
  {
    id: "NOT-005",
    title: "Sensor Calibration Needed",
    description:
      "Compartment 4 optical sensor reports inconsistent readings. Please clean the tray area.",
    category: "Device",
    priority: "low",
    timestamp: "2 days ago",
    read: true,
  },
]

// Symptom assessments
export interface SymptomAssessment {
  id: string
  date: string
  primarySymptom: string
  severity: "Mild" | "Low" | "Moderate" | "Severe"
  riskOutcome: "low" | "medium" | "high"
}

export const symptomHistory: SymptomAssessment[] = [
  {
    id: "SYM-001",
    date: "2023-10-24 09:15",
    primarySymptom: "Headache",
    severity: "Mild",
    riskOutcome: "low",
  },
  {
    id: "SYM-002",
    date: "2023-10-22 14:30",
    primarySymptom: "Chest Tightness",
    severity: "Moderate",
    riskOutcome: "medium",
  },
  {
    id: "SYM-003",
    date: "2023-10-20 18:00",
    primarySymptom: "Fatigue",
    severity: "Low",
    riskOutcome: "low",
  },
  {
    id: "SYM-004",
    date: "2023-10-15 08:00",
    primarySymptom: "Nausea",
    severity: "Severe",
    riskOutcome: "high",
  },
  {
    id: "SYM-005",
    date: "2023-10-10 20:45",
    primarySymptom: "Dizziness",
    severity: "Mild",
    riskOutcome: "low",
  },
]

// Voice health scans
export interface VoiceScan {
  id: string
  date: string
  time: string
  result: string
  status: "Success" | "Warning" | "Info"
  duration: string
}

export const voiceScans: VoiceScan[] = [
  {
    id: "VOC-001",
    date: "Oct 24, 2023",
    time: "09:15 AM",
    result: "Normal Voice",
    status: "Success",
    duration: "0:12",
  },
  {
    id: "VOC-002",
    date: "Oct 22, 2023",
    time: "10:30 PM",
    result: "Fatigue Detected",
    status: "Warning",
    duration: "0:08",
  },
  {
    id: "VOC-003",
    date: "Oct 21, 2023",
    time: "08:00 AM",
    result: "Hoarseness Detected",
    status: "Info",
    duration: "0:15",
  },
  {
    id: "VOC-004",
    date: "Oct 19, 2023",
    time: "02:45 PM",
    result: "Normal Voice",
    status: "Success",
    duration: "0:10",
  },
  {
    id: "VOC-005",
    date: "Oct 17, 2023",
    time: "11:20 AM",
    result: "Dehydration Risk",
    status: "Warning",
    duration: "0:14",
  },
]

// Caregivers
export type CaregiverRole = "Doctor" | "Family" | "Caregiver"
export type CaregiverStatus = "Active" | "Pending"
export type Permission = "Read" | "Device Control" | "Approval Auth"

export interface Caregiver {
  id: string
  name: string
  email: string
  role: CaregiverRole
  permissions: Permission[]
  status: CaregiverStatus
  lastActive: string
  avatar?: string
}

export const caregivers: Caregiver[] = [
  {
    id: "CG-001",
    name: "Dr. Sarah Mitchell",
    email: "s.mitchell@stmarys.org",
    role: "Doctor",
    permissions: ["Read", "Approval Auth"],
    status: "Active",
    lastActive: "2 hours ago",
  },
  {
    id: "CG-002",
    name: "James Wilson",
    email: "james.w@family.net",
    role: "Family",
    permissions: ["Read", "Device Control"],
    status: "Active",
    lastActive: "5 mins ago",
  },
  {
    id: "CG-003",
    name: "Emily Chen",
    email: "emily.care@homehelp.com",
    role: "Caregiver",
    permissions: ["Read", "Device Control"],
    status: "Pending",
    lastActive: "Invite sent 1d ago",
  },
  {
    id: "CG-004",
    name: "Dr. Robert Fox",
    email: "fox.neurology@clinic.io",
    role: "Doctor",
    permissions: ["Read"],
    status: "Active",
    lastActive: "3 days ago",
  },
  {
    id: "CG-005",
    name: "Linda Johnson",
    email: "linda.j@provider.org",
    role: "Caregiver",
    permissions: ["Read", "Device Control", "Approval Auth"],
    status: "Active",
    lastActive: "Just now",
  },
]

// Emergency contacts
export interface EmergencyContact {
  id: string
  name: string
  role: string
  phone: string
  avatar?: string
}

export const emergencyContacts: EmergencyContact[] = [
  {
    id: "EM-001",
    name: "911 Emergency Services",
    role: "Public Safety",
    phone: "9-1-1",
  },
  {
    id: "EM-002",
    name: "Dr. Sarah Mitchell",
    role: "Primary Physician",
    phone: "(555) 123-4567",
  },
  {
    id: "EM-003",
    name: "Robert Johnson",
    role: "Primary Caregiver (Son)",
    phone: "(555) 987-6543",
  },
]

// Admin stats
export const adminStats = {
  activeUsers: 12482,
  userGrowth: "+12%",
  deviceHealth: 98.2,
  deviceHealthTrend: "+0.4%",
  totalDispensed: "1.2M",
  dispensedGrowth: "+18%",
  systemAlerts: 24,
  alertsTrend: "-5%",
}

// Dispensing statistics for chart
export const dispensingStats = [
  { day: "Mon", successful: 1200, requested: 1250 },
  { day: "Tue", successful: 1350, requested: 1400 },
  { day: "Wed", successful: 1100, requested: 1150 },
  { day: "Thu", successful: 1450, requested: 1500 },
  { day: "Fri", successful: 1300, requested: 1350 },
  { day: "Sat", successful: 800, requested: 850 },
  { day: "Sun", successful: 750, requested: 800 },
]

// Fatigue trend for voice health chart
export const fatigueTrend = [
  { day: "Mon", value: 32 },
  { day: "Tue", value: 28 },
  { day: "Wed", value: 25 },
  { day: "Thu", value: 22 },
  { day: "Fri", value: 20 },
  { day: "Sat", value: 18 },
  { day: "Sun", value: 22 },
]

// Connectivity pulse data
export const connectivityPulse = [
  { time: "10:00", latency: 12 },
  { time: "10:05", latency: 14 },
  { time: "10:10", latency: 11 },
  { time: "10:15", latency: 18 },
  { time: "10:20", latency: 24 },
  { time: "10:25", latency: 22 },
  { time: "10:30", latency: 15 },
  { time: "10:35", latency: 16 },
  { time: "10:40", latency: 20 },
  { time: "10:45", latency: 18 },
]

// Medication catalog for admin
export interface MedicationCatalogItem {
  id: string
  commonName: string
  therapeuticClass: string
  type: "Prescription" | "OTC"
  status: "Approved" | "Review"
}

export const medicationCatalog: MedicationCatalogItem[] = [
  {
    id: "MED-001",
    commonName: "Lisinopril",
    therapeuticClass: "Hypertension",
    type: "Prescription",
    status: "Approved",
  },
  {
    id: "MED-002",
    commonName: "Atorvastatin",
    therapeuticClass: "Cholesterol",
    type: "Prescription",
    status: "Review",
  },
  {
    id: "MED-003",
    commonName: "Metformin",
    therapeuticClass: "Diabetes",
    type: "Prescription",
    status: "Approved",
  },
  {
    id: "MED-004",
    commonName: "Levothyroxine",
    therapeuticClass: "Thyroid",
    type: "Prescription",
    status: "Approved",
  },
  {
    id: "MED-005",
    commonName: "Ibuprofen",
    therapeuticClass: "Pain Relief",
    type: "OTC",
    status: "Approved",
  },
]

// FAQ items
export interface FAQItem {
  question: string
  answer: string
}

export const faqItems: FAQItem[] = [
  {
    question: "What do I do if the pill dispenser jams?",
    answer:
      "If the motor detects a blockage, the device will pulse red. Use the manual override key provided in the original box to open the top lid. Gently remove the stuck pill and use a soft, dry cloth to clean the compartment. Perform a 'Manual Diagnostic' from the Device Control screen to reset the motor.",
  },
  {
    question: "How do I add a secondary caregiver?",
    answer:
      "Go to Settings > Caregivers & Permissions. Click 'Invite' and enter the caregiver's email address. Select their role and permissions level, then send the invitation.",
  },
  {
    question: "Is my voice data being recorded constantly?",
    answer:
      "No. Voice data is only captured when you explicitly initiate a voice scan. All recordings are processed locally on the device and only encrypted health markers are transmitted to the cloud.",
  },
  {
    question: "What happens if the Wi-Fi goes down?",
    answer:
      "The dispenser has offline mode capabilities. It will continue to dispense medications according to the last synced schedule. Once connectivity is restored, it will sync all events with the cloud.",
  },
]

// Help categories
export interface HelpCategory {
  title: string
  description: string
  articleCount: number
  icon: string
}

export const helpCategories: HelpCategory[] = [
  {
    title: "Getting Started",
    description: "Initial device unboxing, Wi-Fi connection, and account pairing.",
    articleCount: 12,
    icon: "settings",
  },
  {
    title: "Safety Protocols",
    description: "Guidelines for medication storage and emergency override procedures.",
    articleCount: 8,
    icon: "alert-triangle",
  },
  {
    title: "Troubleshooting",
    description: "Fixing common motor errors, sensor calibration, and battery issues.",
    articleCount: 24,
    icon: "settings-2",
  },
  {
    title: "Privacy & Security",
    description: "How your health data is encrypted and who can access your logs.",
    articleCount: 5,
    icon: "shield",
  },
]
