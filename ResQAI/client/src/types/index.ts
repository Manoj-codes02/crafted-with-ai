export interface User {
  _id: string;
  name: string;
  email: string;
  token?: string;
}

export interface MedicalProfile {
  _id?: string;
  userId: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown';
  allergies: string[];
  chronicDiseases: string[];
  currentMedications: string[];
  insuranceProvider?: string;
  insurancePolicyNo?: string;
}

export interface EmergencyContact {
  _id: string;
  userId: string;
  name: string;
  relation: string;
  phone: string;
  email?: string;
  isSOS: boolean;
}

export interface TriageResponse {
  severity: 'Low' | 'Moderate' | 'Critical';
  confidence: number;
  possible_conditions: string[];
  reasoning: string;
  first_aid: string[];
  next_steps: string[];
  warning_signs: string[];
  hospital_needed: boolean;
  ambulance_required: boolean;
  estimated_priority: string;
  disclaimer: string;
}

export interface Assessment {
  _id: string;
  userId: string;
  age: number;
  gender: string;
  symptoms: string;
  painLevel: number;
  duration: string;
  medicalHistory?: string;
  allergies?: string;
  medications?: string;
  riskLevel: 'Low' | 'Moderate' | 'Critical';
  aiResponse: TriageResponse;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyReport {
  _id: string;
  userId: string;
  assessmentId: string | Assessment;
  reportName: string;
  pdfPath: string;
  createdAt: string;
}

export interface DisasterAdvice {
  immediate_actions: string[];
  dos: string[];
  donts: string[];
  evacuation_advice: string[];
}

export interface Hospital {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  emergency: boolean;
  distance_km?: number;
}
