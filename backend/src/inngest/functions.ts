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
          //Check If Budget Is Exhausted
          if (
            percentageUsed >= 80 &&
            (!account?.budget?.lastAlertSent ||
              isNewMonth(new Date(account?.budget?.lastAlertSent), new Date()))
          ) {
            //Send Email
            const userEmail = account.user.loginCredentials[0]?.email;
            if (userEmail) {
              await mailerService.sendBudgetAlertMail(
                userEmail,
                account.user.name,
                percentageUsed,
                account.name,
                Number(budgetAmount),
                totalExpenses,
              );
            }
            //Send Whatsapp Message
            if (account?.user?.phoneNumber) {
              const loginStatus = whatsappService.getLoginStatus();
              if (loginStatus.isLoggedIn) {
                await whatsappService.sendMessage(
                  account.user.phoneNumber,
                  `📊 Budget Notification\n\nDear ${account.user.name},\n\nThis is to inform you that your account "${account.name}" has utilized ${percentageUsed.toFixed(1)}% of the allocated budget.\n\nBudget Allocation: NPR ${budgetAmount}\nCurrent Expenditure: NPR ${totalExpenses}\nRemaining Balance: NPR ${(Number(budgetAmount) - totalExpenses).toFixed(2)}\n\nWe recommend reviewing your transactions to ensure optimal budget management.\n\nBest regards,\n Nivesa Team`,
                );
              } else {
                logger.warn(
                  `WhatsApp not logged in. Skipping message to ${account.user.phoneNumber}`,
                );
              }
            }
            //Update Last Alert Sent
            await prismaService.budget.update({
              where: {
                id: account?.budget?.id,
              },
              data: { lastAlertSent: new Date() },
            });
          }
        });
      }
    },
  );

  return [checkDailyBudgets];
};
