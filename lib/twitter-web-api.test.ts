import { describe, expect, it, vi } from 'vitest';

import { gatherLegacyFromData } from '@/routes/twitter/api/web-api/utils';
import twitterUtils from '@/routes/twitter/utils';

// Synthetic API shapes: no captured tweets, account data or credentials.
const context = () => ({ req: { param: vi.fn() } });
const entry = (tweet: any) => ({ entryId: `tweet-${tweet.rest_id || tweet.tweet?.rest_id}`, content: { itemContent: { tweet_results: { result: tweet } } } });
const note = (text: string) => ({ note_tweet_results: { result: { text, entity_set: { hashtags: [], symbols: [], urls: [], user_mentions: [] } } } });
const tweet = (id: string, fullText = 'short') => ({
    rest_id: id,
    core: { user_results: { result: { core: { name: 'Fixture', screen_name: 'fixture' } } } },
    legacy: { id_str: id, conversation_id_str: id, user_id_str: 'owner', full_text: fullText, created_at: 'Wed Oct 28 00:00:00 +0000 2026', entities: { urls: [] } },
});
const render = (data: any[], readable: boolean) => twitterUtils.ProcessFeed(context(), { data: structuredClone(data) }, { readable });

describe('Twitter Web API note and quote normalization', () => {
    for (const wrapped of [false, true]) {
        for (const readable of [false, true]) {
            it(`renders the full quoted note and its own permalink: wrapped=${wrapped}, readable=${readable}`, () => {
                const quote: any = tweet('2', 'preview https://t.co/preview');
                delete quote.legacy.id_str;
                quote.legacy.conversation_id_str = '999';
                quote.note_tweet = note('Full quoted note https://t.co/full #fixture @example');
                const entities = quote.note_tweet.note_tweet_results.result.entity_set;
                entities.urls = [{ url: 'https://t.co/full', expanded_url: 'https://example.org/full-note', display_url: 'example.org/full-note' }];
                entities.hashtags = [{ text: 'fixture' }];
                entities.user_mentions = [{ screen_name: 'example', name: 'Example' }];
                const root: any = tweet('1');
                root.legacy.is_quote_status = true;
                root.quoted_status_result = { result: wrapped ? { tweet: quote } : quote };
                const data = gatherLegacyFromData([entry(root)]);
                expect(data[0].quoted_status.full_text).toBe(quote.note_tweet.note_tweet_results.result.text);
                expect(data[0].quoted_status.entities).toMatchObject(entities);
                expect(data[0].quoted_status.id_str).toBe('2');
                const item = render(data, readable)[0];
                expect(item.description).toContain('Full quoted note');
                expect(item.description).toContain('https://example.org/full-note');
                expect(item.description).not.toContain('https://t.co/preview');
                expect(item.description.split("href='https://x.com/fixture/status/2'")).toHaveLength(2);
                expect(item.description).not.toContain('/status/999');
                expect(item.guid).toBe('https://twitter.com/fixture/status/1');
            });
        }
    }
    it('ordinary text and main note remain usable', () => {
        const ordinary = tweet('1', 'ordinary');
        const long = { ...tweet('2'), note_tweet: note('main long 中文 😀') };
        const result = gatherLegacyFromData([entry(ordinary), entry(long)]);
        expect(result.map((t: any) => t.full_text)).toEqual(['ordinary', 'main long 中文 😀']);
    });
    for (const wrapped of [false, true]) {
        it(`retweet containing quote note is normalized, wrapped=${wrapped}`, () => {
            const quote = { ...tweet('3'), note_tweet: note('quote long') };
            delete (quote.legacy as any).id_str;
            quote.legacy.conversation_id_str = 'wrong-thread-id';
            const retweet = { ...tweet('4'), note_tweet: note('retweet long'), quoted_status_result: { result: { tweet: quote } } };
            (retweet.legacy as any).is_quote_status = true;
            const root = tweet('5');
            (root.legacy as any).retweeted_status_result = { result: wrapped ? { tweet: retweet } : retweet };
            const parsed = gatherLegacyFromData([entry(root)])[0].retweeted_status;
            expect(parsed.full_text).toBe('retweet long');
            expect(parsed.quoted_status.full_text).toBe('quote long');
            expect(parsed.quoted_status.id_str).toBe('3');
            const data = gatherLegacyFromData([entry(structuredClone(root))]);
            const item = render(data, false)[0];
            expect(item.description).toContain('/status/3');
        });
    }
    it('short quote and unavailable quote do not fabricate a full body', () => {
        const root = tweet('6');
        (root.legacy as any).is_quote_status = true;
        const short = { ...root, quoted_status_result: { result: tweet('7', 'author short') } };
        expect(gatherLegacyFromData([entry(short)])[0].quoted_status.full_text).toBe('author short');
        const unavailable = { ...tweet('8'), quoted_status_result: { result: { __typename: 'TweetUnavailable' } } };
        (unavailable.legacy as any).is_quote_status = true;
        const data = gatherLegacyFromData([entry(unavailable)]);
        const item = render(data, false)[0];
        expect(item.description).not.toContain('undefined');
    });
    it('missing note result/entities retains preview and legacy entities', () => {
        const malformed = { ...tweet('9', 'preview'), note_tweet: { note_tweet_results: {} } };
        expect(gatherLegacyFromData([entry(malformed)])[0].full_text).toBe('preview');
        const sparse = { ...tweet('10'), note_tweet: { note_tweet_results: { result: { text: 'long', entity_set: { hashtags: [] } } } } };
        expect(gatherLegacyFromData([entry(sparse)])[0].entities.urls).toEqual([]);
    });
    for (const readable of [false, true]) {
        it(`no quote self-ID never invents a conversation-root source link, readable=${readable}`, () => {
            const quote: any = tweet('quote');
            delete quote.rest_id;
            delete quote.legacy.id_str;
            quote.legacy.conversation_id_str = 'conversation-root';
            const root: any = tweet('root');
            root.legacy.is_quote_status = true;
            root.quoted_status_result = { result: quote };
            const item = render(gatherLegacyFromData([entry(root)]), readable)[0];
            expect(item.description).not.toContain('/status/conversation-root');
            expect(item.description).not.toContain('/status/undefined');
        });
    }
    it('upstream reply context survives author filter and is not lost by normalization', () => {
        const parent = tweet('11', 'other-author-parent');
        parent.legacy.user_id_str = 'other';
        const child = tweet('12', 'reply');
        (child.legacy as any).in_reply_to_status_id_str = '11';
        const result = gatherLegacyFromData([entry(child), entry(parent)], undefined, 'owner');
        expect(result).toHaveLength(1);
        expect(result[0].in_reply_to_status.full_text).toBe('other-author-parent');
    });
    it('subscriber preview is still explicitly marked', () => {
        const preview = { __typename: 'TweetPreviewDisplay', tweet: { rest_id: '13', text: 'preview only', core: tweet('13').core } };
        expect(gatherLegacyFromData([entry(preview)])[0].full_text).toContain('[Subscribers Only]');
    });
    it('reply context remains opt-in and terminates on a cycle', () => {
        const parent = tweet('15', 'parent body');
        const child = tweet('16', 'child body');
        (child.legacy as any).in_reply_to_status_id_str = '15';
        (parent.legacy as any).in_reply_to_status_id_str = '16';
        const parsed = gatherLegacyFromData([entry(child), entry(parent)]);
        const off = twitterUtils.ProcessFeed(context(), { data: structuredClone(parsed) }, { includeReplyContext: false })[0];
        const on = twitterUtils.ProcessFeed(context(), { data: structuredClone(parsed) }, { includeReplyContext: true })[0];
        expect(off.description).not.toContain('parent body');
        expect(on.description).toContain('parent body');
        expect(on.description.length).toBeLessThan(4000);
    });
    it('external/article placeholder is not converted into invented article text', () => {
        const raw = { ...tweet('14', 'https://t.co/link'), article: { article_results: { result: { plain_text: 'unverified article' } } } };
        raw.legacy.entities.urls = [{ url: 'https://t.co/link', expanded_url: 'https://example.org/story' }] as any;
        const result = render(gatherLegacyFromData([entry(raw)]), false)[0];
        expect(result.description).toContain('https://example.org/story');
        expect(result.description).not.toContain('unverified article');
    });
});
