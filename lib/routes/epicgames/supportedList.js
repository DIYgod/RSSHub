module.exports = {
    freegames: {
        collection: 'freegames',
        collectionCN: '免费游戏',
        homeLink: 'https://www.epicgames.com/store/zh-CN/',
        // link: 'https://www.epicgames.com/store/zh-CN/collection/free-games-collection',
        link: 'https://www.epicgames.com/store/backend/graphql-proxy',
        jsonData: JSON.stringify({
            query:
                'query searchStoreQuery($allowCountries: String, $category: String, $count: Int, $country: String!, $keywords: String, $locale: String, $namespace: String, $sortBy: String, $sortDir: String, $start: Int, $tag: String, $withPrice: Boolean = false, $withPromotions: Boolean = false) {\n  Catalog {\n    searchStore(allowCountries: $allowCountries, category: $category, count: $count, country: $country, keywords: $keywords, locale: $locale, namespace: $namespace, sortBy: $sortBy, sortDir: $sortDir, start: $start, tag: $tag) {\n      elements {\n        title\n        id\n        namespace\n        description\n        effectiveDate\n        keyImages {\n          type\n          url\n        }\n        seller {\n          id\n          name\n        }\n        productSlug\n        urlSlug\n        url\n        items {\n          id\n          namespace\n        }\n        customAttributes {\n          key\n          value\n        }\n        categories {\n          path\n        }\n        price(country: $country) @include(if: $withPrice) {\n          totalPrice {\n            discountPrice\n            originalPrice\n            voucherDiscount\n            discount\n            currencyCode\n            currencyInfo {\n              decimals\n            }\n            fmtPrice(locale: $locale) {\n              originalPrice\n              discountPrice\n              intermediatePrice\n            }\n          }\n          lineOffers {\n            appliedRules {\n              id\n              endDate\n              discountSetting {\n                discountType\n              }\n            }\n          }\n        }\n        promotions(category: $category) @include(if: $withPromotions) {\n          promotionalOffers {\n            promotionalOffers {\n              startDate\n              endDate\n              discountSetting {\n                discountType\n                discountPercentage\n              }\n            }\n          }\n          upcomingPromotionalOffers {\n            promotionalOffers {\n              startDate\n              endDate\n              discountSetting {\n                discountType\n                discountPercentage\n              }\n            }\n          }\n        }\n      }\n      paging {\n        count\n        total\n      }\n    }\n  }\n}\n',
            variables: {
                allowCountries: 'CN',
                category: 'freegames',
                count: 1000,
                country: 'CN',
                locale: 'zh-CN',
                sortBy: 'effectiveDate',
                sortDir: 'asc',
                withPrice: true,
                withPromotions: true,
            },
        }),
    },
};
