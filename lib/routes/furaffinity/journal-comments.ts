import { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/journal-comments/:id',
    name: 'Journal Comments',
    url: 'furaffinity.net',
    categories: ['social-media'],
    example: '/furaffinity/journal-comments/10925112',
    maintainers: ['TigerCubDen', 'SkyNetX007'],
    parameters: { id: 'Journal ID' },
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
            source: ['furaffinity.net/journal/:id'],
            target: '/journal-comments/:id',
        },
    ],
    handler,
};

async function handler(ctx) {
    const { id } = ctx.req.param();
    const urlJournal = `https://faexport.spangle.org.uk/journal/${id}.json`;
    const urlComments = `https://faexport.spangle.org.uk/journal/${id}/comments.json`;

    const dataJournal = await ofetch(urlJournal, {
        method: 'GET',
        headers: {
            Referer: 'https://faexport.spangle.org.uk/',
        },
    });

    const dataComments = await ofetch(urlComments, {
        method: 'GET',
        headers: {
            Referer: 'https://faexport.spangle.org.uk/',
        },
    });

    const items = dataComments.map((item) => ({
        title: item.text,
        link: `https://www.furaffinity.net/journal/${id}`,
        guid: item.id,
        description: `<img src="${item.avatar}"> <br> ${item.name}: ${item.text}`,
        pubDate: new Date(item.posted_at).toUTCString(),
        author: item.name,
    }));

    return {
        allowEmpty: true,
        title: `${dataJournal.title} - ${dataJournal.name} | Journal Comments`,
        link: `https://www.furaffinity.net/journal/${id}`,
        description: `Fur Affinity | ${dataJournal.title} by ${dataJournal.name} - Journal Comments`,
        item: items,
    };
}
