import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, primaryKey, timestamp, varchar } from 'drizzle-orm/pg-core';

export const players = pgTable('players', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  streamId: varchar({ length: 255 }).notNull(),
  avatar: varchar({ length: 255 }).notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const events = pgTable('events', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  active: boolean().default(false).notNull(),
  name: varchar({ length: 255 }).notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const levels = pgTable('levels', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const eventsToLevels = pgTable('events_to_levels', {
  eventId: integer().notNull().references(() => events.id),
  levelId: integer().notNull().references(() => levels.id),
}, t => [
  primaryKey({ columns: [t.eventId, t.levelId] }),
]);

export const playersToEvents = pgTable('players_to_events', {
  playerId: integer().notNull().references(() => players.id),
  eventId: integer().notNull().references(() => events.id),
}, t => [
  primaryKey({ columns: [t.playerId, t.eventId] }),
]);

export const results = pgTable('results', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  playerId: integer().notNull().references(() => players.id),
  eventId: integer().notNull().references(() => events.id),
  levelId: integer().notNull().references(() => levels.id),
  time: integer().notNull(), // in milliseconds
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const playersToEventsRelations = relations(playersToEvents, ({ one }) => ({
  player: one(players, {
    fields: [playersToEvents.playerId],
    references: [players.id],
  }),
  event: one(events, {
    fields: [playersToEvents.eventId],
    references: [events.id],
  }),
}));

export const eventsToLevelsRelations = relations(eventsToLevels, ({ one }) => ({
  event: one(events, {
    fields: [eventsToLevels.eventId],
    references: [events.id],
  }),
  level: one(levels, {
    fields: [eventsToLevels.levelId],
    references: [levels.id],
  }),
}));

export const playerRelations = relations(players, ({ many }) => ({
  events: many(playersToEvents),
  results: many(results),
}));

export const eventRelations = relations(events, ({ many }) => ({
  levels: many(eventsToLevels),
  players: many(playersToEvents),
}));

export const levelRelations = relations(levels, ({ many }) => ({
  events: many(eventsToLevels),
  results: many(results),
}));

export const resultsRelations = relations(results, ({ one }) => ({
  player: one(players, {
    fields: [results.playerId],
    references: [players.id],
  }),
  event: one(events, {
    fields: [results.eventId],
    references: [events.id],
  }),
  level: one(levels, {
    fields: [results.levelId],
    references: [levels.id],
  }),
}));
