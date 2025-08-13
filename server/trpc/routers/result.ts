import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '~~/server/db';
import { results } from '~~/server/db/schema';
import { publicProcedure, router } from '../trpc';

export const resultRouter = router({
  getAll: publicProcedure.query(async () => {
    return await db.query.results.findMany({
      with: { event: true, player: true, level: true },
      orderBy: (r, { asc }) => [asc(r.createdAt)],
    });
  }),

  getByEvent: publicProcedure
    .query(async () => {
      const activeEvent = await db.query.events.findFirst({
        where: (e, { eq }) => eq(e.active, true),
      });
      if (!activeEvent) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No active event found',
        });
      }

      return await db.query.results.findMany({
        where: (r, { eq }) => eq(r.eventId, activeEvent.id),
        with: {
          event: true,
          player: true,
          level: true,
        },
        orderBy: (r, { asc }) => [asc(r.createdAt)],
      });
    }),

  create: publicProcedure
    .input(z.object({
      eventId: z.number(),
      playerId: z.number(),
      levelId: z.number(),
      time: z.number(),
    }))
    .mutation(async ({ input }) => {
      const inserted = await db.insert(results)
        .values({
          eventId: input.eventId,
          playerId: input.playerId,
          levelId: input.levelId,
          time: input.time,
        })
        .returning();
      return inserted[0];
    }),

  update: publicProcedure
    .input(z.object({
      id: z.number(),
      time: z.number().optional(),
      levelId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, time, levelId } = input;
      const updates: Record<string, any> = {};
      if (time !== undefined)
        updates.time = time;
      if (levelId !== undefined)
        updates.levelId = levelId;
      if (Object.keys(updates).length) {
        await db.update(results).set(updates).where(eq(results.id, id));
      }
      return await db.query.results.findFirst({ where: (r, { eq }) => eq(r.id, id) });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input: { id } }) => {
      await db.delete(results).where(eq(results.id, id));
      return { id };
    }),
});
