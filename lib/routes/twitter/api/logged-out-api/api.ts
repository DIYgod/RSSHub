import { config } from '@/config';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';

import { TWITTER_USER_CACHE_EXPIRE } from '../../utils';
import type { ApiParams } from '../web-api/utils';
import { readSeroval } from './seroval';

/*
 * Reads the posts that x.com embeds in the pages it renders for logged-out visitors, so no credentials are needed.
 *
 * A profile page (x.com/<user>) has the latest original posts of the account, about five plus the pinned post, and no
 * reposts or replies. A post page (x.com/i/status/<id>) has the post and some of its replies. The pages carry the
 * GraphQL responses of x.com as seroval stream messages, which are read without evaluating them, and the posts in them
 * are converted to the legacy shape that ProcessFeed reads.
 */

type Data = Record<string, any>;

const baseUrl = 'https://x.com';
const SCRIPT = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
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
    const messages: unknown[] = [];
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

/** The first object in `node`, depth first, that `match` accepts. GraphQL responses sent as JSON strings are decoded on the way */
const find = (node: unknown, match: (object: Data) => boolean, depth = 0): Data | undefined => {
    if (!node || typeof node !== 'object' || depth > 64) {
        return;
    }
    const object = node as Data;
    if (object.kind === 'Result.Ok' && typeof object.value === 'string') {
        object.value = parseJson(object.value);
    }
    if (!Array.isArray(object) && match(object)) {
        return object;
    }
    for (const value of Object.values(object)) {
        const found = find(value, match, depth + 1);
        if (found) {
            return found;
        }
    }
    return;
};

/** Timeline entries, pinned ones first as the web API returns them */
const getEntries = (instructions: Data[]): Data[] => [
    ...instructions.filter((instruction) => instruction?.__typename === 'TimelinePinEntry' && instruction.entry).map((instruction) => instruction.entry),
    ...instructions.flatMap((instruction) => instruction?.entries ?? []),
];

const unwrapTweet = (result: Data | undefined): Data | undefined => {
    const tweet = result?.__typename === 'TweetWithVisibilityResults' ? result.tweet : result;
    return tweet?.__typename === 'Tweet' && tweet.rest_id ? tweet : undefined;
};

/** The posts of entries: one for an item, several for a module such as a conversation thread */
const getTweets = (entries: Data[]) => {
    const tweets = new Map<string, Data>();
    for (const entry of entries) {
        const content = entry?.content;
        const results = Array.isArray(content?.items) ? content.items.map((item: Data) => item?.item?.content?.tweet_results?.result) : [content?.content?.tweet_results?.result];
        for (const result of results) {
            const tweet = unwrapTweet(result);
            if (tweet && !tweets.has(tweet.rest_id)) {
                tweets.set(tweet.rest_id, tweet);
            }
        }
    }
    return tweets.values().toArray();
};

const toLegacyUser = (user: Data | undefined) =>
    user?.core?.screen_name
        ? {
              id_str: user.rest_id,
              name: user.core.name,
              screen_name: user.core.screen_name,
              profile_image_url_https: user.avatar?.image_url,
          }
        : undefined;

/** The t.co link that a media item adds to the end of the text, so that ProcessFeed can remove it */
const getMediaLink = (text: string[], indices: unknown) => {
    if (!Array.isArray(indices) || typeof indices[0] !== 'number' || typeof indices[1] !== 'number') {
        return '';
    }
    // Indices count code points, not UTF-16 units
    const link = text.slice(indices[0], indices[1]).join('');
    return link.startsWith('https://t.co/') ? link : '';
};

/** Converts a post to the legacy shape that ProcessFeed reads */
const toLegacyTweet = (tweet: Data, withQuote = true): Data => {
    const details = tweet.details ?? {};
    const text = typeof details.full_text === 'string' ? details.full_text : '';
    const codePoints = [...text];
    const media = (tweet.media_entities2 ?? []).map((item: Data) => ({
        ...item,
        url: getMediaLink(codePoints, item.indices),
        sizes: { large: { w: item.original_info?.width, h: item.original_info?.height } },
    }));
    // Long posts carry their full text separately, with entities of their own
    const note = tweet.note_tweet?.note_tweet_results?.result;
    const noteEntities = typeof note?.text === 'string' ? note.entity_set : undefined;
    const user = toLegacyUser(tweet.core?.user_results?.result);
    const quoted = withQuote ? unwrapTweet(tweet.quoted_tweet_results?.result) : undefined;
    const createdAt = details.created_at_ms;

    return {
        id_str: tweet.rest_id,
        full_text: noteEntities ? note.text : text,
        display_text_range: details.display_text_range,
        created_at: typeof createdAt === 'number' ? Temporal.Instant.fromEpochMilliseconds(createdAt).toString() : undefined,
        lang: tweet.legacy?.lang,
        possibly_sensitive: tweet.legacy?.possibly_sensitive,
        user,
        user_id_str: user?.id_str,
        entities: noteEntities
            ? {
                  hashtags: noteEntities.hashtags ?? [],
                  symbols: noteEntities.symbols ?? [],
                  urls: noteEntities.urls ?? [],
                  user_mentions: noteEntities.user_mentions ?? [],
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

interface ProfilePage {
    user?: Data;
    tweets?: Data[];
}

const parseProfilePage = (html: string): ProfilePage => {
    for (const message of readPageData(html)) {
        const holder = find(message, (object) => Array.isArray(object.timeline?.instructions));
        if (!holder) {
            continue;
        }
        const tweets = getTweets(getEntries(holder.timeline.instructions).filter((entry) => entry?.entry_id?.startsWith('tweet-')));
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
        const conversation = find(message, (object) => Array.isArray(object.instructions) && getEntries(object.instructions).some((entry) => entry?.entry_id === focalEntryId));
        if (conversation) {
            const entries = getEntries(conversation.instructions).filter((entry) => entry?.entry_id === focalEntryId || entry?.entry_id?.startsWith('conversationthread-'));
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
        const parent = tweetsById.get(tweet.in_reply_to_status_id_str);
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
