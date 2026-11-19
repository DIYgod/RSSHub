export const selectItems = <T extends { pubDate?: Temporal.Instant }>(items: T[]): T[] => items;
