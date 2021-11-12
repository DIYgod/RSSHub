const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'POST',
        url: 'https://www.businessoffashion.com/graphql/v1',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify({
            operationName: 'GetArticlesGQL',
            variables: {
                first: 5,
                lastCursor: null,
                height: 440,
                width: 670,
            },
            query:
                'query GetArticlesGQL($articleSlug: String, $category: String, $authorSlug: String, $height: Int, $lastCursor: ID, $width: Int!, $first: Int) {\n  articles(first: $first, after: $lastCursor, filter: {language__eq: chinese, articleSlug__eq: $articleSlug, categorySlug__eq: $category, authorSlug__eq: $authorSlug}) {\n    edges {\n      cursor\n      node {\n        __typename\n        ... on ArticleInterface {\n          title\n          summary\n          content\n          url\n          featuredAsset {\n            ... on AssetInterface {\n              caption\n              __typename\n            }\n            ... on ManagedImage {\n              transform(transform: {width: $width, height: $height, crop: FOCALPOINT, fit: CROP})\n              __typename\n            }\n            ... on ManagedVideo {\n              url\n              __typename\n            }\n            __typename\n          }\n          isExclusive\n          isSponsored\n          published {\n            value\n            __typename\n          }\n          __typename\n        }\n        ... on InternalArticleInterface {\n          authors {\n            displayName\n            slug\n            __typename\n          }\n          __typename\n        }\n        ... on ExternalArticleInterface {\n          source\n          __typename\n        }\n        ... on CuratedArticleLink {\n          _id\n          title\n          published {\n            value\n            __typename\n          }\n          url\n          __typename\n        }\n        ... on SyndicatedArticle {\n          _id\n          topics {\n            _id\n            label\n            __typename\n          }\n          categories {\n            _id\n            label\n            __typename\n          }\n          __typename\n        }\n        ... on OriginalArticle {\n          _id\n          topics {\n            _id\n            label\n            __typename\n          }\n          categories {\n            _id\n            label\n            slug\n            __typename\n          }\n          __typename\n        }\n        ... on FashionWeekReview {\n          _id\n          topics {\n            _id\n            label\n            __typename\n          }\n          categories {\n            _id\n            label\n            __typename\n          }\n          __typename\n        }\n      }\n      __typename\n    }\n    __typename\n  }\n}\n',
        }),
    });

    const items = response.data.data.articles.edges.map((item) => {
        const url = new URL(item.node.url);
        url.host = 'cn.businessoffashion.com';
        const single = {
            title: item.node.title,
            description: `${item.node.summary}<br>${item.node.content}`,
            pubDate: new Date(item.node.published.value).toUTCString(),
            link: url.href,
            author: item.node.authors[0].displayName,
        };

        return single;
    });

    ctx.state.data = {
        title: `BoF时装商业评论 | 时刻为全球时尚产业提供最新的新闻、分析与情报 | BoF`,
        link: `https://cn.businessoffashion.com/`,
        description: 'BoF时装商业评论 | 时刻为全球时尚产业提供最新的新闻、分析与情报 | BoF',
        item: items,
    };
};
