import SMTPTransport from 'nodemailer/lib/smtp-transport';
import nodemailer from 'nodemailer';
import { IMailService } from './mail.interface';

const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASSWORD } = process.env;

export default class MailService implements IMailService {
  private transporter:
    | nodemailer.Transporter<SMTPTransport.SentMessageInfo>
    | undefined;

  constructor() {
    this.configure();
  }

  async sendMail(email: string, subject: string, html: string): Promise<void> {
    const message = {
      from: MAIL_USER,
      to: email,
      subject: subject,
      html: html,
    };

    await this.transporter?.sendMail(message);
  }

  configure() {
    this.transporter = nodemailer.createTransport({
      host: MAIL_HOST,
      port: Number(MAIL_PORT),
      secure: false,
      auth: {
        user: MAIL_USER,
        pass: MAIL_PASSWORD,
      },
    });
  }
}
