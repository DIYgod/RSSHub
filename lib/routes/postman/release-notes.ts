import { Route } from '@/types';
import got from '@/utils/got';
import MarkdownIt from 'markdown-it';
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

async function handler() {
    const rootUrl = 'https://www.postman.com';
    const apiUrl = `${rootUrl}/mkapi/release.json`;
    const currentUrl = `${rootUrl}/downloads/release-notes`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.notes.map((item) => ({
        title: item.version,
        link: `${currentUrl}#${item.version}`,
        description: md.render(item.content),
    }));

    return {
        title: 'Release Notes | Postman',
        link: currentUrl,
        item: items,
    };
}
