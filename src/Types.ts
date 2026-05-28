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
  access_code?: string;
  modelType: PrinterModel;
  hasCamera?: boolean;
  has_camera?: boolean;
  serial?: string;
}

export interface PrinterStats {
  currentStatus: string;
  progressPercent: number;
  nozzleTemp: number;
  bedTemp: number;
}

export interface PrinterLog {
  id: string;
  printerId: string;
  eventType: string;
  message: string;
  timestamp: string;
  nozzleTemp: number;
  bedTemp: number;
}