// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootURL = 'http://hrss.sz.gov.cn/';

export default async (ctx) => {
    const categoryID = ctx.req.param('caty');
    const page = ctx.req.param('page') ?? '1';

    const pageParam = Number.parseInt(page) > 1 ? `_${page}` : '';
    const pagePath = `/szksy/zwgk/${categoryID}/index${pageParam}.html`;

    const currentURL = new URL(pagePath, rootURL); // do not use deprecated 'url.resolve'
    const response = await got({ method: 'get', url: currentURL });
    if (response.statusCode !== 200) {
        throw new Error(response.statusMessage);
    }

    const $ = load(response.data);
    const title = $('.zx_rm_tit span').text().trim();
    const list = $('.zx_ml_list ul li')
        .slice(1)
        .map((_, item) => {
            const tag = $(item).find('div.list_name a');
            const tag2 = $(item).find('span:eq(1)');
            return {
                title: tag.text().trim(),
                link: tag.attr('href'),
                pubDate: timezone(parseDate(tag2.text().trim(), 'YYYY/MM/DD'), 0),
            };
        })
        .get();

    ctx.set('data', {
        title: '深圳市考试院 - ' + title,
        link: currentURL.href,
        item: list,
    });
};
