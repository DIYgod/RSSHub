import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/apod-ncku',
    categories: ['picture'],
    example: '/nasa/apod-ncku',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['apod.nasa.govundefined'],
        },
    ],
    name: 'Cheng Kung University Mirror',
    maintainers: ['nczitzk', 'williamgateszhao'],
    handler,
    url: 'apod.nasa.govundefined',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 10;
    const rootUrl = 'http://sprite.phys.ncku.edu.tw/astrolab/mirrors/apod/archivepix.html';
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = load(response.data);

    const list = $('body > b > a')
        .slice(0, limit)
        .toArray()
        .map((el) => ({
            title: $(el).text(),
            link: `http://sprite.phys.ncku.edu.tw/astrolab/mirrors/apod/${$(el).attr('href')}`,
        }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);

                const description = `<img src="${content('img').attr('src')}"> <br> ${content('body > center').eq(1).html()} <br> ${content('body > p').eq(0).html()}`;
                const pubDate = parseDate(item.link.slice(-11, -5), 'YYMMDD');

                const single = {
                    title: item.title,
                    description,
                    pubDate,
                    link: item.link,
                };
                return single;
            })
        )
    );

    return {
        title: 'NASA 每日一天文圖 (成大物理分站) ',
        link: rootUrl,
        item: items,
    };
}
