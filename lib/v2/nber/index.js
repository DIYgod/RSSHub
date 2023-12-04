const got = require('@/utils/got');
const cheerio = require('cheerio');
const path = require('path');
const { art } = require('@/utils/render');
const { parseDate } = require('@/utils/parse-date');

async function getData(url) {
    const response = await got(url).json();
    return response.results;
}

module.exports = async (ctx) => {
    const url = 'https://www.nber.org/api/v1/working_page_listing/contentType/working_paper/_/_/search';
    const baseUrl = 'https://www.nber.org';
    const config = require('@/config').value;
    const data = await ctx.cache.tryGet(url, () => getData(url), config.cache.routeExpire, false);
    const items = await Promise.all(
        data
            .filter((article) => ctx.path === '/papers' || article.newthisweek)
            .map((article) => {
                const link = `${baseUrl}${article.url}`;
                return ctx.cache.tryGet(link, async () => {
                    const response = await got(link);
                    const $ = cheerio.load(response.data);
                    const downloadLink = $('meta[name="citation_pdf_url"]').attr('content');
                    const fullAbstract = $('.page-header__intro-inner').html();
                    return {
                        title: article.title,
                        author: $('meta[name="dcterms.creator"]').attr('content'),
                        pubDate: parseDate($('meta[name="citation_publication_date"]').attr('content'), 'YYYY/MM/DD'),
                        link,
                        doi: $('meta[name="citation_doi"]').attr('content'),
                        description: art(path.join(__dirname, 'template/description.art'), {
                            fullAbstract,
                            downloadLink,
                        }),
                    };
                });
            })
    );

    ctx.state.data = {
        title: 'NBER Working Paper',
        link: 'https://www.nber.org/papers',
        item: items,
        description: `National Bureau of Economic Research Working Papers articles`,
    };
};
