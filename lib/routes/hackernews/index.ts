import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:section?/:type?/:user?',
    categories: ['programming', 'popular'],
    view: ViewType.Articles,
    example: '/hackernews/threads/comments_list/dang',
    parameters: {
        section: {
            description: 'Content section, default to `index`',
        },
        type: {
            description: 'Link type, default to `sources`',
        },
        user: {
            description: 'Set user, only valid in `threads` and `submitted` sections',
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
    name: 'User',
    maintainers: ['nczitzk', 'xie-dongping'],
    handler,
    description: `Subscribe to the content of a specific user`,
};

async function handler(ctx) {
    const section = ctx.req.param('section') ?? 'index';
    const type = ctx.req.param('type') ?? 'sources';
    const user = ctx.req.param('user') ?? '';

    const rootUrl = 'https://news.ycombinator.com';
    const sectionUrl = section === 'index' ? '' : `/${section}`;
    let optUrl = user === '' ? '' : '?id=' + user;

    if (section === 'over') {
        optUrl = user === '' ? '?points=100' : '?points=' + user;
    }

    const currentUrl = `${rootUrl}${sectionUrl}${optUrl}`;
    const response = await got(currentUrl);

    const $ = load(response.data);

    const list = $('.athing')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 30)
        .map((_, thing) => {
            thing = $(thing);

            const item = {};

            item.guid = thing.attr('id');
            item.title = thing.find('.titleline').children('a').text();
            item.category = thing.find('.sitestr').text();
            item.author = thing.next().find('.hnuser').text();
            item.pubDate = parseDate(thing.find('.age').attr('title') ?? thing.next().find('.age').attr('title'));

            item.link = `${rootUrl}/item?id=${item.guid}`;
            item.origin = thing.find('.titleline').children('a').attr('href');
            item.onStory = thing.find('.onstory').text().substring(2);

            item.comments = thing.next().find('a').last().text().split(' comment')[0];
            item.upvotes = thing.next().find('.score').text().split(' point')[0];

            item.currentComment = thing.find('.comment').text();
            item.guid = type === 'sources' ? item.guid : `${item.guid}${item.comments === 'discuss' ? '' : `-${item.comments}`}`;

            item.description = `<a href="${item.link}">Comments on Hacker News</a> | <a href="${item.origin}">Source</a>`;

            return item;
        })
        .get();

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

                    content('.comtr').each(function () {
                        const author = content(this).find('.hnuser');
                        const comment = content(this).find('.commtext');

                        item.description +=
                            `<div><div><small><a href="${rootUrl}/${author.attr('href')}">${author.text()}</a></small>` +
                            `&nbsp&nbsp<small><a href="${rootUrl}/item?id=${content(this).attr('id')}">` +
                            `${content(this).find('.age').attr('title')}</a></small></div>`;

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

                if (isNaN(item.comments)) {
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
