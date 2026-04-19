export type SmokingCategory = 
  | "Non Perokok"
  | "Perokok Ringan"
  | "Perokok Berat";

export interface Student {
  id: number;
  name: string;
  nis: string;
  kelas: string;
  lastTested: string;
  sensorValue: number;   // ✅ IMPORTANT
  category: SmokingCategory;
}

export interface NewStudentForm {
  name: string;
  nis: string;
  kelas: string;
}