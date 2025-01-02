import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { cookieJar, processArticle } from './utils';
const baseUrl = 'http://stno1.playno1.com';

export const route: Route = {
    path: '/st/:catid?',
    categories: ['bbs'],
    example: '/playno1/st',
    parameters: { catid: '分类，见下表，默认为全部文章' },
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
            source: ['stno1.playno1.com/stno1/:catid/'],
            target: '/st/:catid',
        },
    ],
    name: '情趣',
    maintainers: ['TonyRL'],
    handler,
    description: `| 全部文章 | 情趣體驗報告 | 情趣新聞 | 情趣研究所 |
  | -------- | ------------ | -------- | ---------- |
  | all      | experience   | news     | graduate   |`,
};

async function handler(ctx) {
    const { catid = 'all' } = ctx.req.param();
    const url = `${baseUrl}/stno1/${catid}/`;
    const response = await got(url, {
        cookieJar,
    });
    const $ = load(response.data);

    let items = $('.fallsBox')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.ftitle a').attr('title'),
                link: item.find('.ftitle a').attr('href'),
                pubDate: timezone(parseDate(item.find('.dateBox').text(), 'YYYY-MM-DD HH:mm'), 8),
                author: item.find('.dateBox span a').eq(0).text().trim(),
            };
        });

    items = await processArticle(items, cache);

    return {
        title: $('head title').text(),
        link: url,
        item: items,
        language: 'zh-TW',
    };
}
