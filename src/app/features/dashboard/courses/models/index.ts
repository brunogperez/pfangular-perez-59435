import { Student } from "../../students/models";

export interface Course {
  id: string;
  name: string;
  duration: string;
  level: string;
  description: string;
  classes: ClassItem[];
  students?: Student[];
}

export interface ClassItem {
  id: number;
  name: string;
  date: Date;
}
