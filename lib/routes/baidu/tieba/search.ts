import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import iconv from 'iconv-lite';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export const route: Route = {
    path: '/tieba/search/:qw/:routeParams?',
    categories: ['blog'],
    example: '/baidu/tieba/search/neuro',
    parameters: { qw: '搜索关键词', routeParams: '额外参数；请参阅以下说明和表格' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '贴吧搜索',
    maintainers: ['JimenezLi'],
    handler,
};

async function handler(ctx) {
    const qw = ctx.req.param('qw');
    const query = new URLSearchParams(ctx.req.param('routeParams'));
    query.set('ie', 'utf-8');
    query.set('qw', qw);
    query.set('rn', query.get('rn') || 20); // Number of returned items
    const link = `https://tieba.baidu.com/f/search/res?${query.toString()}`;

    const response = await got.get(link, {
        headers: {
            Referer: 'https://tieba.baidu.com',
        },
        responseType: 'buffer',
    });
    const data = iconv.decode(response.data, 'gbk');

    const $ = load(data);
    const resultList = $('div.s_post');

    return {
        title: `${qw} - ${query.get('kw') || '百度贴'}吧搜索`,
        link,
        item: resultList.toArray().map((element) => {
            const item = $(element);
            const titleItem = item.find('.p_title a');
            const title = titleItem.text().trim();
            const link = titleItem.attr('href');
            const time = item.find('.p_date').text().trim();
            const details = item.find('.p_content').text().trim();
            const medias = item
                .find('.p_mediaCont img')
                .toArray()
                .map((element) => {
                    const item = $(element);
                    return `<img src="${item.attr('original')}">`;
                })
                .join('');
            const tieba = item.find('a.p_forum').text().trim();
            const author = item.find('a').last().text().trim();

            return {
                title,
                description: art(path.join(__dirname, '../templates/tieba_search.art'), {
                    details,
                    medias,
                    tieba,
                    author,
                }),
                author,
                pubDate: timezone(parseDate(time, 'YYYY-MM-DD HH:mm'), +8),
                link,
            };
        }),
    };
}
