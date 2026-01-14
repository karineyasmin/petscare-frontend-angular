export interface Notification {
  id: string;
  recipientEmail: string;
  petId?: string;
  petName?: string;
  subject: string;
  content: string;
  sentAt: string;
  status: 'sent' | 'pending' | 'failed';
  appointmentId?: string;
  appointmentType?: string;
  isRead: boolean;
  errorMessage?: string;
}

export interface NotificationFilter {
  petId?: string;
  status?: 'sent' | 'pending' | 'failed' | 'all';
  type?: string;
  startDate?: Date;
  endDate?: Date;
}