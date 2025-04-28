import { Route } from '@/types';

import got from '@/utils/got';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/user/sheets/:username/:iso?/:freeOnly?',
    categories: ['shopping'],
    example: '/mymusicsheet/user/sheets/HalcyonMusic/USD/1',
    parameters: { username: '用户名，可在URL中找到', iso: '用于显示价格的ISO 4217货币代码, 支持常见代码, 默认为人民币, 即`CNY`', freeOnly: '只返回免费谱, 任意值为开启' },
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
            source: ['mymusicsheet.com/:username/*', 'mymusicsheet.com/:username'],
            target: '/user/sheets/:username',
        },
    ],
    name: 'User Sheets',
    maintainers: ['Freddd13'],
    handler,
    description: `关于 ISO 4217，请参考[维基百科](https://zh.wikipedia.org/zh-cn/ISO_4217#%E7%8E%B0%E8%A1%8C%E4%BB%A3%E7%A0%81)`,
};

async function handler(ctx) {
    const baseUrl = 'https://www.mymusicsheet.com';
    const graphqlUrl = 'https://mms.pd.mapia.io/mms/graphql';
    const exchangeRateUrl = 'https://payport.pd.mapia.io/v2/currency';
    const { username, iso = 'CNY', freeOnly } = ctx.req.param();

    const exchangeRateResponse = await got(exchangeRateUrl, {
        searchParams: {
            serviceProvider: 'mms',
            'ngsw-bypass': true,
            'no-cache': Date.now(),
            skipHeaders: true,
        },
        responseType: 'json',
    });
    const rates = exchangeRateResponse.data;

    const response = await got.post(graphqlUrl, {
        json: {
            operationName: 'loadArtistSheets',
            query: `
          query loadArtistSheets($data: SheetSearchInput!) {
            sheetSearch(data: $data) {
              list {
                productId
                productType
                metaSong
                metaMaker
                metaMusician
                metaMemo
                instruments
                level
                price
                sheetId
                status
                author {
                  name
                  artistUrl
                  profileUrl
                }
                youtubeId
                title
                supportCountry
                excludeCountries
                __typename
              }
              total
              current
              listNum
            }
          }`,
            variables: {
                data: {
                    listNum: 10,
                    paginate: 'page',
                    includeChord: null,
                    includeLyrics: null,
                    page: 1,
                    level: null,
                    instruments: [],
                    orderBy: {
                        createdAt: 'DESC',
                    },
                    isFree: Boolean(freeOnly),
                    category: null,
                    artistUrl: username,
                    aggregationKeywords: ['PACKAGE_IDS', 'TAG_IDS', 'INSTRUMENTS', 'SHEET_TYPE', 'INCLUDE_CHORD', 'INCLUDE_LYRICS', 'INSTRUMENTATION', 'LEVEL', 'CATEGORY'],
                    aggregationKeySize: 20,
                },
            },
        },
        responseType: 'json',
    });

    const sheetSearch = response.data.data.sheetSearch.list;
    const items = sheetSearch.map((item) => {
        let finalPrice = 'Unknown';
        const price = Number.parseFloat(item.price);

        if (item.price === 0) {
            finalPrice = 'Free';
        } else if (!Number.isNaN(price) && Number.isFinite(price)) {
            const rate = rates[iso];
            if (rate) {
                finalPrice = `${(price * rate).toFixed(2)} ${iso}`;
            }
        }

        const youtubeId = item.youtubeId;
        const content = {
            musicName: item.metaSong,
            musicMemo: item.metaMemo,
            musicianName: item.metaMusician,
            author: item.author.name,
            instruments: item.instruments,
            status: item.status,
            price: finalPrice,
        };

        return {
            title: `${item.author.name} | ${item.title} | ${finalPrice}`,
            link: `${baseUrl}/${username}/${item.sheetId}`,
            itunes_item_image: item.author.profileUrl,
            description: art(path.join(__dirname, 'templates/description.art'), {
                youtubeId,
                content,
            }),
        };
    });

    return {
        title: `${username}'s sheets`,
        link: `https://www.mymusicsheet.com/${username}?viewType=sheet&orderBy=createdAt`,
        item: items,
    };
}
