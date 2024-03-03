// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import * as path from 'node:path';
import { art } from '@/utils/render';

const { CookieJar } = require('tough-cookie');
const cookieJar = new CookieJar();

export default async (ctx) => {
    const isnumber = ctx.req.param('journal');
    const sortType = ctx.req.param('sortType') ?? 'vol-only-seq';
    const host = 'https://ieeexplore.ieee.org';
    const jrnlUrl = `${host}/xpl/tocresult.jsp?isnumber=${isnumber}`;

    const response = await got(`${host}/rest/publication/home/metadata?issueid=${isnumber}`, {
        cookieJar,
    }).json();
    const punumber = response.publicationNumber;
    const volume = response.currentIssue.volume;
    const jrnlName = response.displayTitle;

    const response2 = await got
        .post(`${host}/rest/search/pub/${punumber}/issue/${isnumber}/toc`, {
            cookieJar,
            json: {
                punumber,
                isnumber,
                sortType,
                rowsPerPage: '100',
            },
        })
        .json();
    let list = response2.records.map((item) => {
        const $2 = load(item.articleTitle);
        const title = $2.text();
        const link = item.htmlLink;
        const doi = item.doi;
        let authors = 'Do not have author';
        if (Object.hasOwn(item, 'authors')) {
            authors = item.authors.map((itemAuth) => itemAuth.preferredName).join('; ');
        }
        const abstract = Object.hasOwn(item, 'abstract') ? item.abstract : '';
        return {
            title,
            link,
            authors,
            doi,
            volume,
            abstract,
        };
    });

    const renderDesc = (item) =>
        art(path.join(__dirname, 'templates/description.art'), {
            item,
        });
    list = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (item.abstract !== '') {
                    const response3 = await got(`${host}${item.link}`);
                    const { abstract } = JSON.parse(response3.body.match(/metadata=(.*);/)[1]);
                    const $3 = load(abstract);
                    item.abstract = $3.text();
                    item.description = renderDesc(item);
                }
                return item;
            })
        )
    );

    ctx.set('data', {
        title: jrnlName,
        link: jrnlUrl,
        item: list,
    });
};
