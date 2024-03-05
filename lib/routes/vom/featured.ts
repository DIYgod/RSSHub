// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const baseUrl = 'http://www.vom.mn';

export default async (ctx) => {
    const { lang = 'mn' } = ctx.req.param();
    const { data: response } = await got(`${baseUrl}/${lang}`);

    const $ = load(response);

    const items = [
        ...new Set(
            $('#bigNewsSlide .item, #news_3 .item')
                .toArray()
                .map((item) => {
                    item = $(item);
                    return {
                        link: item.find('a').eq(0).attr('href'),
                    };
                })
        ),
    ];

    await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                item.title = $('h2').text();
                item.author = $('.uk-border-circle').next().text();
                item.pubDate = parseDate($('.vom-news-show-meta .right').prev().text());
                item.category = $('.vom-news-show-meta .uk-button-text').text();

                $('.uk-article-title, .uk-text-meta, article .uk-grid-small').remove();

                item.description = $('article').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('meta[name=description]').attr('content'),
        image: 'http://www.vom.mn/dist/images/vom-logo.png',
        item: items,
    });
};
