import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://www.famitsu.com';

export const route: Route = {
    path: '/category/:category?',
    categories: ['game'],
    example: '/famitsu/category/new-article',
    parameters: { category: 'Category, see table below, `new-article` by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Category',
    maintainers: ['TonyRL'],
    handler,
    description: `| 新着        | PS5 | Switch | PS4 | ニュース | ゲームニュース | PR TIMES | 動画   | 特集・企画記事  | インタビュー | 取材・リポート | レビュー | インディーゲーム |
  | ----------- | --- | ------ | --- | -------- | -------------- | -------- | ------ | --------------- | ------------ | -------------- | -------- | ---------------- |
  | new-article | ps5 | switch | ps4 | news     | news-game      | prtimes  | videos | special-article | interview    | event-report   | review   | indie-game       |`,
};

async function handler(ctx) {
    const { category = 'new-article' } = ctx.req.param();
    const url = `${baseUrl}/search/?category=${category}`;
    const { data } = await got(url);
    const $ = load(data);

    const list = $('.col-12 .card__body')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.card__title').text(),
                link: new URL(item.find('.card__title a').attr('href'), baseUrl).href,
                pubDate: timezone(parseDate(item.find('time').attr('datetime'), 'YYYY.MM.DDTHH:mm'), +9),
            };
        })
        .filter((item) => item.link.startsWith('https://www.famitsu.com/news/'));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data } = await got(item.link);
                const $ = load(data);

                // remove ads
                $('.article-body__contents-pr-primary').remove();

                // fix header image
                $('.article-body div.media-image').each((_, e) => {
                    e.tagName = 'img';
                    e.attribs.src = e.attribs.style.match(/url\((.+?)\);/)[1];
                    delete e.attribs['data-src'];
                    delete e.attribs.style;
                });

                // remove white space
                $('.article-body__contents-img-block, .article-body__contents-img-common-col').each((_, e) => {
                    delete e.attribs.style;
                });

                item.description = $('.article-body').html();
                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        image: 'https://www.famitsu.com/img/1812/favicons/apple-touch-icon.png',
        link: url,
        item: items,
        language: 'ja',
    };
}
