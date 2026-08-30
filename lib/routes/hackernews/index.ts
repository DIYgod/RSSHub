import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

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
            source: ['news.ycombinator.com/:section', 'news.ycombinator.com/'],
        },
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
    comments: string | number;
    upvotes: string | number;
    origin?: string;
    onStory: string;
    currentComment: string;
};

const getCommentCount = (item: Story) => {
    const count = Number.parseInt(String(item.comments));
    return Number.isNaN(count) ? 0 : count;
};

const parseComments = (text: string): Story['comments'] => {
    const normalizedText = text.trim();
    if (normalizedText === 'discuss') {
        return normalizedText;
    }

    const match = normalizedText.match(/^(\d+)\s+comments?$/);
    return match ? Number.parseInt(match[1]) : '';
};

async function handler(ctx) {
    const section = ctx.req.param('section') ?? 'index';
    const type = ctx.req.param('type') ?? 'sources';
    const cacheType = ['sources', 'comments', 'comments_list'].includes(type) ? type : 'unknown';
    const value = ctx.req.param('value') ?? '';

    // Story-listing sections where `value` has no dedicated meaning; a purely numeric value there doubles as the
    // minimum comment count. Everywhere else numeric values stay HN IDs passed through as `?id=` (e.g. `/item`)
    const numericThresholdSections = ['index', 'best', 'front', 'active', 'newest', 'ask', 'show', 'shownew', 'asknew', 'noobstories', 'pool', 'classic', 'launches', 'news', 'invited'];
    // Sections whose rows carry no parseable story comment counts (comment listings or curated link pages),
    // so the filter cannot apply there
    const sectionsWithoutCommentCounts = ['jobs', 'threads', 'newcomments', 'bestcomments', 'noobcomments', 'highlights'];
    const explicitMinComments = ctx.req.param('minComments');
    const valueIsThreshold = numericThresholdSections.includes(section) && /^\d+$/.test(value);
    const rawMinComments = explicitMinComments ?? (valueIsThreshold ? value : '');
    const minComments = /^\d+$/.test(rawMinComments) && !sectionsWithoutCommentCounts.includes(section) ? Number.parseInt(rawMinComments) : 0;

    const rootUrl = 'https://news.ycombinator.com';
    const sectionUrl = section === 'index' ? '' : `/${section}`;
    let optUrl = value !== '' && !valueIsThreshold ? '?id=' + value : '';

    if (section === 'over') {
        optUrl = value === '' ? '?points=100' : '?points=' + value;
    }

    const currentUrl = `${rootUrl}${sectionUrl}${optUrl}`;
    const response = await got(currentUrl);

    const $ = load(response.data);

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 30;

    const things = $('.athing').toArray();
    const thingsToParse = minComments > 0 ? things : things.slice(0, limit);

    const list = thingsToParse.map((thing) => {
        const $thing = $(thing);
        const lastSubtextLink = $thing.next().find('a').last().text();
        const guid = $thing.attr('id');
        if (!guid) {
            throw new Error('Hacker News item is missing an ID');
        }

        const item: Story = {
            guid,
            title: $thing.find('.titleline').children('a').text(),
            category: $thing.find('.sitestr').text(),
            author: $thing.next().find('.hnuser').text(),
            pubDate: parseDate(($thing.find('.age').attr('title') ?? $thing.next().find('.age').attr('title'))!),

            link: '',
            origin: $thing.find('.titleline').children('a').attr('href'),
            onStory: $thing.find('.onstory').text().slice(2),

            // Only a "N comments" link carries the count; other trailing links (e.g. an age like "22 days ago"
            // on /invited) must not be misparsed as one
            comments: parseComments(lastSubtextLink),
            upvotes: $thing.next().find('.score').text().split(' point', 1)[0],

            currentComment: $thing.find('.comment').text(),
            description: '',
        };

        item.link = `${rootUrl}/item?id=${item.guid}`;
        item.guid = type === 'sources' || item.comments === '' || item.comments === 'discuss' ? item.guid : `${item.guid}-${item.comments}`;
        item.description = `<a href="${item.link}">Comments on Hacker News</a> | <a href="${item.origin}">Source</a>`;

        return item;
    });

    const filteredList = minComments > 0 ? list.filter((item) => getCommentCount(item) >= minComments) : list;
    const limitedList = minComments > 0 ? filteredList.slice(0, limit) : filteredList;

    const items = await Promise.all(
        limitedList.map((item) =>
            cache.tryGet(`hackernews:${cacheType}:${item.guid}`, async () => {
                if (item.comments !== 'discuss' && type === 'comments') {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = load(detailResponse.data);

                    content('.reply').remove();

                    item.description = '';

                    content('.comtr').each((_, el) => {
                        const author = content(el).find('.hnuser');
                        const comment = content(el).find('.commtext');

                        item.description +=
                            `<div><div><small><a href="${rootUrl}/${author.attr('href')}">${author.text()}</a></small>` +
                            `&nbsp&nbsp<small><a href="${rootUrl}/item?id=${content(el).attr('id')}">` +
                            `${content(el).find('.age').attr('title')}</a></small></div>`;

                        const leading = content(`<p>${comment.contents().not('p').text()}</p>`);
                        const paragraphs = comment
                            .find('p')
                            .toArray()
                            .map((p) => `<p>${content(p).html()}</p>`)
                            .join('');

                        item.description += `<div>${content.html(leading)}${paragraphs}</div></div>`;
                    });
                } else if (item.comments !== 'discuss' && type === 'comments_list') {
                    item.title = item.onStory;
                    item.description = item.currentComment;
                }

                item.comments = getCommentCount(item);

                item.link = (type === 'sources' ? item.origin : item.link)!;

                delete item.origin;

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items as DataItem[],
    };
}
