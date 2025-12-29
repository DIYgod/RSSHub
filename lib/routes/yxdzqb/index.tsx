import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';

const host = 'https://www.yxdzqb.com';

const map = {
    new: 'index_discount.html',
    hot: 'index_popular.html',
    hot_chinese: 'index_popular_cn.html',
    low: 'index_low.html',
    low_chinese: 'index_low_cn.html',
};

export const route: Route = {
    path: '/:type',
    categories: ['game'],
    example: '/yxdzqb/popular_cn',
    parameters: { type: '折扣类型' },
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
            source: ['yxdzqb.com/'],
        },
    ],
    name: '游戏折扣',
    maintainers: ['LogicJake', 'nczitzk'],
    handler,
    url: 'yxdzqb.com/',
    description: `| Steam 最新折扣 | Steam 热门游戏折扣 | Steam 热门中文游戏折扣 | Steam 历史低价 | Steam 中文游戏历史低价 |
| -------------- | ------------------ | ---------------------- | -------------- | ---------------------- |
| discount       | popular            | popular\_cn            | low            | low\_cn                |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');

    const link = `${host}/${Object.hasOwn(map, type) ? map[type] : `index_${type}.html`}`;
    const response = await got.get(link);

    const $ = load(response.data);
    const title = $('.btn-primary b').text() || $('.btn-danger b').text() || $('.btn-info b').text();
    const list = $('tr.bg-none');

    const out = list.toArray().map((item) => {
        item = $(item);

        const title = item.find('div table:nth-child(1) tr td:nth-child(1)').text();
        const description = renderToString(<YxdzqbDescription src={item.find('table.cell_tabs > tbody > tr > td:nth-child(1) > img').attr('src')} description={item.find('div.collapse').html()} />);
        const link = item.find('div.collapse table.cell_tabs > tbody > tr > td:nth-child(1) > a').attr('href');
        const guid = link + item.find('div.cell_price span:nth-child(2)').text();

        const single = {
            title,
            description,
            link,
            guid,
        };
        return single;
    });

    return {
        title: `${title}-游戏打折情报`,
        link,
        item: out,
    };
}

const YxdzqbDescription = ({ src, description }: { src?: string; description?: string }) => (
    <>
        <img src={src} />
        {description ? raw(description) : null}
    </>
);
