export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Abstraction over "how an email actually leaves the server" so the transport
 * (SMTP vs Brevo's HTTP API) can be swapped without touching NotificationService.
 * `send` throws on failure; the caller records SENT/FAILED accordingly.
 */
export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}
