import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

const baseUrl = 'https://www.re3data.org';
const getText = ($: CheerioAPI, name: string) => $(String.raw`r3d\:${name}`).text();

export const route: Route = {
    path: '/subject/:subject',
    name: 'Repositories by subject',
    categories: ['study'],
    maintainers: ['DIYgod'],
    example: '/re3data/subject/223',
    parameters: {
        subject: 'DFG subject code from the subjects[] parameter of a re3data search URL, for example 21 (Biology) or 223 (Neurosciences).',
    },
    description:
        "Subscribe to research repository records in a subject, using the registry's last-update dates. Each item represents a repository record, rather than papers or datasets within that repository. Updated records receive a new GUID. Subject codes are listed at [Browse by subject](https://www.re3data.org/browse/by-subject/).",
    handler,
};

async function getRepository(id: string) {
    return await cache.tryGet(`${baseUrl}/api/v40/repository/${id}`, async () => {
        const xml = await ofetch(`${baseUrl}/api/v40/repository/${id}`);
        const $ = load(xml, { xmlMode: true });
        const subjects = $(String.raw`r3d\:subject`)
            .toArray()
            .map((element) => ({
                id: $(element)
                    .find(String.raw`r3d\:subjectId`)
                    .text(),
                name: $(element)
                    .find(String.raw`r3d\:subjectName`)
                    .text(),
            }));
        const updated = getText($, 'lastUpdate');
        const item: DataItem = {
            title: getText($, 'repositoryName'),
            link: `${baseUrl}/repository/${id}`,
            guid: `${id}:${updated}`,
            // The registry provides a calendar date, represented at UTC midnight.
            pubDate: parseDate(updated, 0),
            description: renderToString(
                <>
                    <p>{getText($, 'description')}</p>
                    <p>
                        <a href={getText($, 'repositoryUrl')}>Visit repository</a>
                    </p>
                </>
            ),
            category: subjects.map((value) => value.name),
        };
        return { item, subjects };
    });
}

async function handler(ctx) {
    const subject = ctx.req.param('subject');
    if (!/^\d{1,5}$/.test(subject)) {
        throw new InvalidParameterError('Use the numeric DFG subject code from a re3data subject search URL.');
    }
    const link = `${baseUrl}/search?subjects[]=${subject}`;
    const xml = await ofetch(`${baseUrl}/api/v40/repositories`, {
        query: { 'subjects[]': subject },
    });
    const $ = load(xml, { xmlMode: true });
    const ids = $('repository > id')
        .toArray()
        .slice(0, getRouteLimit(ctx, 20))
        .map((element) => $(element).text());
    const records = await pMap(ids, (id) => getRepository(id), { concurrency: 3 });
    const subjectName = records.flatMap((record) => record.subjects).find((value) => value.id === subject)?.name ?? subject;

    return {
        title: `re3data - ${subjectName}`,
        description: `Research repository records in ${subjectName}, ordered by the registry's last-update date.`,
        link,
        item: records.map((record) => record.item),
    };
}
