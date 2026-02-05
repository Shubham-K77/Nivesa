/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTransactionDto } from './dto/createTransaction.dto';
import { GroqService } from 'src/groq/groq.service';
import { EditTransactionDto } from './dto/editTransaction.dto';
type TransactionsArray = {
  transactions: Array<string>;
};
@Injectable()
export class TransactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groqService: GroqService,
  ) {}
  //Bulk Delete Function
  async bulkDeleteTransaction(
    userId: string,
    TransactionsArray: TransactionsArray,
  ) {
    try {
      //Finding the user
      const userExists = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      if (!userExists) {
        throw new UnauthorizedException('The provided user is unauthorized!');
      }
      //The Array Will Be Sent From The Frontend
      if (
        !TransactionsArray.transactions ||
        TransactionsArray.transactions.length === 0
      ) {
        throw new BadRequestException(
          'You must define atleast one transaction info!',
        );
      }
      //Using The Transactions
      const transactionInfo = await this.prisma.transaction.findMany({
        where: {
          id: { in: TransactionsArray.transactions },
          userId: userExists.id,
        },
      });
      //Check if transactions were found
      if (transactionInfo.length === 0) {
        throw new BadRequestException(
          'No transactions found or you do not have permission to delete them!',
        );
      }
      //Changing the account balance before deleting:
      const accountBalanceChanges = transactionInfo.reduce(
        (acc, current) => {
          const amountNumber = Number(current.amount);
          const change =
            current.type === 'EXPENSE' ? amountNumber : -amountNumber;
          acc[current.accountId] = (acc[current.accountId] || 0) + change;
          return acc;
        },
        {} as Record<string, number>,
      );
      //Delete the transactions:
      await this.prisma.$transaction(async (txn) => {
        //Delete transactions
        await txn.transaction.deleteMany({
          where: {
            id: { in: TransactionsArray.transactions },
            userId: userExists.id,
          },
        });
        //Update the transactions
        for (const [accountId, balanceChange] of Object.entries(
          accountBalanceChanges,
        )) {
          await txn.account.update({
            where: { id: accountId },
            data: {
              balance: {
                increment: balanceChange,
              },
            },
          });
        }
      });
      // Response
      return {
        message: 'Successfully Deleted!',
        statusCode: 200,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException('Internal Server Error!');
    }
  }
  //Create A New Transaction Function
  calculateNextReccuringDate(currentDate, interval) {
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
  async createNewTransaction(transactionInfo: CreateTransactionDto) {
    try {
      //Arject Rate-Limiting To Amount Of Transactions Created Per Day

      //Check Whether User Or Family Member
      if (
        (!transactionInfo.userId && !transactionInfo.familyMemberId) ||
        (!transactionInfo.userId?.trim() &&
          !transactionInfo.familyMemberId?.trim())
      ) {
        throw new BadRequestException(
          "Must provide a valid authorized user's info",
        );
      }
      //Is A User
      if (transactionInfo.userId) {
        //User Exists
        const userExists = await this.prisma.user.findUnique({
          where: { id: transactionInfo.userId },
        });
        if (!userExists) {
          throw new UnauthorizedException(
            "Provided user doesn't exist in the system",
          );
        }
        //Check If Account Exists
        const accountExists = await this.prisma.account.findUnique({
          where: {
            id: transactionInfo.accountId,
            userId: transactionInfo.userId,
          },
        });
        if (!accountExists) {
          throw new UnauthorizedException(
            "Provided account doesn't exist in the system.",
          );
        }
        //Update The Balance According To Type
        const balanceChange =
          transactionInfo.type === 'EXPENSE'
            ? -transactionInfo.amount
            : transactionInfo.amount;
        const newBalance = accountExists.balance.toNumber() + balanceChange;
        //Create New Transaction And Update Existing Account's Balance
        const newTransaction = await this.prisma.$transaction(async (txn) => {
          const transaction = await txn.transaction.create({
            data: {
              ...transactionInfo,
              nextRecurringDate:
                transactionInfo.isRecurring && transactionInfo.recurringInterval
                  ? this.calculateNextReccuringDate(
                      transactionInfo.date,
                      transactionInfo.recurringInterval,
                    )
                  : null,
            },
          });
          if (!transaction) {
            throw new ServiceUnavailableException(
              'Unable to create a new transaction',
            );
          }
          await txn.account.update({
            where: { id: transactionInfo.accountId },
            data: { balance: newBalance },
          });
          return transaction;
        });
        //Success Message
        return {
          message: 'Successfully Added Transaction',
          statusCode: 201,
          accountId: newTransaction.accountId,
        };
      } else {
        //Is Family Member Exist
        const familyMemberExists = await this.prisma.familyMember.findFirst({
          where: {
            id: transactionInfo.familyMemberId,
            accountId: transactionInfo.accountId,
          },
        });
        if (!familyMemberExists) {
          throw new UnauthorizedException(
            'Family member not found or not associated with this account',
          );
        }
        //Does Account Exist
        const accountExists = await this.prisma.account.findUnique({
          where: { id: transactionInfo.accountId },
        });
        if (!accountExists) {
          throw new UnauthorizedException(
            "Provided account doesn't exist in the system.",
          );
        }
        //Update The Balance According To Type
        const balanceChange =
          transactionInfo.type === 'EXPENSE'
            ? -transactionInfo.amount
            : transactionInfo.amount;
        const newBalance = accountExists.balance.toNumber() + balanceChange;
        //Create New Transaction And Update Existing Account's Balance
        const newTransaction = await this.prisma.$transaction(async (txn) => {
          const transaction = await txn.transaction.create({
            data: {
              ...transactionInfo,
              nextRecurringDate:
                transactionInfo.isRecurring && transactionInfo.recurringInterval
                  ? this.calculateNextReccuringDate(
                      transactionInfo.date,
                      transactionInfo.recurringInterval,
                    )
                  : null,
            },
          });
          if (!transaction) {
            throw new ServiceUnavailableException(
              'Unable to create a new transaction',
            );
          }
          await txn.account.update({
            where: { id: transactionInfo.accountId },
            data: { balance: newBalance },
          });
          return transaction;
        });
        //Success Message
        return {
          message: 'Successfully Added Transaction',
          statusCode: 201,
          accountId: newTransaction.accountId,
        };
      }
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException('Internal Server Error!');
    }
  }
  //AI Receipt Scanning
  async scanReceipt(file: Express.Multer.File) {
    try {
      const groq = this.groqService.getGroq();
      //Convert File To Base64String
      const base64String = file.buffer.toString('base64');
      const imageUrl = `data:${file.mimetype};base64,${base64String}`;
      // Updated prompt to include transaction type
      const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
    - Total amount (just the number, must be in NPR if provided other currencies then convert it and provide me the value, number only.)
    - Date (in ISO format)
    - Description or items purchased (brief summary)
    - Merchant/store name
    - Suggested category (one of: FOOD, TRANSPORT, HOUSING, UTILITIES, ENTERTAINMENT, HEALTHCARE, EDUCATION, SHOPPING, TRAVEL, SALARY, FREELANCE, INVESTMENT, BUSINESS, OTHER {Everything is capitalized!})
    - Transaction type (either "INCOME" or "EXPENSE" - most receipts are EXPENSE unless they're for salary, freelance payment, business income, or investment returns)
    
    Only respond with valid JSON in this exact format:
    {
      "amount": number,
      "date": "ISO date string",
      "description": "string",
      "merchantName": "string",
      "category": "string",
      "type": "INCOME" or "EXPENSE"
    }

    If its not a receipt, return an empty object {}
      `;
      //Response From API
      const result = await groq.chat.completions.create({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        temperature: 0,
        max_tokens: 150,
      });
      //Cleaning The Response
      const text = result.choices[0]?.message?.content || '{}';
      const cleaned = text.replace(/```(?:json)?\n?/g, '').trim();
      if (!cleaned || cleaned === '{}') {
        return {
          message: 'No receipt detected',
          statusCode: 200,
          transactionInfo: null,
        };
      }
      //Converting The String Response To JSON
      try {
        const data = JSON.parse(cleaned);
        // Fallback: Determine type from category if not provided
        const determineType = (
          category: string,
          providedType?: string,
        ): string => {
          if (providedType && ['INCOME', 'EXPENSE'].includes(providedType)) {
            return providedType;
          }
          const incomeCategories = [
            'SALARY',
            'FREELANCE',
            'INVESTMENT',
            'BUSINESS',
          ];
          return incomeCategories.includes(category) ? 'INCOME' : 'EXPENSE';
        };
        console.log(data);
        return {
          message: 'Successfully scanned!',
          statusCode: 200,
          transactionInfo: {
            amount: data.amount ? parseFloat(data.amount) : null,
            date: data.date ? new Date(data.date) : new Date(),
            description: data.description,
            category: data.category,
            merchantName: data.merchantName,
            type: determineType(data.category, data.type), // Add type detection
          },
        };
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        throw new Error('Invalid response format from Groq');
      }
    } catch (error: any) {
      console.error('Error Scanning The Receipt: ', error.message);
      throw new ServiceUnavailableException('Failed to scan receipt!');
    }
  }
  //Get Specific Transaction For UserId
  async getSpecificTransaction(transactionId: string, userId: string) {
    try {
      if (!transactionId || !transactionId.trim()) {
        throw new BadRequestException('Must provide a valid transaction info!');
      }
      if (!userId || !userId.trim()) {
        throw new UnauthorizedException('User authentication required!');
      }
      const transactionExists = await this.prisma.transaction.findUnique({
        where: { id: transactionId },
      });
      if (!transactionExists) {
        throw new NotFoundException(
          "Provided transaction doesn't exist in the system.",
        );
      }
      // Verify transaction ownership
      if (transactionExists.userId !== userId) {
        throw new UnauthorizedException(
          'You do not have permission to view this transaction!',
        );
      }
      //Response
      return {
        message: 'Successfully Retrieved',
        transactionInfo: transactionExists,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException('Internal Server Error!');
    }
  }
  //Editing The Transaction For UserId
  async updateExistingTransaction(
    transactionId: string,
    transactionData: EditTransactionDto,
    userId: string,
  ) {
    try {
      if (!transactionId || !transactionId.trim()) {
        throw new BadRequestException('Must provide transaction info!');
      }
      if (!userId || !userId.trim()) {
        throw new UnauthorizedException('User authentication required!');
      }
      // Validate required fields
      if (
        transactionData.amount === undefined ||
        transactionData.amount === null
      ) {
        throw new BadRequestException('Transaction amount is required!');
      }
      const transactionExists = await this.prisma.transaction.findUnique({
        where: {
          id: transactionId,
        },
        include: {
          account: true,
        },
      });
      if (!transactionExists) {
        throw new UnauthorizedException("Provided transaction wasn't found.");
      }
      // Verify transaction ownership
      if (transactionExists.userId !== userId) {
        throw new UnauthorizedException(
          'You do not have permission to update this transaction!',
        );
      }
      //Calculate the old transaction's impact on the old account
      const oldAccountChange =
        transactionExists.type === 'EXPENSE'
          ? transactionExists.amount.toNumber()
          : -transactionExists.amount.toNumber();
      //Calculate the new transaction's impact on the new account
      const newAccountChange =
        transactionData.type === 'EXPENSE'
          ? -transactionData.amount
          : transactionData.amount;
      //Check if account changed
      const accountChanged =
        transactionExists.accountId !== transactionData.accountId;
      //Transaction To Update
      const transaction = await this.prisma.$transaction(async (txn) => {
        //Update The Transaction
        const updated = await txn.transaction.update({
          where: {
            id: transactionId,
          },
          data: {
            ...transactionData,
            nextRecurringDate:
              transactionData.isRecurring && transactionData.recurringInterval
                ? this.calculateNextReccuringDate(
                    transactionData.date,
                    transactionData.recurringInterval,
                  )
                : null,
          },
        });
        if (accountChanged) {
          // Different accounts: reverse old transaction from old account
          await txn.account.update({
            where: { id: transactionExists.accountId },
            data: {
              balance: {
                increment: oldAccountChange,
              },
            },
          });
          // Apply new transaction to new account
          await txn.account.update({
            where: { id: transactionData.accountId },
            data: {
              balance: {
                increment: newAccountChange,
              },
            },
          });
        } else {
          // Same account: apply net balance change
          const netBalanceChange = newAccountChange - -oldAccountChange;
          await txn.account.update({
            where: { id: transactionData.accountId },
            data: {
              balance: {
                increment: netBalanceChange,
              },
            },
          });
        }
        //Return
        return updated;
      });
      //Response
      return {
        message: 'Successfully Updated!',
        transactionInfo: transaction,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException('Internal Server Error!');
    }
  }
}
