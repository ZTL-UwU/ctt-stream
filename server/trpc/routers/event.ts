import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '~~/server/db';
import { events, eventsToLevels, playersToEvents, results } from '~~/server/db/schema';
import { publicProcedure, router } from '../trpc';

export const eventRouter = router({
  getAll: publicProcedure.query(async () => {
    return await db.query.events.findMany({
      with: {
        levels: {
          with: {
            level: true,
          },
        },
        players: {
          with: {
            player: true,
          },
        },
      },
      orderBy: (e, { asc }) => [asc(e.createdAt)],
    });
  }),

  getActive: publicProcedure.query(async () => {
    return await db.query.events.findFirst({
      where: (e, { eq }) => eq(e.active, true),
      with: {
        levels: {
          with: {
            level: true,
          },
        },
        players: {
          with: {
            player: true,
          },
        },
      },
    });
  }),

  create: publicProcedure
    .input(z.object({
      name: z.string(),
      levels: z.array(z.number()),
      players: z.array(z.number()),
    }))
    .mutation(async ({ input }) => {
      const newEvent = await db.insert(events)
        .values({ name: input.name })
        .returning();

      if (input.levels.length) {
        await db.insert(eventsToLevels)
          .values(input.levels.map(levelId => ({ eventId: newEvent[0].id, levelId })));
      }
      if (input.players.length) {
        await db.insert(playersToEvents)
          .values(input.players.map(playerId => ({ playerId, eventId: newEvent[0].id })));
      }
    }),

  update: publicProcedure
    .input(z.object({
      id: z.number(),
      active: z.boolean().optional(),
      name: z.string().optional(),
      levels: z.array(z.number()).optional(),
      players: z.array(z.number()).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, name, levels, players } = input;
      if (name)
        await db.update(events).set({ name }).where(eq(events.id, id));
      if (input.active !== undefined)
        await db.update(events).set({ active: input.active }).where(eq(events.id, id));

      if (levels) {
        await db.delete(eventsToLevels).where(eq(eventsToLevels.eventId, id));
        if (levels.length) {
          await db.insert(eventsToLevels)
            .values(levels.map(levelId => ({ eventId: id, levelId })));
        }
      }
      if (players) {
        await db.delete(playersToEvents).where(eq(playersToEvents.eventId, id));
        if (players.length) {
          await db.insert(playersToEvents)
            .values(players.map(playerId => ({ playerId, eventId: id })));
        }
      }
      return await db.query.events.findFirst({
        where: (e, { eq }) => eq(e.id, id),
        with: { levels: true, players: true },
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input: { id } }) => {
      await db.delete(results).where(eq(results.eventId, id));
      await db.delete(eventsToLevels).where(eq(eventsToLevels.eventId, id));
      await db.delete(playersToEvents).where(eq(playersToEvents.eventId, id));
      await db.delete(events).where(eq(events.id, id));
      return { id };
    }),
});
