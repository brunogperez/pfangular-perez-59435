import { Course } from "../../courses/models";
import { Client } from "../../clients/models";

export interface Inscription {
  id: string;
  clientId: string;
  courseId: string;
  client?: Client;
  course?: Course
}
