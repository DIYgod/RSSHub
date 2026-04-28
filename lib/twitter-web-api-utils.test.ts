import { describe, expect, it } from 'vitest';

import { gatherLegacyFromData } from './routes/twitter/api/web-api/utils';

const buildUser = (name: string, screenName: string) => ({
    core: {
        name,
        screen_name: screenName,
    },
    legacy: {
        name: `${name} legacy`,
        profile_image_url_https: `https://example.com/${screenName}.jpg`,
        screen_name: `${screenName}_legacy`,
    },
});

const buildTweetEntry = (id: string, quotedResult?: Record<string, any>) => ({
    entryId: `tweet-${id}`,
    content: {
        itemContent: {
            tweet_results: {
                result: {
                    __typename: 'Tweet',
                    core: {
                        user_results: {
                            result: buildUser('Author', 'author'),
                        },
                    },
                    is_quote_status: Boolean(quotedResult),
                    legacy: {
                        conversation_id_str: id,
                        created_at: 'Sun Apr 26 14:01:56 +0000 2026',
                        entities: {
                            urls: [],
                        },
                        full_text: `tweet ${id}`,
                        is_quote_status: Boolean(quotedResult),
                    },
                    quoted_status_result: quotedResult && {
                        result: quotedResult,
                    },
                    rest_id: id,
                },
            },
        },
    },
});

describe('gatherLegacyFromData', () => {
    it('skips quoted tombstones without dropping the timeline', () => {
        const normalQuote = {
            __typename: 'Tweet',
            core: {
                user_results: {
                    result: buildUser('Quoted', 'quoted'),
                },
            },
            legacy: {
                conversation_id_str: '10',
                created_at: 'Sun Apr 26 13:00:00 +0000 2026',
                entities: {
                    urls: [],
                },
                full_text: 'quoted tweet',
            },
            rest_id: '10',
        };
        const tombstoneQuote = {
            __typename: 'TweetTombstone',
            tombstone: {
                text: {
                    text: 'This post is unavailable.',
                },
            },
        };

        const tweets = gatherLegacyFromData([buildTweetEntry('1', normalQuote), buildTweetEntry('2', tombstoneQuote)]);

        expect(tweets).toHaveLength(2);
        expect(tweets[0].quoted_status.user.screen_name).toBe('quoted');
        expect(tweets[1].quoted_status).toBeUndefined();
    });
});
