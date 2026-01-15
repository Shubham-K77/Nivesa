/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/require-await */
import { Logger } from '@nestjs/common';
import { inngest } from './client';
import { AppService } from '../app.service';

interface InngestDependencies {
  appService: AppService;
  logger: Logger;
}

export const getInngestFunctions = (deps: InngestDependencies) => {
  const { logger, appService } = deps;

  const helloWorld = inngest.createFunction(
    { id: 'hello-world' },
    { event: 'test/hello.world' },
    async ({ event, step }) => {
      const result = await step.run('log-event', async () => {
        logger.log(`Hello ${event.data.email}!`);
        return { message: `Hello ${event.data.email}!` };
      });
      return result;
    },
  );

  return [helloWorld];
};
