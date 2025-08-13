import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '~~/server/db';
import { players, playersToEvents, results } from '~~/server/db/schema';
import { publicProcedure, router } from '../trpc';

export const playerRouter = router({
  getAll: publicProcedure.query(async () => {
    return await db.query.players.findMany({
      with: {
        events: true,
        results: true,
      },
      orderBy: (p, { desc }) => [desc(p.createdAt)],
    });
  }),

  create: publicProcedure
    .input(z.object({
      name: z.string(),
      streamId: z.string(),
      avatar: z.string(),
    }))
    .mutation(async ({ input }) => {
      await db.insert(players)
        .values({ name: input.name, streamId: input.streamId, avatar: input.avatar });
    }),

  update: publicProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      streamId: z.string().optional(),
      avatar: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;
      const data: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(rest)) {
        if (v !== undefined)
          data[k] = v;
      }
      if (Object.keys(data).length > 0) {
        await db.update(players).set(data).where(eq(players.id, id));
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input: { id } }) => {
      // Remove dependent rows first due to FK constraints
      await db.delete(results).where(eq(results.playerId, id));
      await db.delete(playersToEvents).where(eq(playersToEvents.playerId, id));
      await db.delete(players).where(eq(players.id, id));
      return { id };
    }),
});
