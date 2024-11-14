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
            source: ['chaincatcher.com/column', 'chaincatcher.com/'],
        },
    ],
    name: '快讯',
    maintainers: ['Devin'],
    handler,
    // url: 'chaincatcher.com/news',
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const link = `${rootUrl}/special/${id}`;

    const { data: response } = await got(`${rootUrl}/special/${id}`);

    // const { data } = await got(`${rootUrl}/special/93`, {
    //     // form: {
    //     //     page: 1,
    //     //     categoryid: 3,
    //     // },
    //     "featureId":"93","pageNumber":2,"pageSize":10
    // });
    const $ = load(response);
    const title = $('.head_title').text();
    const description = $('.abstract').text();
    const image = $('.head_bg img').attr('src');

    const items = $('.article_left', '.list_content .items')
        // 用 map 过不了 linter，用推荐的 toArray 会报错
        // .toArray()
        .map((_, item) => ({
            link: rootUrl + $(item).find('a').attr('href'),
            title: $(item).find('.article_title').text(),
            description: $(item).find('.article_content').text(),

            //             author,
            //             guid,
            id,
            image: $(item).find('.article_img').attr('src'),
            banner: $(item).find('.article_img').attr('src'),
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
