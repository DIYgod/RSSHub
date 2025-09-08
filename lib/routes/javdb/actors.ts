import { Route } from '@/types';
import utils from './utils';

export const route: Route = {
    path: '/actors/:id/:filter?',
    categories: ['multimedia'],
    example: '/javdb/actors/R2Vg',
    parameters: { id: '编号，可在演员页 URL 中找到', filter: '过滤，见下表，默认为 `全部`' },
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
    name: '演員',
    maintainers: ['nczitzk'],
    handler,
    url: 'javdb.com/',
    description: `| 全部 | 可播放 | 單體作品 | 可下載 | 含字幕 |
| ---- | ------ | -------- | ------ | ------ |
|      | p      | s        | d      | c      |

  所有演员编号参见 [演員庫](https://javdb.com/actors)

  可用 addon_tags 参数添加额外的过滤 tag，可从网页 url 中获取，例如 \`/javdb/actors/R2Vg?addon_tags=212,18\` 可筛选 \`VR\` 和 \`中出\`。`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const filter = ctx.req.param('filter') ?? '';
    const addonTags = ctx.req.query('addon_tags') ?? '';

    const finalTags = addonTags && filter ? `${filter},${addonTags}` : `${filter}${addonTags}`;
    const currentUrl = `/actors/${id}${finalTags ? `?t=${finalTags}` : ''}`;

    const filters = {
        '': '',
        p: '可播放',
        s: '單體作品',
        d: '可下載',
        c: '含字幕',
    };

    const title = `JavDB${filters[filter] === '' ? '' : ` - ${filters[filter]}`} `;
    return await utils.ProcessItems(ctx, currentUrl, title);
}
