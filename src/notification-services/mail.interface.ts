export interface IMailService {
  /**
   *
   * @param {string} email - Recipient's email
   * @param {string} subject - Email subject
   * @param {string} html - The body of the email
   */
  sendMail(email: string, subject: string, html: string): Promise<void>;
}
