import { Route } from '@/types';
import utils from './utils';

export const route: Route = {
    path: '/series/:id/:filter?',
    categories: ['multimedia'],
    example: '/javdb/series/1NW',
    parameters: { id: '编号，可在系列页 URL 中找到', filter: '过滤，见下表，默认为 `全部`' },
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
    },
    radar: [
        {
            source: ['javdb.com/'],
            target: '',
        },
    ],
    name: '系列',
    maintainers: ['nczitzk'],
    handler,
    url: 'javdb.com/',
    description: `| 全部 | 可播放   | 單體作品 | 可下載   | 字幕  | 預覽圖  |
| ---- | -------- | -------- | -------- | ----- | ------- |
|      | playable | single   | download | cnsub | preview |

  所有系列编号参见 [系列庫](https://javdb.com/series)`,
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

    const title = `JavDB${filters[filter] === '' ? '' : ` - ${filters[filter]}`} `;

    return await utils.ProcessItems(ctx, currentUrl, title);
}
