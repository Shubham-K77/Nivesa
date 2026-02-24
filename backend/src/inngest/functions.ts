/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Logger } from '@nestjs/common';
import { inngest } from './client';
import { AppService } from '../app.service';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { MailerService } from 'src/mailer/mailer.service';
import { GroqService } from 'src/groq/groq.service';
import PDFDocument from 'pdfkit';

interface InngestDependencies {
  appService: AppService;
  logger: Logger;
  prismaService: PrismaService;
  whatsappService: WhatsappService;
  mailerService: MailerService;
  groqService: GroqService;
}
export const getInngestFunctions = (deps: InngestDependencies) => {
  const { logger, prismaService, whatsappService, mailerService, groqService } =
    deps;
  const isNewMonth = (lastAlertDate: Date, currentDate: Date) => {
    return (
      lastAlertDate.getMonth() !== currentDate.getMonth() ||
      lastAlertDate.getFullYear() !== currentDate.getFullYear()
    );
  };
  const checkDailyBudgets = inngest.createFunction(
    { id: 'check-budget-alerts' },
    { cron: '0 */6 * * *' }, //Every 6-Hours Cron Job Will Be Triggered
    async ({ step }) => {
      try {
        logger.log('Starting budget check process');
        //Step-1: Fetch All Of The Budgets For All Of The Users Default Accounts
        const accounts = await step.run('fetch-user-budgets', async () => {
          return await prismaService.account.findMany({
            where: {
              isDefault: true,
              budget: { isNot: null },
            },
            select: {
              id: true,
              name: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  phoneNumber: true,
                  loginCredentials: {
                    where: {
                      role: 'USER',
                    },
                    select: {
                      email: true,
                    },
                  },
                },
              },
              budget: {
                select: {
                  id: true,
                  amount: true,
                  lastAlertSent: true,
                },
              },
            },
          });
        });
        logger.log(`Found ${accounts.length} user accounts with budgets`);
        //Step-2: Loop Through Entire Budget And Check Which Are Exceeding.
        for (const account of accounts) {
          const budgetId = account?.budget?.id;
          await step.run(`check-budget-${budgetId}`, async () => {
            //Check The Date
            const currentDate = new Date();
            const startOfMonth = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              1,
            );
            const endOfMonth = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() + 1,
              0,
            );
            const expenses = await prismaService.transaction.aggregate({
              where: {
                userId: account?.user?.id,
                accountId: account?.id,
                type: 'EXPENSE',
                date: {
                  gte: startOfMonth,
                  lte: endOfMonth,
                },
              },
              _sum: {
                amount: true,
              },
            });
            const totalExpenses = expenses._sum.amount?.toNumber() || 0;
            const budgetAmount = account?.budget?.amount;
            const percentageUsed = (totalExpenses / Number(budgetAmount)) * 100;

            logger.log(
              `Account: ${account.name}, Budget: ${budgetAmount}, Expenses: ${totalExpenses}, Usage: ${percentageUsed.toFixed(1)}%`,
            );

            //Check If Budget Is Exhausted
            if (
              percentageUsed >= 80 &&
              (!account?.budget?.lastAlertSent ||
                isNewMonth(
                  new Date(account?.budget?.lastAlertSent),
                  new Date(),
                ))
            ) {
              logger.log(
                `Sending alert for account ${account.name} - ${percentageUsed.toFixed(1)}% used`,
              );
              //Send Email
              const userEmail = account.user.loginCredentials[0]?.email;
              if (userEmail) {
                logger.log(`Sending email to ${userEmail}`);
                await mailerService.sendBudgetAlertMail(
                  userEmail,
                  account.user.name,
                  percentageUsed,
                  account.name,
                  Number(budgetAmount),
                  totalExpenses,
                );
                logger.log(`Email sent successfully to ${userEmail}`);
              } else {
                logger.warn(`No email found for user ${account.user.name}`);
              }
              //Send Whatsapp Message
              if (account?.user?.phoneNumber) {
                const loginStatus = whatsappService.getLoginStatus();
                logger.log(`WhatsApp login status: ${loginStatus.isLoggedIn}`);
                if (loginStatus.isLoggedIn) {
                  logger.log(
                    `Sending WhatsApp message to ${account.user.phoneNumber}`,
                  );
                  await whatsappService.sendMessage(
                    account.user.phoneNumber,
                    `📊 Budget Notification\n\nDear ${account.user.name},\n\nThis is to inform you that your account "${account.name}" has utilized ${percentageUsed.toFixed(1)}% of the allocated budget.\n\nBudget Allocation: NPR ${budgetAmount}\nCurrent Expenditure: NPR ${totalExpenses}\nRemaining Balance: NPR ${(Number(budgetAmount) - totalExpenses).toFixed(2)}\n\nWe recommend reviewing your transactions to ensure optimal budget management.\n\nBest regards,\n Nivesa Team`,
                  );
                  logger.log(
                    `WhatsApp message sent to ${account.user.phoneNumber}`,
                  );
                } else {
                  logger.warn(
                    `WhatsApp not logged in. Skipping message to ${account.user.phoneNumber}`,
                  );
                }
              } else {
                logger.warn(`No phone number for user ${account.user.name}`);
              }
              //Update Last Alert Sent
              await prismaService.budget.update({
                where: {
                  id: account?.budget?.id,
                },
                data: { lastAlertSent: new Date() },
              });
              logger.log(`Updated lastAlertSent for budget ${budgetId}`);
            } else {
              logger.log(
                `No alert needed for ${account.name}. Usage: ${percentageUsed.toFixed(1)}%, Last alert: ${account?.budget?.lastAlertSent || 'Never'}`,
              );
            }
          });
        }

        // Step-3: Check Family Member Budgets
        const familyBudgets = await step.run(
          'fetch-family-budgets',
          async () => {
            return await prismaService.familyBudget.findMany({
              select: {
                id: true,
                amount: true,
                lastAlertSent: true,
                familyMember: {
                  select: {
                    id: true,
                    name: true,
                    phoneNumber: true,
                    accountId: true,
                    account: {
                      select: {
                        name: true,
                      },
                    },
                    loginCredentials: {
                      select: {
                        email: true,
                      },
                    },
                  },
                },
              },
            });
          },
        );
        logger.log(`Found ${familyBudgets.length} family member budgets`);

        // Step-4: Process Family Member Budgets
        for (const familyBudget of familyBudgets) {
          const budgetId = familyBudget.id;
          await step.run(`check-family-budget-${budgetId}`, async () => {
            const currentDate = new Date();
            const startOfMonth = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              1,
            );
            const endOfMonth = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() + 1,
              0,
            );

            // Get family member's expenses
            const expenses = await prismaService.transaction.aggregate({
              where: {
                familyMemberId: familyBudget.familyMember.id,
                accountId: familyBudget.familyMember.accountId,
                type: 'EXPENSE',
                date: {
                  gte: startOfMonth,
                  lte: endOfMonth,
                },
              },
              _sum: {
                amount: true,
              },
            });

            const totalExpenses = expenses._sum.amount?.toNumber() || 0;
            const budgetAmount = familyBudget.amount;
            const percentageUsed = (totalExpenses / Number(budgetAmount)) * 100;

            logger.log(
              `Family Member: ${familyBudget.familyMember.name}, Budget: ${budgetAmount}, Expenses: ${totalExpenses}, Usage: ${percentageUsed.toFixed(1)}%`,
            );

            // Send alert if budget exceeded 80% and haven't sent this month
            if (
              percentageUsed >= 80 &&
              (!familyBudget.lastAlertSent ||
                isNewMonth(new Date(familyBudget.lastAlertSent), new Date()))
            ) {
              logger.log(
                `Sending alert for family member ${familyBudget.familyMember.name} - ${percentageUsed.toFixed(1)}% used`,
              );

              // Send Email
              const familyMemberEmail =
                familyBudget.familyMember.loginCredentials?.email;
              if (familyMemberEmail) {
                logger.log(`Sending email to ${familyMemberEmail}`);
                await mailerService.sendBudgetAlertMail(
                  familyMemberEmail,
                  familyBudget.familyMember.name,
                  percentageUsed,
                  familyBudget.familyMember.account.name,
                  Number(budgetAmount),
                  totalExpenses,
                );
                logger.log(`Email sent successfully to ${familyMemberEmail}`);
              } else {
                logger.warn(
                  `No email found for family member ${familyBudget.familyMember.name}`,
                );
              }

              // Send WhatsApp Message
              if (familyBudget.familyMember.phoneNumber) {
                const loginStatus = whatsappService.getLoginStatus();
                logger.log(`WhatsApp login status: ${loginStatus.isLoggedIn}`);
                if (loginStatus.isLoggedIn) {
                  logger.log(
                    `Sending WhatsApp message to ${familyBudget.familyMember.phoneNumber}`,
                  );
                  await whatsappService.sendMessage(
                    familyBudget.familyMember.phoneNumber,
                    `📊 Budget Notification\n\nDear ${familyBudget.familyMember.name},\n\nThis is to inform you that you have utilized ${percentageUsed.toFixed(1)}% of your allocated budget for account "${familyBudget.familyMember.account.name}".\n\nBudget Allocation: NPR ${budgetAmount}\nCurrent Expenditure: NPR ${totalExpenses}\nRemaining Balance: NPR ${(Number(budgetAmount) - totalExpenses).toFixed(2)}\n\nWe recommend reviewing your transactions to ensure optimal budget management.\n\nBest regards,\nNivesa Team`,
                  );
                  logger.log(
                    `WhatsApp message sent to ${familyBudget.familyMember.phoneNumber}`,
                  );
                } else {
                  logger.warn(
                    `WhatsApp not logged in. Skipping message to ${familyBudget.familyMember.phoneNumber}`,
                  );
                }
              } else {
                logger.warn(
                  `No phone number for family member ${familyBudget.familyMember.name}`,
                );
              }

              // Update Last Alert Sent
              await prismaService.familyBudget.update({
                where: {
                  id: familyBudget.id,
                },
                data: { lastAlertSent: new Date() },
              });
              logger.log(`Updated lastAlertSent for family budget ${budgetId}`);
            } else {
              logger.log(
                `No alert needed for family member ${familyBudget.familyMember.name}. Usage: ${percentageUsed.toFixed(1)}%, Last alert: ${familyBudget.lastAlertSent || 'Never'}`,
              );
            }
          });
        }

        logger.log('Budget check process completed successfully');
        return {
          success: true,
          processedUserAccounts: accounts.length,
          processedFamilyBudgets: familyBudgets.length,
        };
      } catch (error) {
        logger.error('Error in budget check process:', error);
        throw error;
      }
    },
  );
  const triggerRecurringTransactions = inngest.createFunction(
    {
      id: 'trigger-recurring-transactions',
      name: 'trigger-recurring-transactions',
    },
    { cron: '0 0 * * *' },
    async ({ step }) => {
      try {
        //1. Event for fetching the recurring transactions through the system
        const recurringTransactions = await step.run(
          'fetch-recurring-transactions',
          async () => {
            return await prismaService.transaction.findMany({
              where: {
                isRecurring: true,
                status: 'COMPLETED',
                OR: [
                  { lastProcessed: null },
                  { nextRecurringDate: { lte: new Date() } },
                ],
              },
            });
          },
        );
        //2. Creating events for each transactions
        if (recurringTransactions.length > 0) {
          const events = recurringTransactions.map((transaction) => ({
            name: 'transaction.recurring.process',
            data: {
              transactionId: transaction.id,
              userId: transaction.userId,
              familyMemberId: transaction.familyMemberId,
            },
          }));
          //3. Send All Events To Be Processed By Inngest
          await inngest.send(events);
        }
        return { triggered: recurringTransactions.length };
      } catch (error) {
        logger.error('Error in creating new transaction', error);
        throw error;
      }
    },
  );
  //Worker Function
  const processRecurringTransactions = inngest.createFunction(
    {
      id: 'process-recurring-transactions',
      name: 'process-recurring-transactions',
      throttle: {
        limit: 10, // Only process 10 transactions
        period: '1m', // per minute
        key: 'event.data.userId || event.data.familyMemberId', //Per User or Family Member
      },
    },
    { event: 'transaction.recurring.process' },
    async ({ event, step }) => {
      try {
        //Validate The Event Data
        if (
          !event?.data?.transactionId ||
          (!event?.data?.userId && !event?.data?.familyMemberId)
        ) {
          logger.error('Invalid Event Data!', event);
          return {
            error: 'Missing required event data',
          };
        }
        await step.run('process-transaction', async () => {
          // Build where clause based on userId or familyMemberId
          const whereClause: any = { id: event?.data?.transactionId };
          if (event?.data?.userId) {
            whereClause.userId = event?.data?.userId;
          } else if (event?.data?.familyMemberId) {
            whereClause.familyMemberId = event?.data?.familyMemberId;
          }

          const transaction = await prismaService.transaction.findUnique({
            where: whereClause,
            include: {
              account: true,
            },
          });
          if (!transaction || !isTransactionDue(transaction)) return;
          await prismaService.$transaction(async (txn) => {
            //Create New Transaction
            await txn.transaction.create({
              data: {
                type: transaction.type,
                amount: transaction.amount,
                description: `${transaction.description} (Recurring)`,
                date: new Date(),
                category: transaction.category,
                userId: transaction.userId,
                familyMemberId: transaction.familyMemberId,
                accountId: transaction.accountId,
                isRecurring: false,
              },
            });
            //Update The Existing Balance
            const balanceChange =
              transaction.type == 'EXPENSE'
                ? -transaction.amount.toNumber()
                : transaction.amount.toNumber();
            //Update The Balance
            await txn.account.update({
              where: { id: transaction.accountId },
              data: { balance: { increment: balanceChange } },
            });
            //Lastly, Update The Transaction
            await txn.transaction.update({
              where: { id: transaction.id },
              data: {
                lastProcessed: new Date(),
                nextRecurringDate: calculateNextReccuringDate(
                  new Date(),
                  transaction.recurringInterval,
                ),
              },
            });
          });
        });
      } catch (error) {
        logger.error(error);
        throw new Error('Unable to process the recurring transactions');
      }
    },
  );
  //Calculate Next Recurring Date:
  function calculateNextReccuringDate(currentDate, interval) {
    const date = new Date(currentDate);
    switch (interval) {
      case 'DAILY':
        date.setDate(date.getDate() + 1);
        break;
      case 'WEEKLY':
        date.setDate(date.getDate() + 7);
        break;
      case 'MONTHLY':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'YEARLY':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    return date;
  }
  //Checking Due Transactions
  function isTransactionDue(transaction) {
    //If no lastProcessed date, transaction is due
    if (!transaction.lastProcessed) return true;

    const today = new Date();
    const nextDue = new Date(transaction.nextRecurringDate);

    //Compare with nextDue date
    return nextDue <= today;
  }
  //Function to send the monthly reports
  const sendMonthlyAlerts = inngest.createFunction(
    {
      id: 'generate-monthly-reports',
      name: 'Generate Monthly Reports',
    },
    { cron: '0 0 1 * *' },
    async ({ step }) => {
      //Step-1: Fetch every users in the platform
      const users = await step.run('fetch-users', async () => {
        return await prismaService.user.findMany({
          include: {
            accounts: true,
            loginCredentials: { select: { email: true } },
          },
        });
      });
      //Step-2: Generate The Reports For The Users
      for (const user of users) {
        await step.run(`generate-report-${user.id}`, async () => {
          const lastMonth = new Date();
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          //Get The Stats From DB
          const stats = await getMonthlyStats(user.id, lastMonth);
          const monthName = lastMonth.toLocaleString('default', {
            month: 'long',
          });
          //Get The Insights From AI
          logger.log(`Generating insights for user ${user.id} - ${user.name}`);
          console.log(`Generating insights for user ${user.id} - ${user.name}`);
          const insights = await generateFinancialInsights(stats, monthName);
          logger.log(`Insights generated:`, insights);
          console.log(`Insights generated:`, JSON.stringify(insights));
          //Get The Insights Pdf
          const pdfBuffer = await generateInsightsPDF(
            insights,
            stats,
            monthName,
          );
          logger.log(`PDF generated, buffer size: ${pdfBuffer.length}`);
          console.log(`PDF generated, buffer size: ${pdfBuffer.length}`);
          //Send The Mail And WhatsApp Message
          try {
            const formattedCategories = Object.entries(stats.byCategory)
              .map(
                ([category, amount]) =>
                  `- ${category}: NPR ${(amount as number).toFixed(2)}`,
              )
              .join('\n');
            const formattedCategoriesHTML = Object.entries(stats.byCategory)
              .map(
                ([category, amount]) =>
                  `<li>${category}: NPR ${(amount as number).toFixed(2)}</li>`,
              )
              .join('');
            const whatsAppMessage = `
            *Monthly Financial Report* - ${monthName}
            
            Dear ${user.name},
            
            Here is your financial summary for ${monthName}:

            • Total Income: NPR ${stats.totalIncome.toFixed(2)}
            • Total Expenses: NPR ${stats.totalExpenses.toFixed(2)}
            • Number of Transactions: ${stats.transactionCount}  
            
            Expenses by Category:
            ${formattedCategories || '- No expenses recorded'}  

            For detailed insights, please check the attached report.
            
            Best regards,
            *Nivesa Team*`.trim();
            const htmlMessage = `
            <>
              <div style="font-family: Arial, sans-serif; color: #333; background-color: #f8f9fa; padding: 20px;">
                <div style="max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 8px; border: 1px solid #e5e5e5;">
                  
                  <h2 style="color: #1b4d3e; margin-bottom: 20px; font-size: 22px;">📊 Monthly Financial Report - ${monthName}</h2>

                  <p>Dear ${user.name},</p>

                  <p>We’re pleased to share your <strong>monthly financial insights</strong> for your account.</p>

                  <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
                    <p>This report provides a summarized overview of your spending patterns, budget utilization, and key observations from the past month.</p>
                    <p>The detailed breakdown is included in the attached PDF for your reference.</p>
                  </div>

                  <p>
                    <strong>Total Income:</strong> NPR ${stats.totalIncome.toFixed(2)}<br />
                    <strong>Total Expenses:</strong> NPR ${stats.totalExpenses.toFixed(2)}<br />
                    <strong>Number of Transactions:</strong> ${stats.transactionCount}
                  </p>

                  <p><strong>Expenses by Category:</strong></p>
                  
                  <ul>
                    ${formattedCategoriesHTML}
                  </ul>

                  <p style="margin-top: 25px;">
                    Reviewing these insights regularly can help you make more informed financial decisions and stay aligned with your goals.
                  </p>

                  <p>If you have any questions or notice discrepancies, feel free to reach out to our support team.</p>

                  <p style="margin-top: 25px;">
                    Warm regards,<br />
                    <strong>Nivēśa Team</strong>
                  </p>

                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 13px; color: #6c757d; text-align: center;">
                    <p>This is an automated email. Please do not reply to this message.</p>
                    <p>© ${new Date().getFullYear()} Nivēśa. All rights reserved.</p>
                  </div>
                </div>
              </div>
            </>`;
            logger.log(`Sending email to ${user.loginCredentials[0].email}`);
            console.log(`Sending email to ${user.loginCredentials[0].email}`);
            await mailerService.sendInsights(
              user.loginCredentials[0].email,
              pdfBuffer,
              monthName,
              htmlMessage,
            );
            logger.log(`Email sent successfully`);
            console.log(`Email sent successfully`);

            if (user.phoneNumber) {
              logger.log(`User has phone number: ${user.phoneNumber}`);
              console.log(`User has phone number: ${user.phoneNumber}`);
              const whatsappStatus = whatsappService.getLoginStatus();
              logger.log(`WhatsApp login status: ${whatsappStatus.isLoggedIn}`);
              console.log(
                `WhatsApp login status: ${whatsappStatus.isLoggedIn}`,
              );

              if (whatsappStatus.isLoggedIn) {
                logger.log(`Sending WhatsApp message to ${user.phoneNumber}`);
                console.log(`Sending WhatsApp message to ${user.phoneNumber}`);
                const result = await whatsappService.sendInsights(
                  user.phoneNumber,
                  whatsAppMessage,
                  pdfBuffer,
                );
                logger.log(`WhatsApp result:`, result);
                console.log(`WhatsApp result:`, JSON.stringify(result));
              } else {
                logger.warn(`WhatsApp not logged in, skipping message`);
                console.log(`WhatsApp not logged in, skipping message`);
              }
            } else {
              logger.warn(`User ${user.name} has no phone number`);
              console.log(`User ${user.name} has no phone number`);
            }
          } catch (error: any) {
            //Log The Error
            logger.error(error.message, error);
            throw new Error('Unable to send the insights to the user!');
          }
        });
      }

      // Step-3: Process Family Members
      const familyMembers = await step.run('fetch-family-members', async () => {
        return await prismaService.familyMember.findMany({
          where: {
            isActive: true,
          },
          include: {
            account: {
              select: {
                name: true,
              },
            },
            loginCredentials: {
              select: {
                email: true,
              },
            },
          },
        });
      });

      // Step-4: Generate Reports For Family Members
      for (const familyMember of familyMembers) {
        await step.run(
          `generate-family-report-${familyMember.id}`,
          async () => {
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);

            // Get Stats for family member
            const stats = await getFamilyMemberMonthlyStats(
              familyMember.id,
              lastMonth,
            );
            const monthName = lastMonth.toLocaleString('default', {
              month: 'long',
            });

            // Get AI Insights
            logger.log(
              `Generating insights for family member ${familyMember.id} - ${familyMember.name}`,
            );
            console.log(
              `Generating insights for family member ${familyMember.id} - ${familyMember.name}`,
            );
            const insights = await generateFinancialInsights(stats, monthName);
            logger.log(`Insights generated:`, insights);
            console.log(`Insights generated:`, JSON.stringify(insights));

            // Generate PDF
            const pdfBuffer = await generateInsightsPDF(
              insights,
              stats,
              monthName,
            );
            logger.log(`PDF generated, buffer size: ${pdfBuffer.length}`);
            console.log(`PDF generated, buffer size: ${pdfBuffer.length}`);

            // Send Email and WhatsApp
            try {
              const formattedCategories = Object.entries(stats.byCategory)
                .map(
                  ([category, amount]) =>
                    `- ${category}: NPR ${(amount as number).toFixed(2)}`,
                )
                .join('\n');
              const formattedCategoriesHTML = Object.entries(stats.byCategory)
                .map(
                  ([category, amount]) =>
                    `<li>${category}: NPR ${(amount as number).toFixed(2)}</li>`,
                )
                .join('');

              const whatsAppMessage = `
            *Monthly Financial Report* - ${monthName}
            
            Dear ${familyMember.name},
            
            Here is your financial summary for ${monthName}:

            • Total Income: NPR ${stats.totalIncome.toFixed(2)}
            • Total Expenses: NPR ${stats.totalExpenses.toFixed(2)}
            • Number of Transactions: ${stats.transactionCount}  
            
            Expenses by Category:
            ${formattedCategories || '- No expenses recorded'}  

            For detailed insights, please check the attached report.
            
            Best regards,
            *Nivesa Team*`.trim();

              const htmlMessage = `
            <>
              <div style="font-family: Arial, sans-serif; color: #333; background-color: #f8f9fa; padding: 20px;">
                <div style="max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 8px; border: 1px solid #e5e5e5;">
                  
                  <h2 style="color: #1b4d3e; margin-bottom: 20px; font-size: 22px;">📊 Monthly Financial Report - ${monthName}</h2>

                  <p>Dear ${familyMember.name},</p>

                  <p>We're pleased to share your <strong>monthly financial insights</strong> for your transactions in the ${familyMember.account.name} account.</p>

                  <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
                    <p>This report provides a summarized overview of your spending patterns and key observations from the past month.</p>
                    <p>The detailed breakdown is included in the attached PDF for your reference.</p>
                  </div>

                  <p>
                    <strong>Total Income:</strong> NPR ${stats.totalIncome.toFixed(2)}<br />
                    <strong>Total Expenses:</strong> NPR ${stats.totalExpenses.toFixed(2)}<br />
                    <strong>Number of Transactions:</strong> ${stats.transactionCount}
                  </p>

                  <p><strong>Expenses by Category:</strong></p>
                  
                  <ul>
                    ${formattedCategoriesHTML}
                  </ul>

                  <p style="margin-top: 25px;">
                    Reviewing these insights regularly can help you make more informed financial decisions and stay aligned with your goals.
                  </p>

                  <p>If you have any questions or notice discrepancies, feel free to reach out to our support team.</p>

                  <p style="margin-top: 25px;">
                    Warm regards,<br />
                    <strong>Nivēśa Team</strong>
                  </p>

                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 13px; color: #6c757d; text-align: center;">
                    <p>This is an automated email. Please do not reply to this message.</p>
                    <p>© ${new Date().getFullYear()} Nivēśa. All rights reserved.</p>
                  </div>
                </div>
              </div>
            </>`;

              // Send Email
              if (familyMember.loginCredentials?.email) {
                logger.log(
                  `Sending email to ${familyMember.loginCredentials.email}`,
                );
                console.log(
                  `Sending email to ${familyMember.loginCredentials.email}`,
                );
                await mailerService.sendInsights(
                  familyMember.loginCredentials.email,
                  pdfBuffer,
                  monthName,
                  htmlMessage,
                );
                logger.log(`Email sent successfully`);
                console.log(`Email sent successfully`);
              }

              // Send WhatsApp
              if (familyMember.phoneNumber) {
                logger.log(
                  `Family member has phone number: ${familyMember.phoneNumber}`,
                );
                console.log(
                  `Family member has phone number: ${familyMember.phoneNumber}`,
                );
                const whatsappStatus = whatsappService.getLoginStatus();
                logger.log(
                  `WhatsApp login status: ${whatsappStatus.isLoggedIn}`,
                );
                console.log(
                  `WhatsApp login status: ${whatsappStatus.isLoggedIn}`,
                );

                if (whatsappStatus.isLoggedIn) {
                  logger.log(
                    `Sending WhatsApp message to ${familyMember.phoneNumber}`,
                  );
                  console.log(
                    `Sending WhatsApp message to ${familyMember.phoneNumber}`,
                  );
                  const result = await whatsappService.sendInsights(
                    familyMember.phoneNumber,
                    whatsAppMessage,
                    pdfBuffer,
                  );
                  logger.log(`WhatsApp result:`, result);
                  console.log(`WhatsApp result:`, JSON.stringify(result));
                } else {
                  logger.warn(`WhatsApp not logged in, skipping message`);
                  console.log(`WhatsApp not logged in, skipping message`);
                }
              } else {
                logger.warn(
                  `Family member ${familyMember.name} has no phone number`,
                );
                console.log(
                  `Family member ${familyMember.name} has no phone number`,
                );
              }
            } catch (error: any) {
              logger.error(error.message, error);
              throw new Error(
                'Unable to send the insights to the family member!',
              );
            }
          },
        );
      }

      //Step-5: Return
      return {
        processedUsers: users.length,
        processedFamilyMembers: familyMembers.length,
      };
    },
  );
  //Helper Function To Get The Monthly Stats
  const getMonthlyStats = async (userId: string, month: Date) => {
    const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
    const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    //Get The Transactions For The Mentioned Period
    const transactions = await prismaService.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    //Reduce The Transactions Into Insights
    return transactions.reduce(
      (stats, t) => {
        const amount = t.amount.toNumber();
        if (t.type === 'EXPENSE') {
          stats.totalExpenses += amount;
          stats.byCategory[t.category] =
            (stats.byCategory[t.category] || 0) + amount;
        } else {
          stats.totalIncome += amount;
        }
        return stats;
      },
      {
        totalExpenses: 0,
        totalIncome: 0,
        byCategory: {},
        transactionCount: transactions.length,
      },
    );
  };

  //Helper Function To Get The Monthly Stats For Family Members
  const getFamilyMemberMonthlyStats = async (
    familyMemberId: string,
    month: Date,
  ) => {
    const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
    const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    //Get The Transactions For The Mentioned Period for family member
    const transactions = await prismaService.transaction.findMany({
      where: {
        familyMemberId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    //Reduce The Transactions Into Insights
    return transactions.reduce(
      (stats, t) => {
        const amount = t.amount.toNumber();
        if (t.type === 'EXPENSE') {
          stats.totalExpenses += amount;
          stats.byCategory[t.category] =
            (stats.byCategory[t.category] || 0) + amount;
        } else {
          stats.totalIncome += amount;
        }
        return stats;
      },
      {
        totalExpenses: 0,
        totalIncome: 0,
        byCategory: {},
        transactionCount: transactions.length,
      },
    );
  };

  //Helper Function To Generate The Insights From Groq AI 'Cloud'
  const generateFinancialInsights = async (
    stats: {
      totalExpenses: number;
      totalIncome: number;
      byCategory: any;
      transactionCount: number;
    },
    monthName: string,
  ) => {
    try {
      logger.log(`Calling Groq API for insights...`);
      console.log(`Stats:`, JSON.stringify(stats));
      // No transactions — skip Groq entirely and return default insights
      if (!stats.transactionCount || stats.transactionCount === 0) {
        return [
          'Your highest expense category this month might need attention.',
          'Consider setting up a budget for better financial management.',
          'Track your recurring expenses to identify potential savings.',
        ];
      }
      const groq = groqService.getGroq();
      const prompt = `
      Analyze this financial data and provide 3 concise, actionable insights.
      Focus on spending patterns and practical advice.
      Keep it friendly and conversational.

      Financial Data for ${monthName}:
        - Total Income: NPR ${stats.totalIncome}
        - Total Expenses: NPR ${stats.totalExpenses}
        - Net Income: NPR ${stats.totalIncome - stats.totalExpenses}
        - Expense Categories: ${Object.entries(stats.byCategory)
          .map(([category, amount]) => `${category}: NPR ${amount as number}`)
          .join(', ')}

      Format the response as a JSON array of strings, like this: ["insight 1", "insight 2", "insight 3"]
      Use NPR (Nepalese Rupees) as the currency symbol, not $ or USD.
      `;
      const result = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 300,
      });
      const text = result.choices[0]?.message?.content || '[]';
      // Strip markdown code fences, then try to extract a JSON array from anywhere in the text
      const stripped = text.replace(/```(?:json)?\n?/g, '').trim();
      const arrayMatch = stripped.match(/\[[\s\S]*\]/);
      const cleaned = arrayMatch ? arrayMatch[0] : stripped;
      if (!cleaned || cleaned === '{}' || cleaned === '[]') {
        return [
          'Your highest expense category this month might need attention.',
          'Consider setting up a budget for better financial management.',
          'Track your recurring expenses to identify potential savings.',
        ];
      }
      //Converting The String Response To JSON
      try {
        const data = JSON.parse(cleaned);
        if (Array.isArray(data)) {
          // Replace any $ symbols with NPR in the insights
          return data.map((insight: string) =>
            insight.replace(/\$([0-9,]+\.?[0-9]*)/g, 'NPR $1'),
          );
        }
        return [
          'Your highest expense category this month might need attention.',
          'Consider setting up a budget for better financial management.',
          'Track your recurring expenses to identify potential savings.',
        ];
      } catch (parseError) {
        logger.error('Error parsing JSON response:', parseError);
        console.error('Error parsing JSON response:', parseError);
        return [
          'Your highest expense category this month might need attention.',
          'Consider setting up a budget for better financial management.',
          'Track your recurring expenses to identify potential savings.',
        ];
      }
    } catch (error: any) {
      logger.error('Failed To Generate Insights By Groq!', error.message);
      console.error('Failed To Generate Insights By Groq!', error);
      return [
        'Your highest expense category this month might need attention.',
        'Consider setting up a budget for better financial management.',
        'Track your recurring expenses to identify potential savings.',
      ];
    }
  };
  //Helper Function To Generate The PDF
  const generateInsightsPDF = (
    insights: string[],
    stats: {
      totalExpenses: number;
      totalIncome: number;
      byCategory: any;
      transactionCount: number;
    },
    monthName: string,
  ): Promise<Buffer> =>
    new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Title - Using ASCII version to avoid encoding issues
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('Nivesa', { align: 'center' });
      doc.moveDown(0.5);
      doc
        .fontSize(18)
        .font('Helvetica')
        .text(`Monthly Financial Report - ${monthName}`, { align: 'center' });
      doc.moveDown(2);

      // Financial Summary
      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('Financial Summary:', { underline: true });
      doc.moveDown(1);

      doc
        .fontSize(12)
        .font('Helvetica')
        .text(`Total Income: NPR ${stats.totalIncome.toFixed(2)}`);
      doc.text(`Total Expenses: NPR ${stats.totalExpenses.toFixed(2)}`);
      doc.text(
        `Net Savings: NPR ${(stats.totalIncome - stats.totalExpenses).toFixed(2)}`,
      );
      doc.text(`Total Transactions: ${stats.transactionCount}`);
      doc.moveDown(1.5);

      // Expense Breakdown
      if (Object.keys(stats.byCategory).length > 0) {
        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .text('Expense Breakdown by Category:');
        doc.moveDown(0.5);

        Object.entries(stats.byCategory).forEach(([category, amount]) => {
          doc
            .fontSize(11)
            .font('Helvetica')
            .text(`  • ${category}: NPR ${(amount as number).toFixed(2)}`);
        });
        doc.moveDown(1.5);
      }

      // Insights
      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('Key Insights:', { underline: true });
      doc.moveDown(1);

      if (Array.isArray(insights) && insights.length > 0) {
        insights.forEach((insight, index) => {
          doc
            .fontSize(12)
            .font('Helvetica')
            .text(`${index + 1}. ${insight}`, {
              align: 'left',
              width: 500,
            });
          doc.moveDown(0.8);
        });
      } else {
        doc
          .fontSize(12)
          .font('Helvetica')
          .text('No AI-generated insights available for this period.');
      }

      doc.moveDown(2);

      // Footer
      doc
        .fontSize(10)
        .font('Helvetica-Oblique')
        .text('Generated by Nivesa Financial Management System', {
          align: 'center',
        });
      doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'center' });

      doc.end();
    });
  //Inggest Functions Export
  return [
    checkDailyBudgets,
    triggerRecurringTransactions,
    processRecurringTransactions,
    sendMonthlyAlerts,
  ];
};
