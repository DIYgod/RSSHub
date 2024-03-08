import { Route } from '@/types';
import utils from './utils';

export const route: Route = {
    path: '/actors/:id/:filter?',
    categories: ['picture'],
    example: '/javdb/actors/R2Vg',
    parameters: { id: '编号，可在演员页 URL 中找到', filter: '过滤，见下表，默认为 `全部`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['javdb.com/'],
        target: '',
    },
    name: '演員',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const filter = ctx.req.param('filter') ?? '';

    const currentUrl = `/actors/${id}${filter ? `?t=${filter}` : ''}`;

    const filters = {
        '': '',
        p: '可播放',
        s: '單體作品',
        d: '可下載',
        c: '含字幕',
    };

    const title = `JavDB${filters[filter] === '' ? '' : ` - ${filters[filter]}`} `;

    ctx.set('data', await utils.ProcessItems(ctx, currentUrl, title));
}
