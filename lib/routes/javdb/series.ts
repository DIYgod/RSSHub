import { Route } from '@/types';
import utils from './utils';

export const route: Route = {
    path: '/series/:id/:filter?',
    categories: ['picture'],
    example: '/javdb/series/1NW',
    parameters: { id: '编号，可在系列页 URL 中找到', filter: '过滤，见下表，默认为 `全部`' },
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
    name: '系列',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const filter = ctx.req.param('filter') ?? '';

    const currentUrl = `/series/${id}${filter ? `?f=${filter}` : ''}`;

    const filters = {
        '': '',
        playable: '可播放',
        single: '單體作品',
        download: '可下載',
        cnsub: '字幕',
        preview: '預覽圖',
    };

    const title = `JavDB${filters[filter] === '' ? '' : ` - ${filter[filter]}`} `;

    ctx.set('data', await utils.ProcessItems(ctx, currentUrl, title));
}
