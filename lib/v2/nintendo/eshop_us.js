const { art } = require('@/utils/render');
const got = require('@/utils/got');
const path = require('path');

module.exports = async (ctx) => {
    const response = await got.post('https://u3b6gr4ua3-dsn.algolia.net/1/indexes/store_game_en_us_release_des/query', {
        headers: {
            'x-algolia-api-key': 'a29c6927638bfd8cee23993e51e721c9',
            'x-algolia-application-id': 'U3B6GR4UA3',
        },
        json: {
            params: new URLSearchParams({
                hitsPerPage: 40,
                page: 0,
                facetFilters: JSON.stringify([['availability:Available now', 'availability:Pre-order']]),
            }).toString(),
        },
    });
    const data = response.data.hits;

    ctx.state.data = {
        title: `Nintendo eShop（美服）新游戏`,
        link: `https://www.nintendo.com/store/games/`,
        description: `Nintendo eShop（美服）新上架的游戏`,
        item: data.map((item) => ({
            title: item.title,
            description: art(path.join(__dirname, 'templates/eshop_us.art'), item),
            link: `https://www.nintendo.com${item.url}`,
        })),
    };
    ctx.state.json = response.data;
};
