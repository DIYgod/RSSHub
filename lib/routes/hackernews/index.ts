import { load } from 'cheerio';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:section?/:type?/:value?',
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
            description: 'For `threads`/`submitted` sections, set user ID. For `over` section, set minimum points threshold (default 100). For other sections, appended as `?id=<value>` (e.g. `value=dang` → `?id=dang`)',
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
    description: `Subscribe to Hacker News content by section, user, or minimum points

Examples:

| HN100              | User submitted                       | User threads                       | Comments list                            |
| ------------------ | ------------------------------------ | ---------------------------------- | ---------------------------------------- |
| \`/hackernews/over\` | \`/hackernews/submitted/sources/dang\` | \`/hackernews/threads/sources/dang\` | \`/hackernews/threads/comments_list/dang\` |`,
};

async function handler(ctx) {
    const section = ctx.req.param('section') ?? 'index';
    const type = ctx.req.param('type') ?? 'sources';
    const value = ctx.req.param('value') ?? '';

    const rootUrl = 'https://news.ycombinator.com';
    const sectionUrl = section === 'index' ? '' : `/${section}`;
    let optUrl = value === '' ? '' : '?id=' + value;

    if (section === 'over') {
        optUrl = value === '' ? '?points=100' : '?points=' + value;
    }

    const currentUrl = `${rootUrl}${sectionUrl}${optUrl}`;
    const response = await got(currentUrl);

    const $ = load(response.data);

    const list = $('.athing')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 30)
        .toArray()
        .map((thing) => {
            thing = $(thing);

            const item = {
                guid: thing.attr('id'),
                title: thing.find('.titleline').children('a').text(),
                category: thing.find('.sitestr').text(),
                author: thing.next().find('.hnuser').text(),
                pubDate: parseDate(thing.find('.age').attr('title') ?? thing.next().find('.age').attr('title')),

                link: '',
                origin: thing.find('.titleline').children('a').attr('href'),
                onStory: thing.find('.onstory').text().slice(2),

                comments: thing.next().find('a').last().text().split(' comment', 1)[0],
                upvotes: thing.next().find('.score').text().split(' point', 1)[0],

                currentComment: thing.find('.comment').text(),
                description: '',
            };

            item.link = `${rootUrl}/item?id=${item.guid}`;
            item.guid = type === 'sources' ? item.guid : `${item.guid}${item.comments === 'discuss' ? '' : `-${item.comments}`}`;
            item.description = `<a href="${item.link}">Comments on Hacker News</a> | <a href="${item.origin}">Source</a>`;

            return item;
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.guid, async () => {
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

                        const commentText = comment.clone();

                        commentText.find('p').remove();
                        commentText.html(`<p>${commentText.text()}</p>`);
                        commentText.append(
                            comment
                                .find('p')
                                .toArray()
                                .map((p) => `<p>${content(p).html()}</p>`)
                        );

                        item.description += `<div>${commentText.html()}</div></div>`;
                    });
                } else if (item.comments !== 'discuss' && type === 'comments_list') {
                    item.title = item.onStory;
                    item.description = item.currentComment;
                }

                if (Number.isNaN(item.comments)) {
                    item.comments = 0;
                }

                item.link = type === 'sources' ? item.origin : item.link;

                delete item.origin;

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
