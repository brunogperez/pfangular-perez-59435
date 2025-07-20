import { Client } from "../../clients/models";

export interface Product {
  id: string;
  name: string;
  duration: string;
  level: string;
  description: string;
  classes: ClassItem[];
  clients?: Client[];
}

export interface ClassItem {
  id: number;
  name: string;
  date: Date;
}
