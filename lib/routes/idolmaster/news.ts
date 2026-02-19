import querystring from 'node:querystring';

import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    url: 'idolmaster-official.jp/news',
    path: '/news/:routeParams?',
    categories: ['anime'],
    example: '/idolmaster/news/brand=MILLIONLIVE&brand=SHINYCOLORS&category=GAME&category=ANIME',
    parameters: {
        routeParams: 'The `brand` and `category` params in the path. The available values are as follows.',
    },
    description: `**Brand**
| THE IDOLM@STER | シンデレラガールズ | ミリオンライブ！ | SideM | シャイニーカラーズ | 学園アイドルマスター | その他 |
| -------------- | --------------- | ------------- | ----- | --------------- | ----------------- | ----- |
| IDOLMASTER | CINDERELLAGIRLS | MILLIONLIVE | SIDEM | SHINYCOLORS | GAKUEN | OTHER |

**Category**
| ゲーム | ライブ・イベント | アニメ | 配信番組 | ラジオ | グッズ | コラボ・キャンペーン | ミュージック | ブック・コミック | メディア | その他 |
| ----- | ------------- | ----- | ------- | ----- | ----- | ----------------- | --------- | -------------- | ------ | ----- |
| GAME | LIVE-EVENT | ANIME | LIVESTREAM | RADIO | GOODS | COLLABO-CAMP | CD | BOOK | MEDIA | OTHER |
    `,
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
            source: ['idolmaster-official.jp/news'],
            target: '/news',
        },
    ],
    name: 'ニュース News',
    maintainers: ['keocheung'],
    handler,
};

const apiUrl = 'https://cmsapi-frontend.idolmaster-official.jp';

async function handler(ctx: Context): Promise<Data> {
    const tokenUrl = `${apiUrl}/sitern/api/cmsbase/Token/get`;
    const tokenRsp = await got(tokenUrl);
    const token = tokenRsp.data.data.token;

    const options: {
        category: string[];
        subcategory?: string | string[];
        brand?: string | string[];
    } = {
        category: ['NEWS'],
    };

    const routeParams = ctx.req.param('routeParams');
    if (routeParams) {
        const queries = querystring.parse(routeParams);
        options.subcategory = toUpperCase(queries.category);
        options.brand = toUpperCase(queries.brand);
    }

    const limitParam = ctx.req.query('limit');
    let limit = limitParam ? Number.parseInt(limitParam) : 12;
    if (limit > 30) {
        limit = 30;
    }
    const listUrl = `${apiUrl}/sitern/api/idolmaster/Article/list?site=jp&ip=idolmaster&token=${token}&sort=desc&data=${JSON.stringify(options)}&limit=${limit}&start=0`;
    const listnRsp = await got(listUrl);
    const articleList = listnRsp.data.data.article_list;

    let items = articleList.map(
        (article): DataItem => ({
            title: article.title,
            link: article.url,
            pubDate: timezone(parseDate(article.dspdate), +9),
            category: article.categories.subcategory.map((cat) => cat.name),
        })
    );

    items = await Promise.all(
        items.map((item: DataItem) =>
            cache.tryGet(item.link, async () => {
                const rsp = await got(item.link);
                const content = load(rsp.data);
                const nextData = JSON.parse(content('script#__NEXT_DATA__').text());
                item.description = `<div lang="ja">${nextData.props.pageProps.data.content?.replaceAll('<img src="', `<img src="${apiUrl}/sitern/api/idolmaster/Image/get?path=`)}</div>`;
                return item;
            })
        )
    );

    return {
        title: 'NEWS | アイドルマスター',
        link: 'https://idolmaster-official.jp/news',
        item: items,
        language: 'ja',
    };
}

function toUpperCase(input: string | string[] | undefined): string | string[] | undefined {
    if (!input) {
        return input;
    }
    return typeof input === 'string' ? input.toUpperCase() : input.map((item) => item.toUpperCase());
}
