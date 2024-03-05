// @ts-nocheck
import cache from '@/utils/cache';
import { load } from 'cheerio';
const { puppeteerGet, renderDesc } = require('./utils');
import { config } from '@/config';
import { isValidHost } from '@/utils/valid-host';
import puppeteer from '@/utils/puppeteer';

export default async (ctx) => {
    const pub = ctx.req.param('pub');
    const jrn = ctx.req.param('jrn');
    const host = `https://pubs.aip.org`;
    const jrnlUrl = `${host}/${pub}/${jrn}/issue`;
    if (!isValidHost(pub)) {
        throw new Error('Invalid pub');
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

    browser.close();

    ctx.set('data', {
        title: jrnlName,
        link: jrnlUrl,
        item: list,
        allowEmpty: true,
    });
};
