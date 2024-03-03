// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
const { renderDesc } = require('./utils');

export default async (ctx) => {
    const pub = ctx.req.param('pub');
    const jrn = ctx.req.param('jrn');
    const host = `https://pubs.aip.org`;
    const jrnlUrl = `${host}/${pub}/${jrn}/issue`;

    const { data: response } = await got.get(jrnlUrl);
    const $ = load(response);
    const jrnlName = $('meta[property="og:title"]')
        .attr('content')
        .match(/(?:[^=]*=)?\s*([^>]+)\s*/)[1];
    const publication = $('.al-article-item-wrap.al-normal');

    const list = publication
        .map((_, item) => {
            const title = $(item).find('.item-title a:first').text();
            const link = $(item).find('.item-title a:first').attr('href');
            const doilink = $(item).find('.citation-label a').attr('href');
            const doi = doilink && doilink.match(/10\.\d+\/\S+/)[0];
            const id = $(item).find('h5[data-resource-id-access]').data('resource-id-access');
            const authors = $(item)
                .find('.al-authors-list')
                .find('a')
                .map(function () {
                    return $(this).text();
                })
                .get()
                .join('; ');
            const imgUrl = $(item).find('.issue-featured-image a img').attr('src');
            const img = imgUrl ? imgUrl.replace(/\?.+$/, '') : '';
            const description = renderDesc(title, authors, doi, img);
            return {
                title,
                link,
                doilink,
                id,
                authors,
                img,
                doi,
                description,
            };
        })
        .get();

    ctx.set('data', {
        title: jrnlName,
        link: jrnlUrl,
        item: list,
        allowEmpty: true,
    });
};
