import { type CheerioAPI, load } from 'cheerio';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import got from '@/utils/got';
import { parseDateStrict } from '@/utils/time';

interface CategoryBase {
    link: string;
    title: string;
}

type CategoryLayout = 'list' | 'table';

// A section as written in `sections`, where `layout` may be omitted.
interface CategoryDefinition extends CategoryBase {
    layout?: CategoryLayout;
}

interface CategoryConfig extends CategoryBase {
    layout: CategoryLayout;
}

// The key is derived from `link` (trailing slash removed, `/` replaced by `-`), so only
// `link` and `title` need maintaining. A missing `layout` means the list layout; only
// 政策法规及解读 - 政策法规 currently uses the table layout.
const sections: CategoryDefinition[] = [
    { link: 'zcfgs/zcfg/', title: '政策法规及解读 - 政策法规', layout: 'table' },
    { link: 'zcfgs/zcjd/', title: '政策法规及解读 - 政策解读' },
    { link: 'ghjh/', title: '规划计划' },
    { link: 'tjsj/', title: '统计信息' },
    { link: 'zjxx/czyjs/', title: '资金信息 - 财政预决算' },
    { link: 'zjxx/qt/', title: '资金信息 - 其他资金信息' },
    { link: 'zjxx/sgjfcsc/', title: '资金信息 - 三公经费' },
    { link: 'rsxx5/', title: '人事信息' },
    { link: 'tzgg/', title: '通知公告' },
    { link: 'zscd/zy/', title: '政声传递 - 国家' },
    { link: 'zscd/gd/', title: '政声传递 - 广东省' },
    { link: 'zscd/sz/', title: '政声传递 - 深圳市' },
    { link: 'gzdt/', title: '工作动态' },
    { link: 'csyjgx/', title: '城市有机更新' },
    { link: 'video/', title: '视频集锦' },
    { link: 'zfws/', title: '执法文书' },
    { link: 'rd/', title: '人大建议政协提案' },
    { link: 'ndbg/', title: '年度信息公开报告' },
    { link: 'wzgznd/', title: '政府网站工作年度报表' },
];

const keyOf = (link: string): string => link.replace(/\/$/, '').replaceAll('/', '-');

// Only fills in the default for an omitted `layout`; any other value is passed through
// untouched so `getDataItems` can reject it instead of silently treating it as a list page.
const withLayout = (section: CategoryDefinition): CategoryConfig => ({ ...section, layout: section.layout ?? 'list' });

const config = new Map<string, CategoryConfig>(sections.map((section) => [keyOf(section.link), withLayout(section)]));

const options = Array.from(config, ([value, { title }]) => ({ value, label: title }));

export const route: Route = {
    path: '/zjj/xxgk/:caty',
    categories: ['government'],
    example: '/gov/shenzhen/zjj/xxgk/tzgg',
    parameters: { caty: { description: '信息类别', options } },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['zjj.sz.gov.cn/xxgk/:caty'],
        },
    ],
    name: '住房和建设局',
    maintainers: ['lonn', 'nuomi1'],
    handler,
    description: `| caty         | 信息类别                  |
| ------------ | ------------------------- |
| zcfgs-zcfg   | 政策法规及解读 - 政策法规 |
| zcfgs-zcjd   | 政策法规及解读 - 政策解读 |
| ghjh         | 规划计划                  |
| tjsj         | 统计信息                  |
| zjxx-czyjs   | 资金信息 - 财政预决算     |
| zjxx-qt      | 资金信息 - 其他资金信息   |
| zjxx-sgjfcsc | 资金信息 - 三公经费       |
| rsxx5        | 人事信息                  |
| tzgg         | 通知公告                  |
| zscd-zy      | 政声传递 - 国家           |
| zscd-gd      | 政声传递 - 广东省         |
| zscd-sz      | 政声传递 - 深圳市         |
| gzdt         | 工作动态                  |
| csyjgx       | 城市有机更新              |
| video        | 视频集锦                  |
| zfws         | 执法文书                  |
| rd           | 人大建议政协提案          |
| ndbg         | 年度信息公开报告          |
| wzgznd       | 政府网站工作年度报表      |`,
};

// Dispatch on `layout`. An unknown layout is a programming error, so it fails loudly
// instead of silently falling back to the list layout.
const getDataItems = (cfg: CategoryConfig, $: CheerioAPI): DataItem[] => {
    switch (cfg.layout) {
        case 'list':
            return getListDataItems($);
        case 'table':
            return getTableDataItems($);
        default:
            throw new Error(`Unsupported layout: ${cfg.layout}`);
    }
};

// The list layout: the anchor text is truncated on list pages, so prefer the `title`
// attribute. The date lives in the span that is not the category label.
function getListDataItems($: CheerioAPI): DataItem[] {
    return $('div.listcontent_right ul.ftdt-list li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const $a = $item.find('a');
            const date = $item.find('span:not(.fgType)').text().trim();

            return {
                title: $a.attr('title') || $a.text(),
                link: $a.attr('href'),
                pubDate: date ? parseDateStrict(date, 'YY-MM-DD', 8) : undefined,
                language: 'zh-CN',
            };
        });
}

// The table layout: read the anchor of the title column so the category label embedded
// in the same cell never leaks into the title.
function getTableDataItems($: CheerioAPI): DataItem[] {
    return $('table.regListTable tbody#post-list tr')
        .toArray()
        .map((row) => {
            const $row = $(row);
            const $a = $row.find('td.t2 a');
            const date = $row.find('td.t3').text().trim();

            return {
                title: $a.attr('title') || $a.text(),
                link: $a.attr('href'),
                pubDate: date ? parseDateStrict(date, 'YYYY-MM-DD', 8) : undefined,
                language: 'zh-CN',
            };
        });
}

async function handler(ctx: Context): Promise<Data> {
    const baseUrl = 'https://zjj.sz.gov.cn/xxgk/';

    const caty = ctx.req.param('caty');
    const cfg = caty ? config.get(caty) : undefined;

    if (!cfg) {
        throw new InvalidParameterError('Bad category. See <a href="https://docs.rsshub.app/routes/gov/shenzhen#zhu-fang-he-jian-she-ju">docs</a>');
    }

    const currentUrl = new URL(cfg.link, baseUrl).href;

    const { data: response }: { data: string } = await got(currentUrl);
    const $ = load(response);

    const items = getDataItems(cfg, $);

    return {
        title: `深圳市住房和建设局 - ${cfg.title}`,
        link: currentUrl,
        item: items,
        image: 'https://zjj.sz.gov.cn/favicon.ico',
        language: 'zh-CN',
    };
}
