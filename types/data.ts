export type SmokingCategory = 
  | "Normal"
  | "Buruk"
  | "Sangat Buruk";

export interface Student {
  id: number;
  name: string;
  nis: string;
  kelas: string;
  lastTested: string;
  nilai_sensor: number;   // ✅ IMPORTANT
  category: SmokingCategory;
}

export interface NewStudentForm {
  name: string;
  nis: string;
  kelas: string;
}