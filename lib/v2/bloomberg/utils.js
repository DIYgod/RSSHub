const cheerio = require('cheerio');
const { parseString } = require('xml2js');

const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');

const rootUrl = 'https://www.bloomberg.com/feeds';
const apiEndpoints = {
    articles: 'https://www.bloomberg.com/javelin/api/foundation_transporter/',
    features: 'https://www.bloomberg.com/javelin/api/foundation_feature_transporter/',
};

const storySelector = 'script[data-component-props="ArticleBody"], script[data-component-props="FeatureBody"]';
const typeRegex = /\/(\w*?)\/(\d{4}-\d{2}-\d{2}\/.*)/;

const parseNewsList = async (url, ctx) => {
    const resp = await got(url);
    const {
        urlset: { url: urls },
    } = await new Promise((resolve, reject) => {
        parseString(resp.data, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        });
    });

    return urls.slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 30).map((u) => {
        const news = u['news:news'][0];
        const item = {
            link: u.loc[0],
            title: news['news:title'][0],
            pubDate: parseDate(news['news:publication_date'][0]),
        };
        return item;
    });
};

const parseArticle = async (item, ctx) =>
    await ctx.cache.tryGet(item.link, async () => {
        const apiType = typeRegex.exec(item.link)[1];
        if (apiEndpoints[apiType]) {
            const api = `${apiEndpoints[apiType]}${typeRegex.exec(item.link)[2]}`;

            const headers = {
                accept: 'application/json',
                'cache-control': 'no-cache',
            };
            const res = await got(api, { headers });
            const body = JSON.parse(cheerio.load(res.data.html)(storySelector).html());
            const story = body.story;

            item.description = story.body;
        }
        return item;
    });

module.exports = {
    rootUrl,
    parseNewsList,
    parseArticle,
};
