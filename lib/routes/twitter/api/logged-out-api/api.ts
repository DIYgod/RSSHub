import { config } from '@/config';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';

import { TWITTER_USER_CACHE_EXPIRE } from '../../utils';
import type { ApiParams } from '../web-api/utils';
import type { SerovalValue } from './seroval';
import { readSeroval } from './seroval';

/*
 * Reads the posts that x.com embeds in the pages it renders for logged-out visitors, so no credentials are needed.
 *
 * A profile page (x.com/<user>) has the latest original posts of the account, about five plus the pinned post, and no
 * reposts or replies. A post page (x.com/i/status/<id>) has the post and some of its replies. The pages carry the
 * GraphQL responses of x.com as seroval stream messages, which are read without evaluating them, and the posts in them
 * are converted to the legacy shape that ProcessFeed reads.
 */

interface User {
    rest_id?: string;
    core?: { name?: string; screen_name?: string };
    avatar?: { image_url?: string };
    profile_bio?: { description?: string };
}

interface Media {
    indices?: number[];
    original_info?: { width?: number; height?: number };
}

interface Tweet {
    __typename?: string;
    rest_id: string;
    tweet?: Tweet;
    details?: {
        full_text?: string;
        display_text_range?: number[];
        created_at_ms?: number;
        hashtag_entities?: object[];
        cashtag_entities?: object[];
    };
    url_entities?: object[];
    mention_entities?: object[];
    media_entities2?: Media[];
    note_tweet?: { note_tweet_results?: { result?: { text?: string; entity_set?: Partial<Entities> } } };
    core?: { user_results?: { result?: User } };
    quoted_tweet_results?: { result?: Tweet };
    legacy?: { lang?: string; possibly_sensitive?: boolean };
    counts?: {
        favorite_count?: number;
        retweet_count?: number;
        reply_count?: number;
        quote_count?: number;
        bookmark_count?: number;
    };
    reply_to_results?: { rest_id?: string };
    reply_to_user_results?: { rest_id?: string; result?: User };
}

interface TweetContent {
    tweet_results?: { result?: Tweet };
}

interface Entry {
    entry_id?: string;
    content?: { items?: Array<{ item?: { content?: TweetContent } }>; content?: TweetContent };
}

interface Instruction {
    __typename?: string;
    entry?: Entry;
    entries?: Entry[];
}

interface PageNode {
    timeline?: { instructions?: Instruction[] };
    instructions?: Instruction[];
}

interface Entities {
    hashtags: object[];
    symbols: object[];
    urls: object[];
    user_mentions: object[];
}

interface LegacyUser {
    id_str: string | undefined;
    name: string | undefined;
    screen_name: string;
    profile_image_url_https: string | undefined;
}

interface LegacyTweet {
    id_str: string;
    full_text: string;
    display_text_range: number[] | undefined;
    created_at: string | undefined;
    lang: string | undefined;
    possibly_sensitive: boolean | undefined;
    user: LegacyUser | undefined;
    user_id_str: string | undefined;
    entities: Entities;
    extended_entities: { media: Media[] } | undefined;
    favorite_count: number | undefined;
    retweet_count: number | undefined;
    reply_count: number | undefined;
    quote_count: number | undefined;
    bookmark_count: number | undefined;
    in_reply_to_status_id_str: string | undefined;
    in_reply_to_user_id_str: string | undefined;
    in_reply_to_screen_name: string | undefined;
    in_reply_to_status?: LegacyTweet;
    is_quote_status: boolean;
    quoted_status: LegacyTweet | undefined;
}

