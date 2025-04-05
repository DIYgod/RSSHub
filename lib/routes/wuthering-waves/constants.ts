import { ArticleType } from './enum';

/** The time-to-live of cache items in seconds. */
export const CACHE_TTL_SECONDS = 60 * 60 * 24;

/** The default amount of articles to fetch from the API. */
export const DEFAULT_LIMIT = 10;

/** The languages supported by the API. */
export const SUPPORTED_LANGUAGES = ['en', 'jp', 'kr', 'zh-tw', 'es', 'fr', 'de'];

/** {@link ArticleType}s mapped to their human readable name. */
export const ARTICLE_TYPE_NAME_MAPPING = {
    [ArticleType.Notice]: 'Notice',
    [ArticleType.News]: 'News',
    [ArticleType.Event]: 'Event',
} satisfies Record<ArticleType, string>;
