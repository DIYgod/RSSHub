import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseRelativeDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/forum/:id',
    categories: ['reading'],
    example: '/qidian/forum/1010400217',
    parameters: { id: '小说 id, 可在对应小说页 URL 中找到' },
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
            source: ['book.qidian.com/info/:id'],
        },
    ],
    name: '讨论区',
    maintainers: ['fuzy112'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const url = `https://forum.qidian.com/NewForum/List.aspx?BookId=${id}`;

    const forum_response = await got(url, {
        headers: {
            Referer: `https://book.qidian.com/info/${id}`,
        },
    });

    const $ = load(forum_response.data);
    const name = $('.main-header>h1').text();
    const cover_url = $('img.forum_book').attr('src');
    const list = $('li.post-wrap>.post');

    const items = [];
    for (const el of list) {
        const title = $(el).children().eq(1).find('a');
        items.push({
            title: title.text(),
            link: `https:${title.attr('href')}`,
            description: $(el).text(),
            pubDate: parseRelativeDate($(el).find('.post-info>span').text()),
        });
    }

    return {
        title: `起点 《${name}》讨论区`,
        link: url,
        image: cover_url,
        item: items,
    };
}