const baseUrl = 'https://x.com';
const SCRIPT = /<script\b[^>]*>([\s\S]*?)<\/script\b[^>]*>/gi;
const STREAM_MESSAGE = /^\(\$R=>\$R\[\d+\]\.next\(/;

const parseJson = (text: string) => {
    try {
        return JSON.parse(text);
    } catch {
        return;
    }
};

const getFailureKey = (path: string) => `twitter:logged-out:failure:${path}`;

/** Downloads a page as a logged-out visitor. A failure is remembered for a while, so that the next call does not try again right away */
const fetchPage = async (path: string) => {
    const failure = await cache.get(getFailureKey(path));
    if (failure) {
        throw new Error(failure);
    }
    try {
        return await ofetch(`${baseUrl}${path}`, { responseType: 'text' });
    } catch (error) {
        const message = `Failed to read ${baseUrl}${path} as a logged-out visitor: ${error instanceof Error ? error.message : error}`;
        await cache.set(getFailureKey(path), message, config.cache.routeExpire);
        throw new Error(message, { cause: error });
    }
};

/** The data messages that x.com streams into a page */
const readPageData = (html: string) => {
    const messages: SerovalValue[] = [];
    for (const [, script] of html.matchAll(SCRIPT)) {
        const start = STREAM_MESSAGE.exec(script);
        if (!start || !script.includes('Result.Ok')) {
            continue;
        }
        try {
            messages.push(readSeroval(script, start[0].length));
        } catch (error) {
            logger.debug(`twitter logged-out: skipped a data message that cannot be read: ${error}`);
        }
    }
    return messages;
};

/** The first value that `pick` returns for an object in `node`, depth first. GraphQL responses sent as JSON strings are decoded on the way */
const find = <T>(node: SerovalValue, pick: (object: PageNode) => T | undefined, depth = 0): T | undefined => {
    if (!node || typeof node !== 'object' || depth > 64) {
        return;
    }
    if (!Array.isArray(node)) {
        if (node.kind === 'Result.Ok' && typeof node.value === 'string') {
            node.value = parseJson(node.value);
        }
        const picked = pick(node);
        if (picked) {
            return picked;
        }
    }
    for (const value of Object.values(node)) {
        const found = find(value, pick, depth + 1);
        if (found) {
            return found;
        }
    }
    return;
};

/** Timeline entries, pinned ones first as the web API returns them */
const getEntries = (instructions: Instruction[]): Entry[] => [
    ...instructions.flatMap((instruction) => (instruction?.__typename === 'TimelinePinEntry' && instruction.entry ? [instruction.entry] : [])),
    ...instructions.flatMap((instruction) => instruction?.entries ?? []),
];

const unwrapTweet = (result: Tweet | undefined) => {
    const tweet = result?.__typename === 'TweetWithVisibilityResults' ? result.tweet : result;
    return tweet?.__typename === 'Tweet' && tweet.rest_id ? tweet : undefined;
};

/** The posts of entries: one for an item, several for a module such as a conversation thread */
const getTweets = (entries: Entry[]) => {
    const tweets = new Map<string, Tweet>();
    for (const entry of entries) {
        const content = entry?.content;
        const results = Array.isArray(content?.items) ? content.items.map((item) => item?.item?.content?.tweet_results?.result) : [content?.content?.tweet_results?.result];
        for (const result of results) {
            const tweet = unwrapTweet(result);
            if (tweet && !tweets.has(tweet.rest_id)) {
                tweets.set(tweet.rest_id, tweet);
            }
        }
    }
    return tweets.values().toArray();
};

const toLegacyUser = (user: User | undefined): LegacyUser | undefined =>
    user?.core?.screen_name
        ? {
              id_str: user.rest_id,
              name: user.core.name,
              screen_name: user.core.screen_name,
              profile_image_url_https: user.avatar?.image_url,
          }
        : undefined;

/** The t.co link that a media item adds to the end of the text, so that ProcessFeed can remove it */
const getMediaLink = (text: string[], indices: Media['indices']) => {
    if (!Array.isArray(indices) || typeof indices[0] !== 'number' || typeof indices[1] !== 'number') {
        return '';
    }
    // Indices count code points, not UTF-16 units
    const link = text.slice(indices[0], indices[1]).join('');
    return link.startsWith('https://t.co/') ? link : '';
};

/** Converts a post to the legacy shape that ProcessFeed reads */
const toLegacyTweet = (tweet: Tweet, withQuote = true): LegacyTweet => {
    const details = tweet.details ?? {};
    const text = typeof details.full_text === 'string' ? details.full_text : '';
    // oxlint-disable-next-line typescript/no-misused-spread -- the indices of x.com count code points
    const codePoints = [...text];
    const media = (tweet.media_entities2 ?? []).map((item) => ({
        ...item,
        url: getMediaLink(codePoints, item.indices),
        sizes: { large: { w: item.original_info?.width, h: item.original_info?.height } },
    }));
    // Long posts carry their full text separately, with entities of their own
    const note = tweet.note_tweet?.note_tweet_results?.result;
    const longPost = typeof note?.text === 'string' && note.entity_set ? { text: note.text, entities: note.entity_set } : undefined;
    const user = toLegacyUser(tweet.core?.user_results?.result);
    const quoted = withQuote ? unwrapTweet(tweet.quoted_tweet_results?.result) : undefined;
    const createdAt = details.created_at_ms;

    return {
        id_str: tweet.rest_id,
        full_text: longPost?.text ?? text,
        display_text_range: details.display_text_range,
        created_at: typeof createdAt === 'number' ? Temporal.Instant.fromEpochMilliseconds(createdAt).toString() : undefined,
        lang: tweet.legacy?.lang,
        possibly_sensitive: tweet.legacy?.possibly_sensitive,
        user,
        user_id_str: user?.id_str,
        entities: longPost
            ? {
                  hashtags: longPost.entities.hashtags ?? [],
                  symbols: longPost.entities.symbols ?? [],
                  urls: longPost.entities.urls ?? [],
                  user_mentions: longPost.entities.user_mentions ?? [],
              }
            : {
                  hashtags: details.hashtag_entities ?? [],
                  symbols: details.cashtag_entities ?? [],
                  urls: tweet.url_entities ?? [],
                  user_mentions: tweet.mention_entities ?? [],
              },
        extended_entities: media.length ? { media } : undefined,
        favorite_count: tweet.counts?.favorite_count,
        retweet_count: tweet.counts?.retweet_count,
        reply_count: tweet.counts?.reply_count,
        quote_count: tweet.counts?.quote_count,
        bookmark_count: tweet.counts?.bookmark_count,
        in_reply_to_status_id_str: tweet.reply_to_results?.rest_id,
        in_reply_to_user_id_str: tweet.reply_to_user_results?.rest_id,
        in_reply_to_screen_name: tweet.reply_to_user_results?.result?.core?.screen_name,
        is_quote_status: Boolean(quoted),
        quoted_status: quoted && toLegacyTweet(quoted, false),
    };
};

const parseProfilePage = (html: string) => {
    for (const message of readPageData(html)) {
        const instructions = find(message, (object) => (Array.isArray(object.timeline?.instructions) ? object.timeline.instructions : undefined));
        if (!instructions) {
            continue;
        }
        const tweets = getTweets(getEntries(instructions).filter((entry) => entry?.entry_id?.startsWith('tweet-')));
        // The page has no profile of its own: the posts carry it
        const author = tweets[0]?.core?.user_results?.result;
        return {
            user: author?.core?.screen_name
                ? {
                      id_str: author.rest_id,
                      name: author.core.name,
                      screen_name: author.core.screen_name,
                      profile_image_url: author.avatar?.image_url,
                      description: author.profile_bio?.description,
                  }
                : undefined,
            tweets: tweets.map((tweet) => toLegacyTweet(tweet)),
        };
    }
    return {};
};

const parseStatusPage = (html: string, status: string) => {
    const focalEntryId = `tweet-${status}`;
    for (const message of readPageData(html)) {
        const instructions = find(message, (object) => (Array.isArray(object.instructions) && getEntries(object.instructions).some((entry) => entry?.entry_id === focalEntryId) ? object.instructions : undefined));
        if (instructions) {
            const entries = getEntries(instructions).filter((entry) => entry?.entry_id === focalEntryId || entry?.entry_id?.startsWith('conversationthread-'));
            return getTweets(entries).map((tweet) => toLegacyTweet(tweet));
        }
    }
    return [];
};

const getProfilePath = (id: string) => (id.startsWith('+') ? `/i/user/${encodeURIComponent(id.slice(1))}` : `/${encodeURIComponent(id)}`);

// An empty result is cached as well, so that the configured API takes over without asking x.com again
const getProfilePage = (id: string) => cache.tryGet(`twitter:logged-out:profile:${id}`, async () => parseProfilePage(await fetchPage(getProfilePath(id))), config.cache.routeExpire, false);

const getUser = (id: string) =>
    cache.tryGet(
        `twitter:logged-out:user:${id}`,
        async () => {
            const { user } = await getProfilePage(id);
            if (!user) {
                throw new Error(`x.com shows logged-out visitors no posts of ${id} to read the profile from`);
            }
            return user;
        },
        TWITTER_USER_CACHE_EXPIRE
    );

const getUserTweets = async (id: string) => {
    const { tweets } = await getProfilePage(id);
    if (!tweets) {
        throw new Error(`x.com shows logged-out visitors no timeline of ${id}; the account may be protected, suspended or unavailable`);
    }
    return tweets;
};

const getUserTweet = async (_id: string, params?: ApiParams) => {
    const status = String(params?.focalTweetId);
    if (!/^\d+$/.test(status)) {
        throw new Error(`Invalid post ID: ${status}`);
    }
    const tweets = await cache.tryGet(`twitter:logged-out:status:${status}`, async () => parseStatusPage(await fetchPage(`/i/status/${status}`), status), config.cache.routeExpire, false);
    // Replies point to the posts they answer, for includeReplyContext
    const tweetsById = new Map(tweets.map((tweet) => [tweet.id_str, tweet]));
    for (const tweet of tweets) {
        const parent = tweet.in_reply_to_status_id_str ? tweetsById.get(tweet.in_reply_to_status_id_str) : undefined;
        if (parent && parent !== tweet) {
            tweet.in_reply_to_status = parent;
        }
    }
    return tweets;
};

export default {
    getUser,
    getUserTweets,
    getUserTweet,
};
