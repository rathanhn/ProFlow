export type WorkStatus = "Pending" | "In Progress" | "Completed";
export type PaymentStatus = "Unpaid" | "Partial" | "Paid";

export interface Task {
  id: string;
  slNo: number;
  clientName: string;
  clientId: string;
  acceptedDate: string;
  projectName: string;
  pages: number;
  rate: number;
  workStatus: WorkStatus;
  paymentStatus: PaymentStatus;
  submissionDate: string;
  notes?: string;
  total: number;
}

export interface Client {
  id: string;
  name: string;
  avatar: string;
  dataAiHint: string;
}
