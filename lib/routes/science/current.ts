import { Route } from '@/types';
import cache from '@/utils/cache';
// journals form AAAS publishing group
//
// science:        Science
// sciadv:         Science Advances
// sciimmunol:     Science Immunology
// scirobotics:    Science Robotics
// signaling:      Science Signaling
// stm:            Science Translational Medicine

import { load } from 'cheerio';
import got from '@/utils/got';
import { baseUrl, fetchDesc, getItem } from './utils';
import puppeteer from '@/utils/puppeteer';

export const route: Route = {
    path: '/current/:journal?',
    categories: ['journal'],
    example: '/science/current/science',
    parameters: { journal: 'Short name for a journal' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: true,
    },
    radar: [
        {
            source: ['science.org/journal/:journal', 'science.org/toc/:journal/current'],
            target: '/current/:journal',
        },
    ],
    name: 'Current Issue',
    maintainers: ['y9c', 'TonyRL'],
    handler,
    description: `|  Short name |    Full name of the journal    | Route                                                                          |
| :---------: | :----------------------------: | ------------------------------------------------------------------------------ |
|   science   |             Science            | [/science/current/science](https://rsshub.app/science/current/science)         |
|    sciadv   |        Science Advances        | [/science/current/sciadv](https://rsshub.app/science/current/sciadv)           |
|  sciimmunol |       Science Immunology       | [/science/current/sciimmunol](https://rsshub.app/science/current/sciimmunol)   |
| scirobotics |        Science Robotics        | [/science/current/scirobotics](https://rsshub.app/science/current/scirobotics) |
|  signaling  |        Science Signaling       | [/science/current/signaling](https://rsshub.app/science/current/signaling)     |
|     stm     | Science Translational Medicine | [/science/current/stm](https://rsshub.app/science/current/stm)                 |

  -   Using route (\`/science/current/\` + "short name for a journal") to get current issue of a journal from AAAS.
  -   Leaving it empty (\`/science/current\`) to get update from Science.`,
};

async function handler(ctx) {
    const { journal = 'science' } = ctx.req.param();
    const pageURL = `${baseUrl}/toc/${journal}/current`;

    const { data: pageResponse } = await got(pageURL, {
        headers: {
            cookie: 'cookiePolicy=iaccept;',
        },
    });
    const $ = load(pageResponse);
    const pageTitleName = $('head > title').text();

    const list = $('.toc__section .card')
        .toArray()
        .map((item) => getItem(item, $));

    const browser = await puppeteer();
    const items = await fetchDesc(list, browser, cache.tryGet);
    await browser.close();

    return {
        title: `${pageTitleName} | Current Issue`,
        description: `Current Issue of ${pageTitleName}`,
        image: `${baseUrl}/apple-touch-icon.png`,
        link: pageURL,
        language: 'en-US',
        item: items,
    };
}
