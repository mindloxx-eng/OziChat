/**
 * @fileoverview A mock email service for sending notifications.
 *
 * In a real application, this would be replaced with a proper email service
 * integration (e.g., using an API like SendGrid, Mailgun, or AWS SES).
 * For this simulation, it simply logs the email content to the developer console.
 */

/**
 * Sends a simulated email.
 * @param to The recipient's email address.
 * @param subject The subject of the email.
 * @param body The body content of the email.
 */
export const sendEmail = (to: string, subject: string, body: string): void => {
  console.groupCollapsed(`%c📧 Mock Email Sent to ${to}`, 'color: #3F9BFF; font-weight: bold;');
  console.log(`%cTo:`, 'font-weight: bold;', to);
  console.log(`%cSubject:`, 'font-weight: bold;', subject);
  console.log(`%cBody:`, 'font-weight: bold;', body);
  console.groupEnd();
};
