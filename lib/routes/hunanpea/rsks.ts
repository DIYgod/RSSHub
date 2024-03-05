// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const baseUrl = 'http://rsks.hunanpea.com';
    const guid = ctx.req.param('guid');
    const link = `${baseUrl}/Category/${guid}/ArticlesByCategory.do?PageIndex=1`;
    const { data: response } = await got(link);

    const $ = load(response);
    const list = $('#column_content > ul > li')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title'),
                link: `${baseUrl}${item.find('a').attr('href').replace('ArticleDetail.do', 'InternalArticleDetail.do?')}`,
                pubDate: timezone(parseDate(item.find('em').text()), +8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                item.description = $('.content_area').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `${$('.sitemap h2').text()} - ${$('head title').text()}`,
        link,
        item: items,
    });
};
