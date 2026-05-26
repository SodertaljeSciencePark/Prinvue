export enum PrinterModel {
  BAMBU_X_SERIES = "BAMBU_X_SERIES",
  BAMBU_P_SERIES = "BAMBU_P_SERIES",
  PRUSA = "PRUSA",
}

export interface Printer {
  id?: string;
  name: string;
  ip: string;
  username?: string;
  accessCode?: string;
  access_code?: string; // Fallback for backend consistency
  modelType: PrinterModel;
  hasCamera?: boolean;
  has_camera?: boolean; // Fallback for backend consistency
  serial?: string;
}

export interface PrinterStats {
  currentStatus: string;
  progressPercent: number;
  nozzleTemp: number;
  bedTemp: number;
}