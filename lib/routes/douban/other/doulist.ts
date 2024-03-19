import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/doulist/:id',
    categories: ['social-media'],
    example: '/douban/doulist/37716774',
    parameters: { id: '豆列id' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '豆瓣豆列',
    maintainers: ['LogicJake', 'honue'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const url = `https://www.douban.com/doulist/${id}`;
    const response = await got({
        method: 'get',
        url,
        headers: {
            Referer: `https://www.douban.com/doulist/${id}`,
        },
    });
    const $ = load(response.data);

    const title = $('#content h1').text().trim();
    const description = $('div.doulist-about').text().trim();
    const out = $('div.doulist-item')
        .map(function () {
            const type = $(this).find('div.source').text().trim();

            let title = $(this).find('div.bd.doulist-note div.title a').text().trim();
            let link = $(this).find('div.bd.doulist-note div.title a').attr('href');
            let description = $(this).find('div.bd.doulist-note  div.abstract').text().trim();

            if (type === '来自：豆瓣广播') {
                title = $(this).find('p.status-content > a').text().trim();
                link = $(this).find('p.status-content a').attr('href');

                description = $(this).find('span.status-recommend-text').text().trim();
            }

            if (type === '来自：豆瓣电影' || type === '来自：豆瓣' || type === '来自：豆瓣读书' || type === '来自：豆瓣音乐') {
                title = $(this).find('div.bd.doulist-subject div.title a').text().trim();
                link = $(this).find('div.bd.doulist-subject div.title a').attr('href');

                description = $(this).find('div.bd.doulist-subject div.abstract').text().trim();

                const ft = $(this).find('div.ft div.comment-item.content').text().trim();

                const img = $(this).find('div.post a img').attr('src');

                description = '<div><img width="100" src="' + img + '"></div>' + description + '<blockquote>' + ft + '</blockquote>';
            }

            const date = $(this).find('div.ft div.actions time span').attr('title');

            const single = {
                title,
                link,
                description,
                pubDate: new Date(date).toUTCString(),
            };
            return single;
        })
        .get();

    return {
        title,
        link: url,
        description,
        item: out,
    };
}
