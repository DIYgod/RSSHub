import path from 'node:path';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

export const route: Route = {
    path: '/user/sheets/:username/:iso?/:freeOnly?',
    categories: ['shopping'],
    example: '/mymusicsheet/user/sheets/HalcyonMusic/USD/1',
    parameters: {
        username: 'Username, can be found in the URL',
        iso: 'ISO 4217 currency code for displaying prices, defaults to `USD`',
        freeOnly: 'Only return free scores, any value to enable',
    },
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
            source: ['mymusicfive.com/:username/*', 'mymusicfive.com/:username'],
            target: '/user/sheets/:username',
        },
    ],
    name: 'User Sheets',
    maintainers: ['Freddd13'],
    handler,
    description: `Please refer to [Wikipedia](https://en.wikipedia.org/wiki/ISO_4217#Active_codes) for ISO 4217.`,
};

async function handler(ctx) {
    const baseUrl = 'https://www.mymusicfive.com';
    const graphqlUrl = 'https://mms.pd.mapia.io/mms/graphql';
    const exchangeRateUrl = 'https://payport.pd.mapia.io/v2/currency';
    const { username, iso = 'USD', freeOnly } = ctx.req.param();

    const rates = (await cache.tryGet('mymusicfive:exchangeRate', () =>
        ofetch(exchangeRateUrl, {
            query: {
                serviceProvider: 'mms',
                'ngsw-bypass': true,
                'no-cache': Date.now(),
                skipHeaders: true,
            },
        })
    )) as Record<string, string>;

    const artistDetail = await cache.tryGet(`mymusicfive:artistInfo:${username}`, () =>
        ofetch(graphqlUrl, {
            method: 'POST',
            body: {
                operationName: 'ArtistDetailLoadUser',
                query: `
              query ArtistDetailLoadUser($artistUrl: String!) {
                user(artistUrl: $artistUrl) {
                  coverUrl
                  coverImageMeta {
                    isDark
                    isLight
                    startRgba: rgba(opacity: 1)
                    endRgba: rgba(opacity: 0.24)
                  }
                  createdAt
                  instruments
                  userId
                  name
                  profileUrl
                  iamUuid
                  artistUrl
                  profileImageMeta {
                    startRgba: rgba(opacity: 1)
                    endRgba: rgba(opacity: 0.24)
                    hex
                    isDark
                  }
                  social {
                    type
                    url
                  }
                  sheetsCount
                  isArtist
                  isOfficial
                  likes
                  seoInfo {
                    title
                    description
                    keywords
                    imageUrl
                  }
                  uploadedInstrumentGroups {
                    name
                    instruments {
                      name
                    }
                  }
                }
              }`,
                variables: {
                    artistUrl: username,
                },
            },
        })
    );
    const artistInfo = artistDetail.data.user;

    const response = await ofetch(graphqlUrl, {
        method: 'POST',
        body: {
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
                createdAt
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
                    isFree: freeOnly ? true : null,
                    category: null,
                    artistUrl: username,
                    aggregationKeywords: ['PACKAGE_IDS', 'TAG_IDS', 'INSTRUMENTS', 'SHEET_TYPE', 'INCLUDE_CHORD', 'INCLUDE_LYRICS', 'INSTRUMENTATION', 'LEVEL', 'CATEGORY'],
                    aggregationKeySize: 20,
                },
            },
        },
    });

    const items = response.data.sheetSearch.list.map((item) => {
        let finalPrice = 'Unknown';
        const price = Number.parseFloat(item.price);

        if (item.price === 0) {
            finalPrice = 'Free';
        } else if (!Number.isNaN(price) && Number.isFinite(price)) {
            const rate = Number.parseFloat(rates[iso]);
            if (rate) {
                finalPrice = `${(price * rate).toFixed(2)} ${iso}`;
            }
        }

        const youtubeId = item.youtubeId;
        const content = {
            musicName: item.metaSong,
            musicMemo: item.metaMemo,
            musicianName: item.metaMusician,
            instruments: item.instruments,
            status: item.status,
            price: finalPrice,
        };

        return {
            title: `${item.title} | ${finalPrice}`,
            link: `${baseUrl}/${username}/${item.sheetId}`,
            guid: `https://www.mymusicsheet.com/${username}/${item.sheetId}`,
            itunes_item_image: item.author.profileUrl,
            description: art(path.join(__dirname, 'templates/description.art'), {
                youtubeId,
                content,
            }),
            author: item.author.name,
            pubDate: parseDate(item.createdAt),
        };
    });

    return {
        title: artistInfo.seoInfo.title || `${artistInfo.name}'s Music Sheets`,
        description: artistInfo.seoInfo.description,
        image: artistInfo.profileUrl,
        link: `https://www.mymusicfive.com/${username}?viewType=sheet&orderBy=createdAt`,
        item: items,
    };
}
