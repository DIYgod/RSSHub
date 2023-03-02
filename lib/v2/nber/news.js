const got = require('@/utils/got');
const cheerio = require('cheerio');
const path = require('path');
const { art } = require('@/utils/render');
const { parseDate } = require('@/utils/parse-date');
const { getData, parseAuthor } = require('./utils');

module.exports = async (ctx) => {
    const url = 'https://www.nber.org/api/v1/working_page_listing/contentType/working_paper/_/_/search';
    const baseUrl = 'https://www.nber.org';
    const data = await getData(url, ctx);
    const items = data
        .filter((article) => article.newthisweek)
        .map(async (article) => {
            const link = `${baseUrl}${article.url}`;
            const pubDate = await ctx.cache.tryGet(link, async () => {
                const response = await got.get(link);
                const $ = cheerio.load(response.data);
                return parseDate($('meta[name="citation_publication_date"]').attr('content'), 'YYYY/MM/DD');
            });
            const parsedAuthors = parseAuthor(article.authors);
            return {
                title: article.title,
                author: art(path.join(__dirname, 'template/author.art'), {
                    authors: parsedAuthors,
                }),
                pubDate,
                description: article.abstract,
            };
        });

    ctx.state.data = {
        title: 'NBER Working Paper',
        link: 'https://www.nber.org/papers',
        item: items,
        description: `National Bureau of Economic Research Working Papers articles`,
    };
};
