import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { baseUrl, categoryMap } from './data';

export const route: Route = {
    path: '/:category?',
    categories: ['new-media'],
    example: '/hkepc/news',
    parameters: { category: '分类，见下表，默认为最新消息' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['hkepc.com/'],
            target: '',
        },
    ],
    name: 'HKEPC 电脑领域',
    maintainers: ['TonyRL'],
    handler,
    url: 'hkepc.com/',
    description: `| 专题报导   | 新闻中心 | 新品快递 | 超频领域 | 流动数码 | 生活娱乐      | 会员消息 | 脑场新闻 | 业界资讯 | 最新消息 |
| ---------- | -------- | -------- | -------- | -------- | ------------- | -------- | -------- | -------- | -------- |
| coverStory | news     | review   | ocLab    | digital  | entertainment | member   | price    | press    | latest   |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '';

    const { data: response } = await got(categoryMap[category].url, {
        headers: {
            Referer: baseUrl,
        },
    });

    const $ = load(response);

    const list = $(categoryMap[category].selector)
        .find('a')
        .toArray()
        .map((item) => ({
            title: $(item).text(),
            link: baseUrl + $(item).attr('href'),
        }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link, {
                    headers: {
                        Referer: baseUrl,
                    },
                });

                const $ = load(response);
                const content = $('#view');
                const nextPages = $('#articleFooter .navigation a')
                    .toArray()
                    .map((a) => `${baseUrl}${a.attribs.href}`)
                    .slice(1);

                if (nextPages.length) {
                    const pages = await Promise.all(
                        nextPages.map(async (url) => {
                            const { data: response } = await got(url, {
                                headers: {
                                    referer: item.link,
                                },
                            });
                            const $ = load(response);
                            return $('#view').html();
                        })
                    );
                    content.append(pages);
                }

                // remove unwanted elements
                content.find('#view > div.advertisement').remove();
                content.find('div#comments').remove();
                content.find('div#share_btn').remove();
                content.find('#articleFooter').remove();

                // Non-breaking space U+00A0, `&nbsp;` in html
                // Taken from /caixin/blog.js
                content
                    .find('#view > p')
                    .filter((_, e) => e.children[0]?.data === String.fromCharCode(160))
                    .remove();

                // fix lazyload image
                content.find('#view > p > img').each((_, e) => {
                    if (e.attribs.rel) {
                        e.attribs.src = e.attribs.rel;
                    }
                });

                item.author = $('.newsAuthor').text().trim() || $('#articleHead div.author').text().trim();
                item.category = $('div#relatedArticles div.tags a')
                    .toArray()
                    .map((e) => $(e).text().trim());
                item.description = content.html();
                item.pubDate = timezone(parseDate($('.publishDate').text()), +8);
                item.guid = item.link.slice(0, item.link.lastIndexOf('/'));

                return item;
            })
        )
    );

    return {
        title: `電腦領域 HKEPC${categoryMap[category].feedSuffix}`,
        link: `https://www.hkepc.com/${category}`,
        description: '電腦領域 HKEPC Hardware - 全港 No.1 PC網站',
        language: 'zh-hk',
        item: items,
    };
}
