/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Logger } from '@nestjs/common';
import { inngest } from './client';
import { AppService } from '../app.service';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { MailerService } from 'src/mailer/mailer.service';

interface InngestDependencies {
  appService: AppService;
  logger: Logger;
  prismaService: PrismaService;
  whatsappService: WhatsappService;
  mailerService: MailerService;
}

export const getInngestFunctions = (deps: InngestDependencies) => {
  const { logger, appService, prismaService, whatsappService, mailerService } =
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
        const accounts = await step.run('fetch-budget', async () => {
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

        logger.log(`Found ${accounts.length} accounts with budgets`);

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
        logger.log('Budget check process completed successfully');
        return { success: true, processedAccounts: accounts.length };
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
        key: 'event.data.userId', //Per User
      },
    },
    { event: 'transaction.recurring.process' },
    async ({ event, step }) => {
      try {
        //Validate The Event Data
        if (!event?.data?.transactionId || !event?.data?.userId) {
          logger.error('Invalid Event Data!', event);
          return {
            error: 'Missing required event data',
          };
        }
        await step.run('process-transaction', async () => {
          const transaction = await prismaService.transaction.findUnique({
            where: {
              id: event?.data?.transactionId,
              userId: event?.data?.userId,
            },
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
  return [
    checkDailyBudgets,
    triggerRecurringTransactions,
    processRecurringTransactions,
  ];
};
