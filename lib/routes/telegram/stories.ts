import { Route } from '@/types';
import { Context } from 'hono';

export const route: Route = {
    path: '/stories/:username/:story?',
    categories: ['social-media'],
    example: '/stories/synchrone',
    parameters: { username: 'entity name', story: 'story' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [],
    name: 'Channel Media',
    maintainers: ['synchrone'],
    handler,
    description: ``,
};

export default async function handler(ctx: Context) {

}
