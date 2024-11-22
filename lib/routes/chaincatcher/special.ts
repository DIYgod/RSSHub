import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
// import { parseDate } from '@/utils/parse-date';
// import timezone from '@/utils/timezone';

const rootUrl = 'https://www.chaincatcher.com';

export const route: Route = {
    path: '/special/:id',

    categories: ['new-media'],
    example: '/chaincatcher/special/93',
    parameters: {},
    // features: {
    //     requireConfig: false,
    //     requirePuppeteer: false,
    //     antiCrawler: false,
    //     supportBT: false,
    //     supportPodcast: false,
    //     supportScihub: false,
    // },
    radar: [
        {
            source: ['chaincatcher.com/special', 'chaincatcher.com/'],
        },
    ],
    name: '快讯',
    maintainers: ['ishowman'],
    handler,
    // url: 'chaincatcher.com/news',
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const link = `${rootUrl}/special/${id}`;

    const { data } = await got(`${rootUrl}/special/${id}`);

    const $ = load(data);
    const title = $('.head_title').text();
    const description = $('.abstract').text();
    const image = $('.head_bg img').attr('src');

    const items = $('.article_area', '.list_content .items')
        // 用 map 过不了 linter，用推荐的 toArray 会报错
        // .toArray()
        .map((_, item) => ({
                link: rootUrl + $(item).find('a').attr('href'),
                title: $(item).find('.article_title').text(),
                description: $(item).find('.article_content').text(),

                //             author,
                //             guid,
                id,
                enclosure_url: $(item).find('.article_img>img').attr('src'),
                enclosure_type: 'image/webp',

                pubDate: $(item).find('.times').text(),
            }))
        .get();
    // .slice(0, ctx.req.query('limit') ? Math.min(Number.parseInt(ctx.req.query('limit')), 125) : 50);

    return {
        title,
        description,
        image,
        link,
        item: items,
    };
}
