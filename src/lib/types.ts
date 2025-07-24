
export type WorkStatus = "Pending" | "In Progress" | "Completed";
export type PaymentStatus = "Unpaid" | "Partial" | "Paid";
export type PaymentMethod = "Cash" | "Bank Transfer" | "UPI" | "Other";

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
  amountPaid: number;
  assignedTo?: string;
  projectFileLink?: string;
  outputFileLink?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  avatar: string;
  password?: string; // Keep for form data, but won't be stored in Firestore
}

export interface Assignee {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
}

export interface Notification {
    id: string;
    userId: string; // 'admin' or client UID
    message: string;
    link: string;
    isRead: boolean;
    createdAt: string;
}

export interface Transaction {
  id: string;
  taskId: string;
  clientId: string;
  projectName: string;
  clientName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionDate: string;
  notes?: string;
}
