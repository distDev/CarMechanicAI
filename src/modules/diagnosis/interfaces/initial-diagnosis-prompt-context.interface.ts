export interface InitialDiagnosisPromptContext {
  problem: {
    description: string;
    errorCode?: string | null;
  };

  vehicle: {
    brand: string;
    model: string;
    modelSpec?: string | null;
    year?: number | null;
    engine?: string | null;
    transmission?: string | null;
    drivetrain?: string | null;
    mileage?: number | null;
  };
}
