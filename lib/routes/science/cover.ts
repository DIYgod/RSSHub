import { Route } from '@/types';

// journals form AAAS publishing group
//
// science:        Science
// sciadv:         Science Advances
// sciimmunol:     Science Immunology
// scirobotics:    Science Robotics
// signaling:      Science Signaling
// stm:            Science Translational Medicine

import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import { baseUrl } from './utils';

export const route: Route = {
    path: '/cover',
    categories: ['journal'],
    example: '/science/cover',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['science.org/'],
        },
    ],
    name: 'Cover Story',
    maintainers: ['y9c', 'TonyRL'],
    handler,
    url: 'science.org/',
    description: `Subscribe to the cover images of Science journals, and get the latest publication updates in time.

  Including 'Science', 'Science Advances', 'Science Immunology', 'Science Robotics', 'Science Signaling' and 'Science Translational Medicine'.`,
};

async function handler() {
    const pageURL = `${baseUrl}/journals`;

    const { data: pageResponse } = await got(pageURL, {
        headers: {
            cookie: 'cookiePolicy=iaccept;',
        },
    });
    const $ = load(pageResponse);

    const items = $('.browse-journals .browse-journals__item')
        .not('.partner-journals')
        .toArray()
        .map((item) => {
            item = $(item);
            const name = item.find('.row h2').first().text().trim();
            const volume = item
                .find('.row li')
                .eq(0)
                .text()
                .trim()
                .match(/Volume (\d+)/)[1];
            const issue = item
                .find('.row li')
                .eq(1)
                .text()
                .trim()
                .match(/Issue (\d+)/)[1];
            const date = item.find('.row li').eq(2).text().trim();
            const coverUrl = `${baseUrl}${item.find('.cover-image__popup-moving-cover').attr('data-cover-src')}`;
            const content = $('.cover-image__popup-view__caption-wrapper').html();
            const link = $('.browse-journals__item__links a').eq(0).attr('href').replace('/current', '');

            return {
                title: `${name} | Volume ${volume} Issue ${issue}`,
                description: art(path.join(__dirname, 'templates/cover.art'), {
                    coverUrl,
                    content,
                }),
                link: `${baseUrl}/${link}/${volume}/${issue}`,
                pubDate: parseDate(date),
            };
        });

    return {
        title: $('head title').text(),
        description: $('meta[property="og:description"]').attr('content'),
        image: `${baseUrl}/apple-touch-icon.png`,
        link: pageURL,
        language: 'en-US',
        item: items,
    };
}
