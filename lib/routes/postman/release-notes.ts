import MarkdownIt from 'markdown-it';

import type { Data, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const md = MarkdownIt({
    html: true,
});

export const route: Route = {
    path: '/release-notes',
    categories: ['program-update'],
    example: '/postman/release-notes',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['postman.com/downloads/release-notes', 'postman.com/'],
        },
    ],
    name: 'Release Notes',
    maintainers: ['nczitzk'],
    handler,
    url: 'postman.com/downloads/release-notes',
};

async function handler(): Promise<Data> {
    const rootUrl = 'https://www.postman.com';
    const apiUrl = `${rootUrl}/mkapi/release.json`;
    const currentUrl = `${rootUrl}/downloads/release-notes`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.notes.map((item) => {
        const content = parseReleaseContent(item.content, item.version);
        return {
            title: item.version,
            link: `${currentUrl}#${item.version}`,
            description: content.description,
            pubDate: content.pubDate ?? (item.createdAt ? parseDate(item.createdAt) : undefined),
        };
    });

    return {
        title: 'Release Notes | Postman',
        link: currentUrl,
        item: items,
        language: 'en',
    };
}

function parseReleaseContent(content: string, version: string) {
    const tokens = md.parse(content, {});
    let pubDate: Date | undefined;
    if (tokens[0]?.type === 'heading_open' && [version, `Postman ${version}`, `Postman v${version}`].includes(tokens[1]?.content)) {
        tokens.splice(0, 3);
        const next = tokens.at(0);
        const releaseDate = tokens[1]?.content;
        if (next?.type === 'paragraph_open' && releaseDate && /^[A-Z][a-z]+ \d{1,2}, \d{4}$/.test(releaseDate)) {
            // Keep the publisher's calendar date at UTC midnight, independent of the host timezone.
            const date = parseDate(`${releaseDate} +0000`, ['MMMM D, YYYY ZZ', 'MMM D, YYYY ZZ']);
            const calendarDate = date.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: releaseDate.split(' ', 1)[0].length === 3 ? 'short' : 'long', day: 'numeric' });
            if (calendarDate === releaseDate.replace(/ (\d{1,2}),/, (_, day) => ` ${Number(day)},`)) {
                pubDate = date;
                tokens.splice(0, 3);
            }
        }
    }
    return { description: md.renderer.render(tokens, md.options, {}), pubDate };
}
