import { Route } from '@/types';
import webApiImpl from './web-api/tweet';

export const route: Route = {
    path: '/tweet/:id/status/:status/:original?',
    categories: ['social-media'],
    example: '/twitter/tweet/DIYgod/status/1650844643997646852',
    parameters: {
        id: 'username; in particular, if starts with `+`, it will be recognized as a [unique ID](https://github.com/DIYgod/RSSHub/issues/12221), e.g. `+44196397`',
        status: 'tweet ID',
        original: 'extra parameters, data type of return, if the value is not `0`/`false` and `config.isPackage` is `true`, return the original data of twitter',
    },
    features: {
        requireConfig: true,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Tweet Details',
    maintainers: ['LarchLiu', 'Rongronggg9'],
    handler,
};

async function handler(ctx) {
    return await webApiImpl(ctx);
}
