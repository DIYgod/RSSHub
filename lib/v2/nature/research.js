// example usage: `/nature/research/ng`
// The journals from NPG are run by different group of people,
// and the website of may not be consitent for all the journals
//
// This router has **just** been tested in:
// nature:           Nature
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
const { baseUrl, getArticleList, getDataLayer, getArticle } = require('./utils');

module.exports = async (ctx) => {
    const journal = ctx.params.journal ?? 'nature';
    const pageURL = `${baseUrl}/${journal}/research-articles`;

    const pageResponse = await got(pageURL);
    const pageCapture = cheerio.load(pageResponse.data);

    const pageTitle = getDataLayer(pageCapture).content.journal.title;

    let items = getArticleList(pageCapture);

    items = await Promise.all(items.map((item) => getArticle(item, ctx)));

    ctx.state.data = {
        title: `Nature (${pageTitle}) | Latest Research`,
        description: pageCapture('meta[name="description"]').attr('content') || `Nature, a nature research journal`,
        link: pageURL,
        item: items,
    };
};
