// example usage: `/nature/news-and-comment/ng`
// The journals from NPG are run by different group of people,
// and the website of may not be consitent for all the journals
//
// This router has **just** been tested in:
// nbt:              Nature Biotechnology
// neuro:            Nature Neuroscience
// ng:               Nature Genetics
// ni:               Nature Immunology
// nmeth:            Nature Method
// nchem:            Nature Chemistry
// nmat:             Nature Materials
// natmachintell:    Nature Machine Intelligence

const cheerio = require('cheerio');
const got = require('@/utils/got');
const { baseUrl, getArticleList, getArticle } = require('./utils');

module.exports = async (ctx) => {
    const journal = ctx.params.journal;
    const pageURL = `${baseUrl}/${journal}/news-and-comment`;

    const pageResponse = await got(pageURL);
    const pageCapture = cheerio.load(pageResponse.data);
    const pageDescription = pageCapture('meta[name=description]').attr('content') || 'Nature, a nature research journal';

    let items = getArticleList(pageCapture);

    items = await Promise.all(items.map((item) => getArticle(item, ctx)));

    ctx.state.data = {
        title: pageCapture('title').text(),
        description: pageDescription,
        link: pageURL,
        item: items,
    };
};
