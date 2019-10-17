module.exports = {
    freegames: {
        collection: 'freegames',
        collectionCN: '免费游戏',
        homeLink: 'https://www.epicgames.com/store/zh-CN/',
        // link: 'https://www.epicgames.com/store/zh-CN/collection/free-games-collection',
        link: 'https://graphql.epicgames.com/graphql',
        jsonData: JSON.stringify({
            query:
                '\n          query promotionsQuery($namespace: String!, $country: String!, $locale: String!) {\n            Catalog {\n              catalogOffers(namespace: $namespace, locale: $locale, params: {category: "freegames", country: $country, sortBy: "effectiveDate", sortDir: "asc"}) {\n                elements {\n                  title\n                  description\n                  id\n                  namespace\n                  categories {\n                    path\n                  }\n                  keyImages {\n                    type\n                    url\n                  }\n                  productSlug\n                  promotions {\n                    promotionalOffers {\n                      promotionalOffers {\n                        startDate\n                        endDate\n                        discountSetting {\n                          discountType\n                          discountPercentage\n                        }\n                      }\n                    }\n                    upcomingPromotionalOffers {\n                      promotionalOffers {\n                        startDate\n                        endDate\n                        discountSetting {\n                          discountType\n                          discountPercentage\n                        }\n                      }\n                    }\n                  }\n                }\n              }\n            }\n          }\n        ',
            variables: {
                namespace: 'epic',
                country: 'US',
                locale: 'zh-CN',
            },
        }),
    },
};
