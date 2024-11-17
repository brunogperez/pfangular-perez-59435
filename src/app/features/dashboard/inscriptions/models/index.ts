import { Course } from "../../courses/models";
import { Student } from "../../students/models";

export interface Inscription {
  id: string;
  studentId: string;
  courseId: string;
  student?: Student;
  course?: Course
}
