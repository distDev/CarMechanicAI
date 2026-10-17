export interface InitialDiagnosisCause {
  name: string;
  description: string;
  probability: number;
  estimatedMinutes: number;
}

export interface RepairPreview {
  summary: string;
  likelyActions: string[];
}

export interface InitialDiagnosisResult {
  summary: string;
  estimatedMinutes: number;
  causes: InitialDiagnosisCause[];
  repairPreview: RepairPreview;
}
