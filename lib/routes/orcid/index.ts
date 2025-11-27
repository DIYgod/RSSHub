import path from 'node:path';

import type { Route } from '@/types';
import got from '@/utils/got';
import { art } from '@/utils/render';

export const route: Route = {
    path: '/:id',
    categories: ['study'],
    example: '/orcid/0000-0002-4731-9700',
    parameters: { id: 'Open Researcher and Contributor ID' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Works List',
    maintainers: ['OrangeEd1t'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const rootUrl = 'https://orcid.org/';
    const currentUrl = `${rootUrl}${id}/worksPage.json?offset=0&sort=date&sortAsc=false&pageSize=20`;
    const response = await got(currentUrl);

    const items = response.data.groups;
    const works = [];
    const out = [];

    for (const item of items) {
        for (let j = 0; j < item.works.length; j++) {
            works.push(item.works[j]);
        }
    }

    works.map((work) => {
        let Str = '';

        for (let l = 0; l < work.workExternalIdentifiers.length; l++) {
            Str += work.workExternalIdentifiers[l].url
                ? '<a href="' + work.workExternalIdentifiers[l].url.value + '">' + work.workExternalIdentifiers[l].externalIdentifierType.value + ': ' + work.workExternalIdentifiers[l].externalIdentifierId.value + '</a><br>'
                : work.workExternalIdentifiers[l].externalIdentifierType.value + ': ' + work.workExternalIdentifiers[l].externalIdentifierId.value + '<br>';
        }

        const info = {
            title: work.title.value,
            link: work.url,
            description: art(path.join(__dirname, 'templates/description.art'), {
                title: work.title.value,
                journalTitle: work.journalTitle?.value,
                publicationDate: work.publicationDate,
                workType: work.workType.value,
                Str,
                sourceName: work.sourceName,
            }),
            guid: work.putCode.value,
        };
        out.push(info);
        return info;
    });

    return {
        title: 'ORCID Works List' + id,
        link: currentUrl,
        item: out,
    };
}
