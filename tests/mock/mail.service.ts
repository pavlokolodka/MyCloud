import { IMailService } from '../../src/notification-services/mail.interface';

export default class MailServiceMock implements IMailService {
  async sendMail(email: string, subject: string, html: string): Promise<void> {
    await null;
  }
}
