export interface Course {
  id: string;
  name: string;
  duration: string;
  level: string;
  description: string;
  classes: ClassItem[];
}

export interface ClassItem {
  id: number;
  name: string;
  date: Date;
}
