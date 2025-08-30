import { Route } from '@/types';
import utils from './utils';

export const route: Route = {
    path: '/actors/:id/:filter?/:addon_tags?',
    categories: ['multimedia'],
    example: '/javdb/actors/R2Vg',
    parameters: {
        id: '编号，可在演员页 URL 中找到',
        filter: '过滤，见下表，默认为 `全部`',
        addon_tags: '类别过滤规则，默认为不过滤类别',
    },
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
| a    | p      | s        | d      | c      |

  所有演员编号参见 [演員庫](https://javdb.com/actors)

  可使用 addon_tags 添加额外的 tag 过滤规则，\`+xxx\` 代表包含 id 为 \`xxx\` 的 tag，\`-xxx\`代表排除。当包含所有 \`+xxx\` 视为包含，在此基础上包含任意 \`-xxx\` 视为排除。

  例如 \`/javdb/actors/R2Vg/d/+20,-8\` 可在筛选 \`可下載\` 的基础上继续筛选 \`VR\`，并排除 \`精選綜合\`。

  当包含 \`-xxx\` 排除规则时，响应时间可能变长。`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    let filter = ctx.req.param('filter') ?? '';
    filter = filter === 'a' ? '' : filter;
    const addonTags = (ctx.req.param('addon_tags') ?? '').split(',');
    const includeTags = addonTags
        .filter((item) => item[0] === '+')
        .map((item) => item.slice(1))
        .join(',');
    const excludeTags = new Set(addonTags.filter((item) => item[0] === '-').map((item) => item.slice(1)));
    const finalTags = includeTags && filter ? `${filter},${includeTags}` : `${filter}${includeTags}`;
    const currentUrl = `/actors/${id}${finalTags ? `?t=${finalTags}` : ''}`;

    const filters = {
        '': '',
        p: '可播放',
        s: '單體作品',
        d: '可下載',
        c: '含字幕',
    };

    const title = `JavDB${filters[filter] === '' ? '' : ` - ${filters[filter]}`} `;
    return await utils.ProcessItems(ctx, currentUrl, title, excludeTags);
}
