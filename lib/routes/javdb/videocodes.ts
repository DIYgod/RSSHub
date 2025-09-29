import { Route } from '@/types';
import utils from './utils';

export const route: Route = {
    path: '/video_codes/:code/:filter?',
    categories: ['multimedia'],
    example: '/javdb/video_codes/SIVR',
    parameters: { id: '番号前缀', filter: '过滤，见下表，默认为 `全部`' },
    features: {
        requireConfig: [
            {
                name: 'JAVDB_SESSION',
                description: 'JavDB登陆后的session值，可在控制台的cookie下查找 `_jdb_session` 的值，即可获取',
                optional: true,
            },
        ],
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['javdb.com/'],
            target: '',
        },
    ],
    name: '番号',
    maintainers: ['sgpublic'],
    handler,
    url: 'javdb.com/',
    description: `| 全部 | 可播放   | 單體作品 | 可下載   | 字幕  | 預覽圖  |
| ---- | -------- | -------- | -------- | ----- | ------- |
|      | playable | single   | download | cnsub | preview |`,
};

async function handler(ctx) {
    const code = ctx.req.param('code');
    const filter = ctx.req.param('filter') ?? '';

    const currentUrl = `/video_codes/${code}${filter ? `?f=${filter}` : ''}`;

    const filters = {
        '': '',
        playable: '可播放',
        single: '單體作品',
        download: '可下載',
        cnsub: '字幕',
        preview: '預覽圖',
    };

    const title = `JavDB${filters[filter] === '' ? '' : ` - ${filters[filter]}`} `;

    return await utils.ProcessItems(ctx, currentUrl, title);
}
