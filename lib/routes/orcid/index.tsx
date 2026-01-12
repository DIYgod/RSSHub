import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';

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
    const works: any[] = [];
    const out = [];

    for (const item of items) {
        for (const work of item.works) {
            works.push(work);
        }
    }

    works.map((work) => {
        let Str = '';

        for (const identifier of work.workExternalIdentifiers) {
            Str += identifier.url
                ? '<a href="' + identifier.url.value + '">' + identifier.externalIdentifierType.value + ': ' + identifier.externalIdentifierId.value + '</a><br>'
                : identifier.externalIdentifierType.value + ': ' + identifier.externalIdentifierId.value + '<br>';
        }

        const info = {
            title: work.title.value,
            link: work.url,
            description: renderToString(
                <>
                    <h2>{work.title.value}</h2>
                    {work.journalTitle?.value ? <h3>{work.journalTitle.value}</h3> : null}
                    <span>
                        {[work.publicationDate?.year, work.publicationDate?.month, work.publicationDate?.day].filter(Boolean).join('-')} | {work.workType.value}
                    </span>
                    <br />
                    <span>{raw(Str)}</span>
                    <span>Source: {work.sourceName}</span>
                </>
            ),
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
