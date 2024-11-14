import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
// import { parseDate } from '@/utils/parse-date';
// import timezone from '@/utils/timezone';

const rootUrl = 'https://www.chaincatcher.com';

export const route: Route = {
    path: '/special/93',

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
    maintainers: ['TonyRL'],
    handler,
    // url: 'chaincatcher.com/news',
};

async function handler() {
    const { data: response } = await got(`${rootUrl}/special/93`);

    // const { data } = await got(`${rootUrl}/special/93`, {
    //     // form: {
    //     //     page: 1,
    //     //     categoryid: 3,
    //     // },

    //     "featureId":"93","pageNumber":2,"pageSize":10

    // });
    const $ = load(response);

    const items = $('.article_left', '.list_content .items')
        .toArray((item) => ({
            link: rootUrl + $(item).find('a').attr('href'),
            title: $(item).find('.article_title').text(),
            //             author,
            //             guid,
            //             id: guid,
            //             image,
            //             banner: image,
        }))
        .get();
    // .slice(0, ctx.req.query('limit') ? Math.min(Number.parseInt(ctx.req.query('limit')), 125) : 50);

    // let items =
    // JSON.parse(response.match(/__NEXT_DATA__" type="application\/json">(.*?)<\/script>/)?.[1] ?? '{}')
    //     ?.props.pageProps.all.slice(0, limit)
    //     .map((item) => {
    //         const title = item.title;
    //         const guid = `reactiflux-${item.path.replace(/\/transcripts\//, '')}`;

    //         return {
    //             title,
    //             link: new URL(item.path, rootUrl).href,
    //             author,
    //             guid,
    //             id: guid,
    //             image,
    //             banner: image,
    //             language,
    //         };
    //     }) ?? [];

    // console.log(`items: ${JSON.stringify(items)}`);
    return {
        title: '最新资讯-ChainCatcher',
        description: '链捕手ChainCatcher为区块链技术爱好者与项目决策者提供NFT、Web3社交、DID、Layer2等专业的资讯与研究内容，Chain Catcher输出对Scroll、Sui、Aptos、ENS等项目的思考，拓宽读者对区块链与数字经济认知的边界。',
        image: `${rootUrl}/logo.png`,
        link: `${rootUrl}/news`,
        item: items,
    };
}
