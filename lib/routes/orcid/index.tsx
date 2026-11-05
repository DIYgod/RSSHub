import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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

    for (const item of items) {
        for (const work of item.works) {
            works.push(work);
        }
    }

    const out = works.map((work) => {
        const { year, month, day } = work.publicationDate ?? {};
        const publicationDate = year ? [year, month, month ? day : undefined].filter(Boolean).join('-') : undefined;
        const identifier = work.workExternalIdentifiers.find((entry) => entry.relationship?.value === 'self' && (entry.normalizedUrl?.value || entry.url?.value));

        const info = {
            title: work.title.value,
            link: (typeof work.url === 'string' ? work.url : work.url?.value) ?? identifier?.normalizedUrl?.value ?? identifier?.url?.value,
            pubDate: publicationDate ? timezone(parseDate(publicationDate, month ? (day ? 'YYYY-MM-DD' : 'YYYY-MM') : 'YYYY'), 0) : undefined,
            category: work.workType?.value ? [work.workType.value] : undefined,
            description: renderToString(
                <>
                    {work.journalTitle?.value ? <h3>{work.journalTitle.value}</h3> : null}
                    <span>
                        {work.workExternalIdentifiers.map((identifier) => {
                            const label = `${identifier.externalIdentifierType.value}: ${identifier.externalIdentifierId.value}`;
                            return (
                                <>
                                    {identifier.url ? <a href={identifier.url.value}>{label}</a> : label}
                                    <br />
                                </>
                            );
                        })}
                    </span>
                    <span>Source: {work.sourceName}</span>
                </>
            ),
            guid: work.putCode.value,
        };
        return info;
    });

    return {
        title: 'ORCID Works List' + id,
        link: `${rootUrl}${id}`,
        item: out,
    };
}
