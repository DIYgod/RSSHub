import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/free-next/:type?',
    categories: ['reading'],
    example: '/qidian/free-next',
    parameters: { type: '默认不填为起点中文网，填 mm 为起点女生网' },
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
            source: ['www.qidian.com/free'],
            target: '/free',
        },
    ],
    name: '限时免费下期预告',
    maintainers: ['LogicJake'],
    handler,
    url: 'www.qidian.com/free',
};

async function handler(ctx) {
    const type = ctx.req.param('type');

    let link, title;
    if (type === 'mm') {
        link = 'https://www.qidian.com/mm/free';
        title = '起点女生网';
    } else {
        link = 'https://www.qidian.com/free';
        title = '起点中文网';
    }

    const response = await got(link);
    const $ = load(response.data);

    const list = $('div.other-rec-wrap li');
    const out = list
        .map((index, item) => {
            item = $(item);

            const img = `<img src="https:${item.find('.img-box img').attr('src')}">`;
            const rank = `<p>评分：${item.find('.img-box span').text()}</p>`;

            return {
                title: item.find('.book-info h4 a').text(),
                description: img + rank + item.find('p.intro').html(),
                link: 'https:' + item.find('.book-info h4 a').attr('href'),
                author: item.find('p.author a').text(),
            };
        })
        .get();

    return {
        title,
        description: `限时免费下期预告-${title}`,
        link,
        item: out,
    };
}
