import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import utils from './utils';

export const route: Route = {
    path: '/remote/:site/:only_media?',
    categories: ['social-media', 'popular'],
    view: ViewType.SocialMedia,
    example: '/mastodon/remote/pawoo.net/true',
    parameters: {
        site: 'instance address, only domain, no `http://` or `https://` protocol header',
        only_media: {
            description: 'whether only display media content, default to false, any value to true',
            options: [
                { value: 'true', label: 'true' },
                { value: 'false', label: 'false' },
            ],
            default: 'false',
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Instance timeline (federated)',
    maintainers: ['hoilc'],
    handler,
};

async function handler(ctx) {
    const site = ctx.req.param('site');
    const only_media = ctx.req.param('only_media') ? 'true' : 'false';

    const url = `http://${site}/api/v1/timelines/public?remote=true&only_media=${only_media}`;

    const response = await got.get(url, { headers: utils.apiHeaders() });
    const list = response.data;

    return {
        title: `Federated Public${ctx.req.param('only_media') ? ' Media' : ''} Timeline on ${site}`,
        link: `https://${site}`,
        item: utils.parseStatuses(list),
    };
}
