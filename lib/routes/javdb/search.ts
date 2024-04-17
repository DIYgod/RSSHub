import { Route } from '@/types';
import utils from './utils';

export const route: Route = {
    path: '/search/:keyword?/:filter?/:sort?',
    categories: ['multimedia'],
    example: '/javdb/search/巨乳',
    parameters: { keyword: '关键字，默认为空', filter: '过滤，见下表，默认为 `可播放`', sort: '排序，见下表，默认为 `按相关度排序`' },
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
    name: '搜索',
    maintainers: ['nczitzk'],
    handler,
    url: 'javdb.com/',
    description: `过滤

  | 全部 | 占位 | 可播放   | 單體作品 | 演員  | 片商  | 導演     | 系列   | 番號 | 可下載   | 字幕  | 預覽圖  |
  | ---- | ---- | -------- | -------- | ----- | ----- | -------- | ------ | ---- | -------- | ----- | ------- |
  |      | none | playable | single   | actor | maker | director | series | code | download | cnsub | preview |

  排序

  | 按相关度排序 | 按发布时间排序 |
  | ------------ | -------------- |
  | 0            | 1              |`,
};

async function handler(ctx) {
    const filter = ctx.req.param('filter') ?? '';
    const keyword = ctx.req.param('keyword') ?? '';
    const sort = ctx.req.param('sort') ?? '0';

    const currentUrl = `/search?q=${keyword}${filter && filter !== 'none' ? `&f=${filter}` : ''}&sb=${sort}`;

    const filters = {
        '': '',
        none: '',
        playable: '可播放',
        single: '單體作品',
        actor: '演員',
        maker: '片商',
        director: '導演',
        series: '系列',
        code: '番號',
        download: '可下載',
        cnsub: '字幕',
        preview: '預覽圖',
    };

    const sorts = {
        0: '按相关度排序',
        1: '按发布时间排序',
    };

    const title = `關鍵字 ${keyword} ${filters[filter] === '' ? '' : `+ ${filters[filter]}`} ${sorts[sort]} 搜索結果 - JavDB`;

    return await utils.ProcessItems(ctx, currentUrl, title);
}
