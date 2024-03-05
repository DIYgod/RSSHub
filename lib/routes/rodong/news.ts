// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const host = 'http://www.rodong.rep.kp';

export default async (ctx) => {
    const { language = 'ko' } = ctx.req.param();
    const link = `${host}/${language}/index.php?MkBAMkAxQA==`;
    const { data: response } = await got(link);

    const $ = load(response);
    const list = $('.date_news_list .row')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.media-body').text(),
                link: `${host}/${language}/${item.find('.media-body a').attr('href')}`,
                author: item.find('.col-sm-3').text(),
                pubDate: parseDate(item.find('.news_date').text(), 'YYYY.M.D.'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                $('.news_Title, .NewsDetail, .News_Detail, #moveNews').remove();
                item.description = $('.col-sm-8').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        link,
        item: items,
    });
};
