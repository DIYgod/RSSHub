const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const languages = {
    zh_cn: 'zh-hans',
    zh_tw: 'zh-hant',
};

const categories = {
    all: {
        title: 'All News',
        id: '0',
    },
    business: {
        title: 'Business',
        id: '1GnkLu7bxeOTxTRNCeu5qm',
    },
    entertainment: {
        title: 'Entertainment',
        id: '3SGbaxYYG5U05Z0G4piPV7',
    },
    innovation: {
        title: 'Innovation',
        id: '5TzuQELMABTu9jOPjXXlFU',
    },
    brazil: {
        title: 'Made in Brazil',
        id: '2tOmcnQB8PgkQSoQ1K4hfD',
    },
    impact: {
        title: 'Social Impact',
        id: '2bUcGjE2800LAsk3JDurGA',
    },
};

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'all';
    const region = ctx.params.region ?? 'en';

    const rootUrl = 'https://about.netflix.com';
    const currentUrl = `${rootUrl}/api/data/articles?language=${languages.hasOwnProperty(region) ? languages[region] : region.replace(/_/g, '-')}${category === 'all' ? '' : `&category=${categories[category].id}`}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const list = response.data.entities.articles.slice(0, ctx.params.limit ? parseInt(ctx.params.limit) : 15).map((item) => ({
        title: item.title,
        link: `${rootUrl}/${region}/news/${item.slug}`,
        pubDate: parseDate(item.rawPublishedDate),
        category: item.categories.map((category) => category.label),
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                if (!content('.article-contentstyles__ArticleCopy-pei0rm-6 ul li')) {
                    content('.article-contentstyles__ArticleCopy-pei0rm-6 p').slice(-3).remove();
                }

                item.description = content('.article-contentstyles__ArticleCopy-pei0rm-6').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${categories[category].title} - Newsroom - Netflix`,
        link: `${rootUrl}/${region}/newsroom`,
        item: items,
    };
};
