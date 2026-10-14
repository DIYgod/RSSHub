import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';

import { getComments } from './utils';

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
    const { comments: dataComments, ...dataSubmission } = await getComments('submission', id);

    const items = dataComments.map((item) => ({
        title: item.text,
        link: `https://www.furaffinity.net/view/${id}/#cid:${item.id}`,
        guid: item.id,
        description: item.text,
        pubDate: item.posted_at ? parseDate(item.posted_at) : undefined,
        author: [{ name: item.name, ...(item.avatar && { avatar: new URL(item.avatar, 'https://www.furaffinity.net').href }) }],
    }));

    return {
        title: `${dataSubmission.title} - ${dataSubmission.name} | Submission Comments`,
        link: `https://www.furaffinity.net/view/${id}`,
        description: `Fur Affinity | ${dataSubmission.title} by ${dataSubmission.name} - Submission Comments`,
        item: items,
    };
}
