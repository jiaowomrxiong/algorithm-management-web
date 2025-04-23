export interface Algorithm {
  id: number | string;
  name: string;
  description: string;
  code?: string;
  api_endpoint?: string;
  price: number;
  status?: "active" | "inactive" | "draft";
  created_at: string;
  updated_at?: string;
  created_by?: string;
}
