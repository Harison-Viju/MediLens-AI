export interface MedicalAnalysis {
  condition_name: string;
  severity_score: number; // 1-10
  urgency_level: 'Routine' | 'Monitor' | 'Urgent' | 'Emergency';
  summary: string;
  medical_reasoning: string;
  immediate_actions: string[];
  questions_for_doctor: string[];
  disclaimer: string;
}

export interface ScanHistoryItem {
  id: string;
  timestamp: number;
  imageUrl: string;
  analysis: MedicalAnalysis;
}

export enum AppView {
  LANDING = 'LANDING',
  ANALYZE = 'ANALYZE',
  HISTORY = 'HISTORY'
}

export type Language = 'English' | 'Spanish' | 'French' | 'Hindi' | 'Swahili';
