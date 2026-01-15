/* eslint-disable @typescript-eslint/require-await */
import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'nivesa-app',
  name: 'Nivesa',
  retryFunction: async (attempt) => ({
    delay: Math.pow(2, attempt) * 1000,
    maxAttempts: 2,
  }),
});
