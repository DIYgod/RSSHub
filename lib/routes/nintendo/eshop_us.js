const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'post',
        url: `https://u3b6gr4ua3-dsn.algolia.net/1/indexes/*/queries?x-algolia-agent=Algolia%20for%20vanilla%20JavaScript%20(lite)%203.22.1%3BJS%20Helper%202.20.1&x-algolia-application-id=U3B6GR4UA3&x-algolia-api-key=9a20c93440cf63cf1a7008d75f7438bf`,
        json: {
            requests: [
                {
                    indexName: 'noa_aem_game_en_us_release_des',
                    params:
                        'query=&hitsPerPage=42&maxValuesPerFacet=30&page=0&facets=%5B%22generalFilters%22%2C%22platform%22%2C%22availability%22%2C%22categories%22%2C%22filterShops%22%2C%22virtualConsole%22%2C%22characters%22%2C%22priceRange%22%2C%22esrb%22%2C%22filterPlayers%22%5D&tagFilters=&facetFilters=%5B%5B%22availability%3ANew%20releases%22%5D%2C%5B%22platform%3ANintendo%20Switch%22%5D%5D',
                },
                {
                    indexName: 'noa_aem_game_en_us_release_des',
                    params:
                        'query=&hitsPerPage=1&maxValuesPerFacet=30&page=0&attributesToRetrieve=%5B%5D&attributesToHighlight=%5B%5D&attributesToSnippet=%5B%5D&tagFilters=&facets=availability&facetFilters=%5B%5B%22platform%3ANintendo%20Switch%22%5D%5D',
                },
                {
                    indexName: 'noa_aem_game_en_us_release_des',
                    params:
                        'query=&hitsPerPage=1&maxValuesPerFacet=30&page=0&attributesToRetrieve=%5B%5D&attributesToHighlight=%5B%5D&attributesToSnippet=%5B%5D&tagFilters=&facets=platform&facetFilters=%5B%5B%22availability%3ANew%20releases%22%5D%5D',
                },
            ],
        },
    });
    const data = response.data.results[0].hits.slice(0, 9);

    ctx.state.data = {
        title: `Nintendo eShop (美服) 新游戏`,
        link: `https://www.nintendo.com/games/`,
        description: `Nintendo eShop (美服) 新上架的游戏`,
        item: data.map((item) => ({
            title: item.title,
            description: `<img src="https://www.nintendo.com${item.boxArt}"><br><strong>发售日期：</strong>${new Date(item.releaseDateMask).toLocaleString()}<br><strong>价格：</strong>$${item.msrp}<br><br>${item.description}`,
            link: `https://www.nintendo.com${item.url}`,
        })),
    };
};
