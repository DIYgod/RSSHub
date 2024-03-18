import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const CATEGORY_MAP = {
    tuijian: 'tuijian', // 推荐
    TMT: 'TMT', // TMT
    jinrong: 'jinrong', // 金融
    dichan: 'dichan', // 地产
    xiaofei: 'xiaofei', // 消费
    yiyao: 'yiyao', // 医药
    wine: 'wine', // 酒业
    IPO: 'IPO', // IPO观察
};

export const route: Route = {
    path: '/finance/:category?',
    categories: ['new-media'],
    example: '/china/finance',
    parameters: { category: 'Category of news. See the form below for details, default is suggest news.' },
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
            source: ['finance.china.com/:category'],
        },
    ],
    name: 'Finance News 财经 - 财经新闻',
    maintainers: ['KingJem'],
    handler,
    description: `| 推荐    | TMT | 金融    | 地产   | 消费    | 医药  | 酒业 | IPO 观察 |
  | ------- | --- | ------- | ------ | ------- | ----- | ---- | -------- |
  | tuijian | TMT | jinrong | dichan | xiaofei | yiyao | wine | IPO      |

  > Note: The default news num is \`30\`.

  > 注意：默认新闻条数是 \`30\`。`,
};

async function handler(ctx) {
    const baseUrl = 'https://finance.china.com';
    const category = CATEGORY_MAP[ctx.req.param('category')] ?? CATEGORY_MAP.tuijian;
    const websiteUrl = `${baseUrl}/${category}`;
    const response = await got(websiteUrl);
    const data = response.data;
    const $ = load(data);
    const categoryTitle = $('.list-hd strong').text();
    const listCategory = `中华网-财经-${categoryTitle}新闻`;
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;
    const detailsUrls = $('.item-con-inner')
        .map((_, item) => {
            item = $(item);
            return {
                link: item.find('.tit>a').attr('href'),
            };
        })
        .get()
        .filter((item) => item.link !== void 0)
        .slice(0, limit);

    const items = await Promise.all(
        detailsUrls.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailsResponse = await got(item.link);
                const $d = load(detailsResponse.data);
                return {
                    title: $d('.article_title').text(),
                    link: item.link,
                    description: $d('#js_article_content').html(),
                    pubDate: timezone(parseDate($d('.article_info>span.time').text()), +8),
                    author: $d(' div.article_info > span.source').text(),
                    category: listCategory,
                };
            })
        )
    );

    return {
        title: $('head title').text(),
        link: websiteUrl,
        category: listCategory,
        item: items,
    };
}
