const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.mymusicsheet.com';
    const graphqlUrl = 'https://mms.pd.mapia.io/mms/graphql';
    const exchangeRateUrl = 'https://payport.pd.mapia.io/v2/currency';
    const { username, iso = 'CNY' } = ctx.params;

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
                    isFree: null,
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
        const price = parseFloat(item.price);

        if (item.price === 0) {
            finalPrice = 'Free';
        } else if (!isNaN(price) && isFinite(price)) {
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

    ctx.state.data = {
        title: `${username}'s sheets`,
        link: `https://www.mymusicsheet.com/${username}?viewType=sheet&orderBy=createdAt`,
        item: items,
    };
};
