

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
  paymentDueDate?: string;
  assigneeId?: string;
  assigneeName?: string;
  projectFileLink?: string;
  outputFileLink?: string;
}

export interface ClientRate {
  label: string;
  rate: number;
}

export type PaymentTerms = "Net 5" | "Net 15" | "Net 30" | "Due on Receipt" | "Due End of Month";

export interface Client {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  defaultRate?: number; // legacy single rate
  defaultRates?: ClientRate[]; // new multi-rate support
  paymentTerms?: PaymentTerms;
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

export type FeedbackType = 'bug' | 'feature' | 'improvement' | 'complaint' | 'praise' | 'crash';
export type FeedbackStatus = 'pending' | 'in-progress' | 'resolved' | 'closed';
export type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical';
export type UserType = 'client' | 'creator' | 'admin';

export interface Feedback {
  id: string;
  type: FeedbackType;
  title: string;
  description: string;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  submittedBy: string;
  submittedAt: string;
  clientId?: string;
  creatorId?: string;
  userType: UserType;
  category: string;
  rating?: number; // 1-5 stars for satisfaction rating
  attachments?: string[];
  adminNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  // Technical details for error reports
  browserInfo?: string;
  url?: string;
  userAgent?: string;
  errorStack?: string;
  componentStack?: string;
}
