import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/submission-comments/:id',
    name: 'Submission Comments',
    url: 'furaffinity.net',
    categories: ['social-media'],
    example: '/furaffinity/submission-comments/24259751',
    maintainers: ['TigerCubDen', 'SkyNetX007'],
    parameters: { id: 'Submission ID' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['furaffinity.net/view/:id'],
            target: '/submission-comments/:id',
        },
    ],
    handler,
};

async function handler(ctx) {
    const { id } = ctx.req.param();
    const urlSubmission = `https://faexport.spangle.org.uk/submission/${id}.json`;
    const urlComments = `https://faexport.spangle.org.uk/submission/${id}/comments.json`;

    const dataSubmission = await ofetch(urlSubmission, {
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
        link: `https://www.furaffinity.net/view/${id}`,
        guid: item.id,
        description: `<img src="${item.avatar}"> <br> ${item.name}: ${item.text}`,
        pubDate: new Date(item.posted_at).toUTCString(),
        author: item.name,
    }));

    return {
        allowEmpty: true,
        title: `${dataSubmission.title} - ${dataSubmission.name} | Submission Comments`,
        link: `https://www.furaffinity.net/view/${id}`,
        description: `Fur Affinity | ${dataSubmission.title} by ${dataSubmission.name} - Submission Comments`,
        item: items,
    };
}
