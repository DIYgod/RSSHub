// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const { category, type } = ctx.req.param();

    const rootUrl = 'https://dwxgb.bnu.edu.cn';
    const currentUrl = `${rootUrl}/${category}/${type}/index.html`;

    let response;
    try {
        response = await got(currentUrl);
    } catch {
        try {
            response = await got(`${rootUrl}/${category}/${type}/index.htm`);
        } catch {
            return;
        }
    }

    const $ = load(response.data);

    const list = $('ul.container.list > li')
        .map((_, item) => {
            const link = $(item).find('a').attr('href');
            const absoluteLink = new URL(link, currentUrl).href;
            return {
                title: $(item).find('a').text().trim(),
                pubDate: parseDate($(item).find('span').text()),
                link: absoluteLink,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);
                item.description = content('div.article.typo').html();
                return item;
            })
        )
    );

    ctx.set('data', {
        title: `${$('div.breadcrumb1 > a:nth-child(3)').text()} - ${$('div.breadcrumb1 > a:nth-child(4)').text()}`,
        link: currentUrl,
        item: items,
    });
};
