import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

import { renderDesc } from './utils';

export const route: Route = {
    path: '/:pub/:jrn',
    categories: ['journal'],
    example: '/aip/aapt/ajp',
    parameters: { pub: 'Publisher id', jrn: 'Journal id' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: true,
    },
    radar: [
        {
            source: ['pubs.aip.org/:pub/:jrn'],
        },
    ],
    name: 'Journal',
    maintainers: ['Derekmini', 'auto-bot-ty'],
    handler,
    description: `Refer to the URL format \`pubs.aip.org/:pub/:jrn\`

::: tip
  More jounals can be found in [AIP Publications](https://publishing.aip.org/publications/find-the-right-journal).
:::`,
};

async function handler(ctx) {
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

    const list = publication.toArray().map((item) => {
        const title = $(item).find('.item-title a:first').text();
        const link = $(item).find('.item-title a:first').attr('href');
        const doilink = $(item).find('.citation-label a').attr('href');
        const doi = doilink && doilink.match(/10\.\d+\/\S+/)[0];
        const id = $(item).find('h5[data-resource-id-access]').data('resource-id-access');
        const authors = $(item)
            .find('.al-authors-list')
            .find('a')
            .toArray()
            .map((element) => $(element).text())
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
    });

    return {
        title: jrnlName,
        link: jrnlUrl,
        item: list,
        allowEmpty: true,
    };
}
