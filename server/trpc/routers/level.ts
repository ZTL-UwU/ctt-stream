import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '~~/server/db';
import { eventsToLevels, levels } from '~~/server/db/schema';
import { publicProcedure, router } from '../trpc';

export const levelRouter = router({
  getAll: publicProcedure.query(async () => {
    return await db.query.levels.findMany({
      with: {
        events: true,
        results: true,
      },
    });
  }),

  create: publicProcedure
    .input(z.object({
      name: z.string(),
    }))
    .mutation(async ({ input }) => {
      await db.insert(levels)
        .values({ name: input.name });
    }),

  update: publicProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;
      const data: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(rest)) {
        if (v !== undefined)
          data[k] = v;
      }
      if (Object.keys(data).length > 0) {
        await db.update(levels).set(data).where(eq(levels.id, id));
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input: { id } }) => {
      // Remove dependent rows first due to FK constraints
      await db.delete(eventsToLevels).where(eq(eventsToLevels.levelId, id));
      await db.delete(levels).where(eq(levels.id, id));
      return { id };
    }),
});
