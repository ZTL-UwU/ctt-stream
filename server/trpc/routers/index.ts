import { TRPCError } from '@trpc/server';
import { db } from '~~/server/db';
import { eventRouter } from '~~/server/trpc/routers/event';
import { levelRouter } from '~~/server/trpc/routers/level';
import { playerRouter } from '~~/server/trpc/routers/player';
import { resultRouter } from '~~/server/trpc/routers/result';
import { publicProcedure, router } from '../trpc';

export const appRouter = router({
  event: eventRouter,
  level: levelRouter,
  player: playerRouter,
  result: resultRouter,
  leaderboard: publicProcedure.query(async () => {
    const activeEvent = await db.query.events.findFirst({
      with: {
        levels: {
          with: {
            level: true,
          },
        },
        players: {
          with: {
            player: {
              with: {
                results: {
                  with: { level: true },
                },
              },
            },
          },
        },
      },
      where: (e, { eq }) => eq(e.active, true),
    });
    if (!activeEvent) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'No active event found' });
    }

    const leaderboard = activeEvent.players.map((pRel) => {
      const player = pRel.player;
      const bestByLevel = new Map<number, { time: number; levelName?: string }>();
      for (const r of player.results) {
        if (r.eventId !== activeEvent.id)
          continue;
        if (!r.levelId)
          continue;
        const existing = bestByLevel.get(r.levelId);
        if (!existing || r.time < existing.time) {
          bestByLevel.set(r.levelId, { time: r.time, levelName: r.level?.name });
        }
      }
      const bestTimes = Array.from(bestByLevel.entries()).map(([levelId, v]) => ({ levelId, time: v.time, levelName: v.levelName }));
      const totalTime = bestTimes.reduce((sum, bt) => sum + bt.time, 0);
      return { player, totalTime, bestTimes };
    }).sort((a, b) => {
      if (a.bestTimes.length === b.bestTimes.length)
        return a.totalTime - b.totalTime;
      return b.bestTimes.length - a.bestTimes.length;
    });

    return { leaderboard, levelAmount: activeEvent.levels.length, levels: activeEvent.levels };
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
