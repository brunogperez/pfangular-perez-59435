import { Product } from "../../products/models";
import { Client } from "../../clients/models";

export interface Inscription {
  id: string;
  clientId: string;
  productId: string;
  client?: Client;
  product?: Product
}
