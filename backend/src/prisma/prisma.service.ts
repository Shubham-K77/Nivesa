import { Injectable, OnModuleInit } from '@nestjs/common';
import { getPrismaClientClass } from '../../generated/prisma/internal/class';

const PrismaClient = getPrismaClientClass(__dirname);

// Prevent multiple instances during hot reloads in development
const globalForPrisma = global as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined;
};

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    if (globalForPrisma.prisma) {
      // Reuse existing instance in development
      return globalForPrisma.prisma as PrismaService;
    }
    super();
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = this;
    }
  }

  async onModuleInit() {
    await this.$connect();
  }

  enableShutdownHooks(app: { close: () => Promise<void> }) {
    process.on('beforeExit', () => {
      void app.close();
    });
  }
}
