import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/:section?/:type?/:value?/:minComments?',
    categories: ['programming'],
    view: ViewType.Articles,
    example: '/hackernews/threads/comments_list/dang',
    parameters: {
        section: {
            description: 'Content section, default to `index`. Common sections: `index`, `newest`, `ask`, `show`, `jobs`, `over`, `threads`, `submitted`. Any valid HN section (e.g. `best`, `front`, `active`) is also accepted',
        },
        type: {
            description: 'Content format, default to `sources`. `sources` links to original articles, `comments` fetches full comment threads, `comments_list` shows parent story with single comment',
        },
        value: {
            description:
                'For `threads`/`submitted` sections, set user ID. For `over` section, set minimum points threshold (default 100). For other sections, appended as `?id=<value>` (e.g. `value=dang` → `?id=dang`). In story-listing sections (`index`, `best`, `front`, `active`, `newest`, `ask`, `show`, `shownew`, `asknew`, `noobstories`, `pool`, `classic`, `launches`, `news`, `invited`), a purely numeric value acts as minimum comment count instead (same as `minComments`)',
        },
        minComments: {
            description:
                'Minimum comment count, items below it are filtered out. Works with any story-listing section, e.g. `/hackernews/over/sources/100/10`. For sections where `value` is unused (`index`, `best`, `front`, `active`, `newest`, `ask`, `show`, `shownew`, `asknew`, `noobstories`, `pool`, `classic`, `launches`, `news`, `invited`), the number may be placed in `value` instead, e.g. `/hackernews/index/sources/10`. Ignored on sections without story comment counts (`jobs`, `threads`, `newcomments`, `bestcomments`, `noobcomments`, `highlights`)',
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['news.ycombinator.com/'],
            target: '/',
        },
        ...['news', 'newest', 'ask', 'show', 'jobs', 'best', 'front', 'active'].map((section) => ({
            source: [`news.ycombinator.com/${section}`],
            target: `/${section}`,
        })),
    ],
    name: 'Stories',
    maintainers: ['nczitzk', 'xie-dongping'],
    handler,
    description: `Subscribe to Hacker News content by section, user, minimum points, or minimum comments

Examples:

| HN100              | User submitted                       | User threads                       | Comments list                            | Min comments                   |
| ------------------ | ------------------------------------ | ---------------------------------- | ---------------------------------------- | ------------------------------ |
| \`/hackernews/over\` | \`/hackernews/submitted/sources/dang\` | \`/hackernews/threads/sources/dang\` | \`/hackernews/threads/comments_list/dang\` | \`/hackernews/index/sources/10\` |`,
};

type Story = Omit<DataItem, 'comments' | 'upvotes'> & {
    comments: string | number | undefined;
    upvotes: string | number | undefined;
    origin?: string;
    onStory: string;
    currentComment: string;
};

const parseComments = (text: string): Story['comments'] => {
    if (text === 'discuss') {
        return text;
    }

    const match = text.match(/^(\d+)\s+comments?$/);
    return match ? Number.parseInt(match[1]) : '';
};

const rootUrl = 'https://news.ycombinator.com';

function getListingOptions(section: string, value: string, explicitMinComments?: string) {
    // Story-listing sections where `value` has no dedicated meaning; a purely numeric value there doubles as the
    // minimum comment count. Everywhere else numeric values stay HN IDs passed through as `?id=` (e.g. `/item`)
    const numericThresholdSections = ['index', 'best', 'front', 'active', 'newest', 'ask', 'show', 'shownew', 'asknew', 'noobstories', 'pool', 'classic', 'launches', 'news', 'invited'];
    // Sections whose rows carry no parseable story comment counts (comment listings or curated link pages),
    // so the filter cannot apply there
    const sectionsWithoutCommentCounts = ['jobs', 'threads', 'newcomments', 'bestcomments', 'noobcomments', 'highlights'];
    const valueIsThreshold = numericThresholdSections.includes(section) && /^\d+$/.test(value);
    const rawMinComments = explicitMinComments ?? (valueIsThreshold ? value : '');
    const minComments = /^\d+$/.test(rawMinComments) && !sectionsWithoutCommentCounts.includes(section) ? Number.parseInt(rawMinComments) : 0;

    const sectionUrl = section === 'index' ? '' : `/${section}`;
    let optUrl = value !== '' && !valueIsThreshold ? `?${new URLSearchParams({ id: value })}` : '';

    if (section === 'over') {
        optUrl = `?${new URLSearchParams({ points: value || '100' })}`;
    }

    return { currentUrl: `${rootUrl}${sectionUrl}${optUrl}`, minComments };
}

