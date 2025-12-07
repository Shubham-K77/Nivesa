/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

//Node-Mailer
@Injectable()
export class MailerService {
  constructor(private readonly configService: ConfigService) {}
  //NodeMailer Config:
  async configMailer() {
    try {
      //Configured Value:
      const mailer = await nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: this.configService.get<string>('gmail_account'),
          pass: this.configService.get<string>('gmail_password'),
        },
      });
      //Return the configured Value:
      return mailer;
    } catch (error: any) {
      throw new Error(`Internal Server Error: ${error.message}`);
    }
  }
  //For Sending The Otp To User's Account:
  async otpMail(
    email: string,
    otp: string,
    type: 'initial' | 'resend' | 'reset' = 'initial',
  ) {
    try {
      const mailer = await this.configMailer();

      // Define subject and message based on type
      let subject = '🔓 Verify Your Email';
      let mainMessage = `
      Thank you for registering with <strong>Nivēśa</strong>, your trusted finance management platform. To complete your registration, please verify your email address using the One-Time Password (OTP) below:`;
      if (type === 'resend') {
        mainMessage = `
        This is your new OTP code to verify your email address:
      `;
      } else if (type === 'reset') {
        subject = '🔒 Verify Your Email to Reset Password';
        mainMessage = `
        Please verify your email address using the OTP below to reset your account password:
      `;
      }

      const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Nivēśa - Email Verification</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f8f9fa;
              margin: 0;
              padding: 0;
              color: #333;
            }
            .container {
              max-width: 540px;
              margin: 40px auto;
              background: #ffffff;
              border-radius: 8px;
              padding: 30px;
              border: 1px solid #e5e5e5;
            }
            h2 {
              color: #0d6efd;
              margin-bottom: 10px;
            }
            .otp-box {
              background: #f1f3f5;
              padding: 18px;
              text-align: center;
              border-radius: 6px;
              margin: 20px 0;
              font-size: 24px;
              letter-spacing: 6px;
              font-weight: bold;
              color: #000;
            }
            .footer {
              margin-top: 30px;
              font-size: 13px;
              color: #777;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Verify Your Email • Nivēśa</h2>
            <p>Hello,</p>
            <p>${mainMessage}</p>

            <div class="otp-box">${otp}</div>

            <p>
              This OTP is valid for <strong>5 minutes</strong>.
              After it expires, you must restart the ${type === 'reset' ? 'password reset' : 'registration'} process.
            </p>

            ${type !== 'reset' ? `<p>If you did not request this, please ignore this email.</p>` : ''}

            <p>Regards,<br /><strong>Nivēśa Team</strong></p>

            <div class="footer">
              This is an automated message, please do not reply.
            </div>
          </div>
        </body>
      </html>
    `;

      const info = await mailer.sendMail({
        from: '"Nivēśa" <nivesa.project@gmail.com>',
        to: email,
        subject,
        html: htmlContent,
      });

      console.log('Message sent:', info.messageId);
    } catch (error: any) {
      console.error(error);
      throw new Error(`Internal Server Error: ${error.message}`);
    }
  }
  //For Successfully Verifying The Account:
  async verifiedMail(email: string) {
    try {
      //Configured Value
      const mailer = await this.configMailer();
      //Sending the email
      const info = await mailer.sendMail({
        from: '"Nivēśa" <nivesa.project@gmail.com>',
        to: `${email}`,
        subject: '🎊 Welcome To The Platform',
        html: `
            <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Welcome to Nivēśa</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f8f9fa;
                            margin: 0;
                            padding: 0;
                            color: #333;
                        }
                        .container {
                            max-width: 540px;
                            margin: 40px auto;
                            background: #ffffff;
                            border-radius: 8px;
                            padding: 30px;
                            border: 1px solid #e5e5e5;
                        }
                        h2 {
                            color: #0d6efd;
                            margin-bottom: 10px;
                        }
                        .footer {
                            margin-top: 25px;
                            font-size: 13px;
                            color: #777;
                            text-align: center;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2>Welcome to Nivēśa 🎉</h2>

                        <p>Hello,</p>
                        <p>
                            Your email has been successfully verified. We’re excited to welcome you to <strong>Nivēśa</strong> your smart personal finance management platform.
                        </p>

                        <p>
                            You can now fully access all the features including expense tracking,budgeting tools, predictive insights, and more to help you take control of your financial journey.
                        </p>

                        <p>We're glad to have you onboard!</p>

                        <p>Regards,<br /><strong>Nivēśa Team</strong></p>

                        <div class="footer">
                            This is an automated message, please do not reply.
                        </div>
                    </div>
                </body>
            </html>

        `,
      });
      //Display the message in the console
      console.log('Message sent:', info.messageId);
    } catch (error: any) {
      console.error(error);
      throw new Error(`Internal Server Error: ${error.message}`);
    }
  }
  //For Activating The Family Account:
  async familyMemberInvitationMail(
    email: string,
    token: string,
    adminName: string,
  ) {
    try {
      const mailer = await this.configMailer();
      const activationLink = `https://nivesa.vercel.app/family/activate/${token}`;
      const info = await mailer.sendMail({
        from: '"Nivēśa" <nivesa.project@gmail.com>',
        to: `${email}`,
        subject: '👨‍👩‍👦 Family Member Access Activation',
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Family Member Invitation</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f8f9fa;
                    margin: 0;
                    padding: 0;
                    color: #333;
                }
                .container {
                    max-width: 540px;
                    margin: 40px auto;
                    background: #ffffff;
                    border-radius: 8px;
                    padding: 30px;
                    border: 1px solid #e5e5e5;
                }
                h2 {
                    color: #0d6efd;
                    margin-bottom: 10px;
                }
                a.button {
                    display: inline-block;
                    padding: 12px 20px;
                    background-color: #0d6efd;
                    color: white !important;
                    text-decoration: none;
                    border-radius: 5px;
                    font-size: 16px;
                    margin-top: 20px;
                }
                .footer {
                    margin-top: 25px;
                    font-size: 13px;
                    color: #777;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>You’ve Been Added as a Family Member</h2>
                <p>Hello,</p>                
                <p>
                    <strong>${adminName}</strong> has added you as a family member in the Nivēśa platform.
                    You now have access to the Nivēśa Family Subsystem.
                </p>
                <p>
                    To activate your account and get started, click the button below:
                </p>
                <p>
                    <a class="button" href="${activationLink}" target="_blank">
                        Activate Family Access
                    </a>
                </p>
                <p>
                    Or use this link: <br />
                    <a href="${activationLink}">${activationLink}</a>
                </p>
                <p>
                    <strong>Important:</strong> This activation link is valid for <strong>3 days</strong>.  
                    After the expiration period, you will no longer be able to authenticate using this token.
                </p>
                <p>Regards,<br /><strong>Nivēśa Team</strong></p>
                <div class="footer">
                    This is an automated message; please do not reply.
                </div>
            </div>
        </body>
        </html>
      `,
      });
      console.log('Family Invitation Sent:', info.messageId);
    } catch (error: any) {
      console.error(error);
      throw new Error(`Internal Server Error: ${error.message}`);
    }
  }

  //For Resetting The Password:
  async resetPasswordMail(email: string) {
    try {
      //Configured Value
      const mailer = await this.configMailer();
      const info = await mailer.sendMail({
        from: '"Nivēśa" <nivesa.project@gmail.com>',
        to: `${email}`,
        subject: '🔐 Account Password Reset',
        html: `
            <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Password Updated</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f8f9fa;
                            margin: 0;
                            padding: 0;
                            color: #333;
                        }
                        .container {
                            max-width: 540px;
                            margin: 40px auto;
                            background: #ffffff;
                            border-radius: 8px;
                            padding: 30px;
                            border: 1px solid #e5e5e5;
                        }
                        h2 {
                            color: #0d6efd;
                            margin-bottom: 10px;
                        }
                        .footer {
                            margin-top: 25px;
                            font-size: 13px;
                            color: #777;
                            text-align: center;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2>Password Updated Successfully</h2>

                        <p>Hello,</p>

                        <p>
                            This is to inform you that the password to your Nivēśa account has been updated successfully, please use your new password from now to access your account.
                        </p>

                        <p>
                            If you did not make this change, please contact our support team immediately.
                        </p>

                        <p>Regards,<br><strong>Nivēśa Team</strong></p>

                        <div class="footer">
                            This is an automated message, please do not reply.
                        </div>
                    </div>
                </body>
            </html>`,
      });
      console.log('Message Sent:', info.messageId);
    } catch (error: any) {
      console.error(error);
      throw new Error(`Internal Server Error: ${error.message}`);
    }
  }
}
