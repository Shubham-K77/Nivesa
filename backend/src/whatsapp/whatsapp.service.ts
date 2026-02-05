/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import { MessageMedia } from 'whatsapp-web.js';
@Injectable()
export class WhatsappService {
  private client: Client | null = null;
  private readonly logger = new Logger(WhatsappService.name);
  private isLoggedIn = false;
  private qrCode: string | null = null;
  private isInitializing = false;
  //Calls The Function Upon Creation
  constructor() {
    // Don't initialize immediately - wait for first scan request
    this.logger.log('WhatsappService created. Call /qr to initialize.');
  }
  async initializeClient() {
    // Clean up old client if it exists
    if (this.client) {
      try {
        this.logger.log('Cleaning up old client...');
        this.client.removeAllListeners();
        const pupBrowser = this.client.pupBrowser;
        if (pupBrowser) {
          await pupBrowser.close();
          this.logger.log('Old browser closed');
        }
        await this.client.destroy();
        this.logger.log('Old client destroyed');
      } catch (error: any) {
        this.logger.warn('Error cleaning up old client:', error.message);
      }
      // Wait for resources to be fully released
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    //Creates a new client
    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: '.wwebjs_auth',
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
      //Helps Support Multi-Device
      webVersionCache: {
        type: 'remote',
        remotePath:
          'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
      },
    });
    //Creates an event for getting qr
    this.client.on('qr', (qr) => {
      this.logger.log(
        'QR Code received - Scan with: Settings → Linked Devices → Link a Device',
      );
      this.qrCode = qr;
      // Optionally show in terminal (can be disabled)
      // qrcode.generate(qr, { small: true });
    });
    //Creates an event when log-in was success
    this.client.on('ready', () => {
      this.logger.log('WhatsApp client is ready as a linked device!');
      console.log('========== WHATSAPP READY EVENT FIRED ==========');
      this.isLoggedIn = true;
      this.qrCode = null;
    });
    //Creates an event to validate auth
    this.client.on('authenticated', () => {
      this.logger.log('Authenticated successfully');

      // Workaround: Sometimes ready event doesn't fire, so check manually after a delay
      setTimeout(async () => {
        if (!this.isLoggedIn && this.client) {
          try {
            // Try to get client info to verify it's actually ready
            const state = await this.client.getState();
            this.logger.log(`Client state after auth: ${state}`);
            if (state === 'CONNECTED') {
              this.logger.warn(
                'Ready event did not fire but client is CONNECTED - manually setting isLoggedIn',
              );
              this.isLoggedIn = true;
              this.qrCode = null;
            }
          } catch (error: any) {
            this.logger.warn('Could not get client state:', error.message);
          }
        }
      }, 5000); // Wait 5 seconds after authentication
    });
    //Creates an event when auth was failed
    this.client.on('auth_failure', (msg) => {
      this.logger.error('Authentication failure:', msg);
      this.isLoggedIn = false;
    });
    //Creates an even for disconnection
    this.client.on('disconnected', (reason) => {
      this.logger.warn('Client disconnected:', reason);
      this.isLoggedIn = false;
    });
  }
  async scanAndLogin(): Promise<{
    success: boolean;
    message: string;
    qrCode?: string;
  }> {
    try {
      // If already logged in, return immediately without generating QR
      if (this.isLoggedIn) {
        this.logger.log('User already logged in to WhatsApp');
        return {
          success: true,
          message: 'WhatsApp is already connected. No need to scan QR code.',
          qrCode: undefined,
        };
      }

      // If already initializing, wait for QR code
      if (this.isInitializing) {
        this.logger.log('Client is initializing, waiting for QR code...');
        // Wait up to 20 seconds for QR code
        for (let i = 0; i < 40; i++) {
          // Check if user logged in during wait
          if (this.isLoggedIn) {
            return {
              success: true,
              message: 'WhatsApp connected successfully!',
              qrCode: undefined,
            };
          }
          if (this.qrCode) {
            return {
              success: true,
              message: 'QR Code already generated. Please scan it.',
              qrCode: this.qrCode,
            };
          }
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
        return {
          success: false,
          message:
            'WhatsApp client is still initializing. Please wait a moment and try again.',
          qrCode: undefined,
        };
      }

      // Don't reinitialize if client is already ready but not logged in yet (waiting for QR scan)
      if (this.qrCode && this.client) {
        this.logger.log('Returning existing QR code');
        return {
          success: true,
          message: 'QR Code already available. Please scan it to login.',
          qrCode: this.qrCode,
        };
      }

      this.isInitializing = true;

      // Retry logic for handling navigation errors
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          // Always create a fresh client instance to avoid destroyed context issues
          this.logger.log(
            `Creating new WhatsApp client... (Attempt ${retryCount + 1}/${maxRetries})`,
          );
          await this.initializeClient();

          // Wait longer for the client to be ready
          await new Promise((resolve) => setTimeout(resolve, 1500));

          // Initialize the client first
          this.logger.log('Initializing WhatsApp client...');
          const initPromise = this.client!.initialize();

          // Wait a bit for initialization to start
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Now create a promise that resolves when QR code is received or already exists
          const qrPromise = new Promise<string>((resolve, reject) => {
            // Check if QR code is already available
            if (this.qrCode) {
              resolve(this.qrCode);
              return;
            }

            const timeout = setTimeout(() => {
              reject(new Error('QR code generation timeout'));
            }, 45000); // 45 second timeout

            const qrHandler = (qr: string) => {
              clearTimeout(timeout);
              this.client!.removeListener('qr', qrHandler);
              resolve(qr);
            };

            this.client!.once('qr', qrHandler);

            // Also poll for qrCode in case we missed the event
            const pollInterval = setInterval(() => {
              if (this.qrCode) {
                clearTimeout(timeout);
                clearInterval(pollInterval);
                this.client!.removeListener('qr', qrHandler);
                resolve(this.qrCode);
              }
            }, 500);
          });

          // Wait for both initialization and QR code
          await initPromise;
          const qr = await qrPromise;
          this.isInitializing = false;

          return {
            success: true,
            message:
              'QR Code generated. Scan with: WhatsApp → Settings → Linked Devices → Link a Device',
            qrCode: qr,
          };
        } catch (error: any) {
          retryCount++;

          // Check if it's a navigation error that we can retry
          if (
            (typeof error.message === 'string' &&
              error.message.includes('Execution context was destroyed')) ||
            (typeof error.message === 'string' &&
              error.message.includes('navigation'))
          ) {
            if (retryCount < maxRetries) {
              this.logger.warn(
                `Navigation error detected, retrying... (${retryCount}/${maxRetries})`,
              );
              // Wait before retrying
              await new Promise((resolve) => setTimeout(resolve, 2000));
              continue;
            }
          }

          // If not a retryable error or max retries reached, throw
          this.isInitializing = false;
          this.logger.error('Error during login:', error);
          return {
            success: false,
            message: `Failed to initialize WhatsApp client after ${retryCount} attempts: ${error.message}`,
          };
        }
      }

      this.isInitializing = false;
      return {
        success: false,
        message: `Failed to initialize WhatsApp client after ${maxRetries} attempts`,
      };
    } catch (error: any) {
      this.isInitializing = false;
      this.logger.error('Error during login:', error);

      return {
        success: false,
        message: `Failed to initialize WhatsApp client: ${error.message}`,
      };
    }
  }
  async sendMessage(
    phoneNumber: string,
    message: string,
  ): Promise<{ success: boolean; message: string }> {
    if (!this.isLoggedIn || !this.client) {
      return {
        success: false,
        message: 'WhatsApp client is not logged in. Please scan QR code first.',
      };
    }
    try {
      // Clean the phone number - remove all non-digits
      const number = phoneNumber.replace(/\D/g, '');
      // Format as chatId (add @c.us if not present)
      const chatId = number.includes('@c.us') ? number : `${number}@c.us`;
      const isRegistered = await this.client.isRegisteredUser(chatId);
      if (!isRegistered) {
        this.logger.warn(`Number ${phoneNumber} is not registered on WhatsApp`);
        return {
          success: false,
          message: 'This phone number is not registered on WhatsApp',
        };
      }
      await this.client.sendMessage(chatId, message, {
        sendSeen: false,
      });
      this.logger.log(`Message sent successfully to ${phoneNumber}`);
      return {
        success: true,
        message: 'Message sent successfully',
      };
    } catch (error: any) {
      this.logger.error(`Failed to send message to ${phoneNumber}:`, error);
      return {
        success: false,
        message: `Failed to send message: ${error?.message || 'Unknown error'}`,
      };
    }
  }
  getLoginStatus(): { isLoggedIn: boolean; qrCode?: string } {
    return {
      isLoggedIn: this.isLoggedIn,
      qrCode: !this.isLoggedIn && this.qrCode ? this.qrCode : undefined,
    };
  }
  async unlinkDevice() {
    try {
      // Reset state first
      this.isLoggedIn = false;
      this.qrCode = null;
      this.isInitializing = false;

      if (this.client) {
        try {
          // Try to logout from WhatsApp first
          this.logger.log('Logging out from WhatsApp...');
          await this.client.logout().catch((logoutError: any) => {
            // Ignore EBUSY errors during logout - these are Windows file locking issues
            if (
              typeof logoutError.message !== 'string' ||
              !logoutError.message.includes('EBUSY')
            ) {
              throw logoutError;
            }
            this.logger.warn(
              'File locking during logout (normal on Windows) - proceeding with cleanup',
            );
          });
          this.logger.log('Logout successful');
        } catch (logoutError: any) {
          this.logger.warn('Logout failed:', logoutError.message);
        }

        try {
          // Close the browser
          const pupBrowser = this.client.pupBrowser;
          if (pupBrowser) {
            this.logger.log('Closing browser...');
            await pupBrowser.close();
            this.logger.log('Browser closed successfully');
          }
        } catch (browserError: any) {
          this.logger.warn('Browser close failed:', browserError.message);
        }

        // Wait longer for all file handles to be released on Windows
        this.logger.log('Waiting for file handles to be released...');
        await new Promise((resolve) => setTimeout(resolve, 3000));

        try {
          // Destroy the client without logout (we already did it)
          this.client.removeAllListeners();
          this.client = null;
          this.logger.log('Client cleaned up successfully');
        } catch (destroyError: any) {
          this.logger.warn('Cleanup failed:', destroyError.message);
        }
      }

      // Wait again before reinitializing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Reinitialize for future use
      void this.initializeClient();
      this.logger.log('Device unlinked and reinitialized successfully');
      return true;
    } catch (error: any) {
      this.logger.error('Error during unlink:', error.message);

      // Always try to reinitialize even on error
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        void this.initializeClient();
        this.logger.log('Reinitialized after error');
      } catch (reinitError: any) {
        this.logger.error(
          'Failed to reinitialize client:',
          reinitError.message,
        );
      }

      return false;
    }
  }
  async sendInsights(
    phoneNumber: string,
    messageText: string,
    pdfBuffer: Buffer,
  ): Promise<{ success: boolean; message: string }> {
    if (!this.isLoggedIn || !this.client) {
      return {
        success: false,
        message: 'WhatsApp client is not logged in. Please scan QR code first.',
      };
    }
    try {
      // Clean the phone number
      const number = phoneNumber.replace(/\D/g, '');
      // Format as chatId
      const chatId = number.includes('@c.us') ? number : `${number}@c.us`;
      const isRegistered = await this.client.isRegisteredUser(chatId);
      if (!isRegistered) {
        this.logger.warn(`Number ${phoneNumber} is not registered on WhatsApp`);
        return {
          success: false,
          message: 'This phone number is not registered on WhatsApp',
        };
      }
      // Create PDF media object
      const pdf = new MessageMedia(
        'application/pdf',
        pdfBuffer.toString('base64'),
        'monthly-report.pdf',
      );
      // Send the PDF with the message as caption
      await this.client.sendMessage(chatId, pdf, {
        caption: messageText,
        sendSeen: false,
      });
      this.logger.log(`Financial report sent successfully to ${phoneNumber}`);
      return {
        success: true,
        message: 'Financial report sent successfully',
      };
    } catch (error: any) {
      this.logger.error(`Failed to send PDF to ${phoneNumber}:`, error);
      return {
        success: false,
        message: `Failed to send PDF: ${error?.message || 'Unknown error'}`,
      };
    }
  }
}
