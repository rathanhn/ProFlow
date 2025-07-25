

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
  assigneeId?: string;
  assigneeName?: string;
  projectFileLink?: string;
  outputFileLink?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  avatar: string;
  password?: string;
}

export interface Assignee {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
    mobile?: string;
    description?: string;
    password?: string;
    bio?: string;
    profilePicture?: string;
}

export interface Notification {
    id: string;
    userId: string; // 'admin', client UID, or creator UID
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
