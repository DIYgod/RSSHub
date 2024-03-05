// @ts-nocheck
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

export default async (ctx) => {
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

    ctx.set('data', {
        title: $('head title').text(),
        link: websiteUrl,
        category: listCategory,
        item: items,
    });
};
