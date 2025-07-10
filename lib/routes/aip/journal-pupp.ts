import cache from '@/utils/cache';
import { load } from 'cheerio';
import { puppeteerGet, renderDesc } from './utils';
import { config } from '@/config';
import { isValidHost } from '@/utils/valid-host';
import puppeteer from '@/utils/puppeteer';
import InvalidParameterError from '@/errors/types/invalid-parameter';

const handler = async (ctx) => {
    const pub = ctx.req.param('pub');
    const jrn = ctx.req.param('jrn');
    const host = `https://pubs.aip.org`;
    const jrnlUrl = `${host}/${pub}/${jrn}/issue`;
    if (!isValidHost(pub)) {
        throw new InvalidParameterError('Invalid pub');
    }

    // use Puppeteer due to the obstacle by cloudflare challenge
    const browser = await puppeteer();

    const { jrnlName, list } = await cache.tryGet(
        jrnlUrl,
        async () => {
            const response = await puppeteerGet(jrnlUrl, browser);
            const $ = load(response);
            const jrnlName = $('.header-journal-title').text();
            const list = $('.card')
                .toArray()
                .map((item) => {
                    $(item).find('.access-text').remove();
                    const title = $(item).find('.hlFld-Title').text();
                    const authors = $(item).find('.entryAuthor.all').text();
                    const img = $(item).find('img').attr('src');
                    const link = $(item).find('.ref.nowrap').attr('href');
                    const doi = link.replace('/doi/full/', '');
                    const description = renderDesc(title, authors, doi, img);
                    return {
                        title,
                        link,
                        doi,
                        description,
                    };
                });
            return {
                jrnlName,
                list,
            };
        },
        config.cache.routeExpire,
        false
    );

    await browser.close();

    return {
        title: jrnlName,
        link: jrnlUrl,
        item: list,
        allowEmpty: true,
    };
};
export default handler;