async function handler(ctx) {
    const section = ctx.req.param('section') ?? 'index';
    const type = ctx.req.param('type') ?? 'sources';
    const value = ctx.req.param('value') ?? '';
    if (!['sources', 'comments', 'comments_list'].includes(type)) {
        throw new InvalidParameterError('Invalid Hacker News content format. Use sources, comments, or comments_list.');
    }
    const { currentUrl, minComments } = getListingOptions(section, value, ctx.req.param('minComments'));

    const response = await got(currentUrl);

    const $ = load(response.data);
    let onStory = '';

    const list = $('.athing')
        .toArray()
        .map((thing) => {
            const $thing = $(thing);
            const date = $thing.find('.age').attr('title') ?? $thing.next().find('.age').attr('title');
            const pubDate = date ? parseDate(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(date) ? `${date}Z` : date) : undefined;
            const storyLink = $thing.find('.onstory a');
            const origin = $thing.find('.titleline').children('a').attr('href');
            if (storyLink.length) {
                onStory = storyLink.attr('title') ?? storyLink.text();
            }

            const item: Story = {
                guid: $thing.attr('id'),
                title: $thing.find('.titleline').children('a').text() || onStory,
                category: $thing.find('.sitestr').text(),
                author: $thing.find('.hnuser').text() || $thing.next().find('.hnuser').text(),
                pubDate: pubDate && !Number.isNaN(pubDate.getTime()) ? pubDate : undefined,

                link: '',
                origin: origin ? new URL(origin, rootUrl).href : undefined,
                onStory,

                // Only a "N comments" link carries the count; other trailing links (e.g. an age like "22 days ago"
                // on /invited) must not be misparsed as one
                comments: parseComments($thing.next().find('a').last().text()),
                upvotes: $thing.next().find('.score').text().split(' point', 1)[0],

                currentComment: $thing.find('.commtext').html() ?? '',
                description: '',
            };

            item.link = `${rootUrl}/item?id=${item.guid}`;
            item.description = `<a href="${item.link}">Comments on Hacker News</a>${item.origin ? ` | <a href="${item.origin}">Source</a>` : ''}`;

            return item;
        })
        .filter((item) => minComments === 0 || Number(item.comments) >= minComments)
        .slice(0, getRouteLimit(ctx, 30));

    const items = await pMap(
        list,
        async (item) => {
            if (item.comments !== 'discuss' && type === 'comments') {
                const body = await cache.tryGet(`hackernews:comments:${item.link}`, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = load(detailResponse.data);

                    content('.reply').remove();

                    let description = '';

                    content('.commtext').each((_, el) => {
                        const row = content(el).closest('.athing');
                        const author = row.find('.hnuser');
                        const comment = content(el);

                        description +=
                            `<div><div><small><a href="${rootUrl}/${author.attr('href')}">${author.text()}</a></small>` +
                            `&nbsp&nbsp<small><a href="${rootUrl}/item?id=${row.attr('id')}">` +
                            `${row.find('.age').attr('title')}</a></small></div>`;

                        description += `<div>${comment.html() ?? ''}</div></div>`;
                    });
                    return { description };
                });
                item.description = body.description;
            } else if (item.comments !== 'discuss' && type === 'comments_list') {
                item.title = item.onStory;
                item.description = item.currentComment;
            }

            return {
                guid: item.guid,
                title: item.title,
                category: item.category,
                author: item.author,
                pubDate: item.pubDate,
                description: item.description,
                link: type === 'sources' ? (item.origin ?? item.link) : item.link,
                comments: /^\d+$/.test(String(item.comments)) ? Number(item.comments) : item.comments === 'discuss' ? 0 : undefined,
                upvotes: /^\d+$/.test(String(item.upvotes)) ? Number(item.upvotes) : undefined,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
