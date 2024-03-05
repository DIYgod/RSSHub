// @ts-nocheck
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

import { load } from 'cheerio';
import got from '@/utils/got';
const { baseUrl, cookieJar, getArticleList, getArticle } = require('./utils');

export default async (ctx) => {
    const journal = ctx.req.param('journal');
    const pageURL = `${baseUrl}/${journal}/news-and-comment`;

    const pageResponse = await got(pageURL, { cookieJar });
    const pageCapture = load(pageResponse.data);
    const pageDescription = pageCapture('meta[name=description]').attr('content') || 'Nature, a nature research journal';

    let items = getArticleList(pageCapture);

    items = await Promise.all(items.map((item) => getArticle(item)));

    ctx.set('data', {
        title: pageCapture('title').text(),
        description: pageDescription,
        link: pageURL,
        item: items,
    });
};
