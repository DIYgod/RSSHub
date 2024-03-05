// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootURL = 'http://rsj.taiyuan.gov.cn/';

export default async (ctx) => {
    const categoryID = ctx.req.param('caty');
    const page = ctx.req.param('page') ?? '1';

    const pageParam = Number.parseInt(page) > 1 ? `_${page}` : '';
    const pagePath = `/zfxxgk/${categoryID}/index${pageParam}.shtml`;

    const currentURL = new URL(pagePath, rootURL);
    const response = await got(currentURL.href);

    if (response.statusCode !== 200) {
        throw new Error(response.statusMessage);
    }

    const $ = load(response.data, { decodeEntities: false });
    const title = $('.tit').find('a:eq(2)').text();
    const list = $('.RightSide_con ul li')
        .map((_, item) => {
            const link = $(item).find('a');
            const date = $(item).find('span.fr');
            return {
                title: link.attr('title'),
                link: link.attr('href'),
                pubDate: timezone(parseDate(date.text(), 'YYYY-MM-DD'), +8),
            };
        })
        .get();

    ctx.set('data', {
        title: '太原市人力资源和社会保障局 - ' + title,
        link: currentURL.href,
        item: list,
    });
};
