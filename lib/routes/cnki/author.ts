import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { ProcessItem } from './utils';

export const route: Route = {
    name: '作者',
    maintainers: ['Derekmini', 'harveyqiu'],
    categories: ['journal'],
    path: '/author/:name/:company',
    parameters: { name: '作者姓名', company: '作者单位' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    example: '/cnki/author/丁晓东/中国人民大学',
    description: `:::tip
    可能仅限中国大陆服务器访问，以实际情况为准。
    :::`,
    handler,
};

async function handler(ctx) {
    const name = ctx.req.param('name');
    const company = ctx.req.param('company');
    const host = 'https://kns.cnki.net';
    const link = `${host}/kns8s/AdvSearch?classid=WD0FTY92`;

    const response = await ofetch(`${host}/kns8s/brief/grid`, {
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
            referer: `${host}/kns8s/AdvSearch?classid=WD0FTY92`,
        },
        body: params.toString(),
    });
    const $ = load(response);
    const list = $('tr')
        .toArray()
        .slice(1)
        .map((item) => {
            const title = $(item).find('a.fz14').text();
            const filename = $(item).find('a.icon-collect').attr('data-filename');
            const link = `https://cnki.net/kcms/detail/detail.aspx?filename=${filename}&dbcode=CJFD`;
            const pubDate = parseDate($(item).find('td.date').text(), 'YYYY-MM-DD');
            return {
                title,
                link,
                pubDate,
            };
        });

    const items = await Promise.all(list.map((item) => cache.tryGet(item.link, () => ProcessItem(item))));

    const processedItems = items
        .filter((item): item is Record<string, any> => item !== null && typeof item === 'object')
        .map((item) => ({
            title: item.title || '',
            link: item.link,
            pubDate: item.pubDate,
        }));

    return {
        title: `知网 ${name} ${company}`,
        link,
        item: processedItems,
    };
}
