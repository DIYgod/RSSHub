import { load } from 'cheerio';

import { config } from '@/config';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import cache from '@/utils/cache';
import playwright from '@/utils/playwright';
import { isValidHost } from '@/utils/valid-host';

import { playwrightGet, renderDesc } from './utils';

const handler = async (ctx) => {
    const pub = ctx.req.param('pub');
    const jrn = ctx.req.param('jrn');
    const host = 'https://pubs.aip.org';
    const jrnlUrl = `${host}/${pub}/${jrn}/issue`;
    if (!isValidHost(pub)) {
        throw new InvalidParameterError('Invalid pub');
    }

    // use Playwright due to the obstacle by cloudflare challenge
    const browser = await playwright();

    const { jrnlName, list } = await cache.tryGet(
        jrnlUrl,
        async () => {
            const response = await playwrightGet(jrnlUrl, browser);
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
