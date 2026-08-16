import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EnvironmentVariables } from '../config/environment';

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;

  constructor(config: ConfigService<EnvironmentVariables, true>) {
    const user = config.get('SMTP_USER', { infer: true });
    const password = config.get('SMTP_PASSWORD', { infer: true });
    this.transporter = nodemailer.createTransport({
      host: config.get('SMTP_HOST', { infer: true }),
      port: config.get('SMTP_PORT', { infer: true }),
      secure: config.get('SMTP_SECURE', { infer: true }) === 'true',
      auth: user && password ? { user, pass: password } : undefined,
    });
    this.from = `"${config.get('SMTP_FROM_NAME', { infer: true })}" <${config.get('SMTP_FROM_EMAIL', { infer: true })}>`;
  }

  async sendInvitation(to: string, name: string, invitationUrl: string) {
    return this.transporter.sendMail({
      from: this.from,
      to,
      subject: 'You have been invited to Shelta',
      text: `Hello ${name},\n\nYou have been invited to Shelta. Set your password using this link: ${invitationUrl}\n\nThis link expires in 48 hours.`,
      html: `<p>Hello ${name},</p><p>You have been invited to Shelta.</p><p><a href="${invitationUrl}">Set your password</a></p><p>This link expires in 48 hours.</p>`,
    });
  }

  async sendContactVerification(to: string, name: string, verificationUrl: string) {
    return this.transporter.sendMail({
      from: this.from,
      to,
      subject: 'Verify your email for Shelta',
      text: `Hello ${name},\n\nAn agency added you to Shelta. Verify your email using this link: ${verificationUrl}\n\nThis link expires in 48 hours.`,
      html: `<p>Hello ${name},</p><p>An agency added you to Shelta.</p><p><a href="${verificationUrl}">Verify your email</a></p><p>This link expires in 48 hours.</p>`,
    });
  }
}
