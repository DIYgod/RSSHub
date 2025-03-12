import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import timezone from '@/utils/timezone';

type SchoolItem = {
    name: string;
    code: string;
    SSL?: boolean;
    dateSelector?: string;
    newsListSelector: string;
    categories: {
        name: string;
        id: string;
        path: string;
        newsListSelector?: string;
    }[];
};

const SCHOOLS: SchoolItem[] = [
    {
        name: '电子科学与工程学院',
        code: 'esteie',
        SSL: false,
        dateSelector: 'span.food-time',
        newsListSelector: 'div.pg-list.fr.list-right-cont ul li',
        categories: [
            { name: '新闻信息', id: 'xwxx', path: 'xwyhd/xw' },
            { name: '通知公告', id: 'tzgg', path: 'xwyhd/gg' },
            { name: '研究动态', id: 'yjdt', path: 'xwyhd/yjdt' },
            { name: '学术活动', id: 'xshd', path: 'xwyhd/xshd' },
            { name: '教工风采', id: 'jgfc', path: 'xwyhd/jgfc' },
            { name: '校友之窗', id: 'xyzc', path: 'xwyhd/xyzc' },
        ],
    },
    {
        name: '微电子学院',
        code: 'ele',
        dateSelector: 'i',
        newsListSelector: 'div.list_content_ct ul li',
        categories: [
            { name: '新闻信息', id: 'xwxx', path: 'index/xwdt' },
            { name: '通知公告', id: 'tzgg', path: 'index/tzgg' },
        ],
    },
    {
        name: '信息与通信工程学院',
        code: 'dice',
        dateSelector: 'span',
        newsListSelector: 'div.list-con ul li',
        categories: [
            { name: '新闻信息', id: 'xwxx', path: 'xwgg/xyxw1' },
            { name: '通知公告', id: 'tzgg', path: 'xwgg/tzgg1' },
            { name: '学术讲座', id: 'xwxx', path: 'xwgg/xsjz1' },
            { name: '科技动态', id: 'kjdt', path: 'xwgg/kjdt1' },
        ],
    },
    {
        name: '自动化科学与工程学院',
        code: 'automation',
        dateSelector: 'span',
        newsListSelector: 'ul.mainCon li',
        categories: [
            { name: '最新消息', id: 'zxxx', path: 'xwdt/zxxx' },
            { name: '通知公告', id: 'tzgg', path: 'xwdt/tzgg' },
            { name: '论坛报告', id: 'ltbg', path: 'xwdt/ltbg' },
        ],
    },
    {
        name: '计算机学院',
        code: 'cs',
        dateSelector: undefined,
        newsListSelector: 'div.list dl dd h6',
        categories: [
            { name: '新闻信息', id: 'xwxx', path: 'xwgg/xwxx' },
            { name: '通知公告', id: 'tzgg', path: 'xwgg/tzgg' },
        ],
    },
    {
        name: '人工智能学院',
        code: 'iair',
        dateSelector: 'b',
        newsListSelector: 'ul.mainCon li',
        categories: [
            { name: '新闻动态', id: 'xwdt', path: 'xwdt' },
            { name: '通知公告', id: 'tzgg', path: 'tzgg' },
            { name: '教学教务', id: 'jxjw', path: 'index/jxjw' },
            { name: '学术报告', id: 'xsbg', path: 'tzgg/xsbg' },
        ],
    },
    {
        name: '网络空间安全学院',
        code: 'cybersec',
        SSL: false,
        dateSelector: 'span.date',
        newsListSelector: 'ul.list li',
        categories: [
            { name: '最新消息', id: 'zxxx', path: 'xwzx/zxxx' },
            { name: '通知公告', id: 'tzgg', path: 'xwzx/tzgg' },
            { name: '论坛报告', id: 'ltbg', path: 'xwzx/ltbg' },
        ],
    },
    {
        name: '软件学院',
        code: 'se',
        dateSelector: 'p.time',
        newsListSelector: 'div.txtList ul li',
        categories: [
            { name: '新闻信息', id: 'xwxx', path: 'xwgg/xwxx', newsListSelector: 'div.imgList ul li' },
            { name: '通知公告', id: 'tzgg', path: 'xwgg/tzgg' },
            { name: '教学教务', id: 'jxjw', path: 'jxjw' },
            { name: '本科教务', id: 'bkjw', path: 'rcpy/bkpy/bkjw' },
            { name: '研究生教务', id: 'yjsjw', path: 'rcpy/yjspy/yjsjw' },
            { name: '科学研究', id: 'kxyj', path: 'kxyj/kxyj' },
            { name: '创新实践', id: 'cxsj', path: 'rcpy/cxsj' },
            { name: '实习就业', id: 'sxjy', path: 'sxjy' },
        ],
    },
];

export const route: Route = {
    path: '/school/:schoolCode/:category?',
    categories: ['university'],
    example: '/xjtu/school/se',
    parameters: { schoolCode: '学院代码，详见下方表格', category: '栏目类型，默认请求`tzgg`，详见下方表格' },
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
            source: SCHOOLS.map((school) => `${school.code}.xjtu.edu.cn`),
        },
    ],
    name: '学院网站',
    maintainers: ['YoghurtGuy'],
    handler,
    description: generateMarkdownTable(SCHOOLS),
};

async function handler(ctx) {
    const { schoolCode, category = 'tzgg' } = ctx.req.param();

    const schoolConfig = SCHOOLS.find((school) => school.code === schoolCode);
    if (!schoolConfig) {
        logger.error('学院代码错误');
        return null;
    }
    const categoryConfig = schoolConfig.categories.find((c) => c.id === category);
    if (!categoryConfig) {
        logger.error('类别代码错误');
        return null;
    }

    const baseUrl = `http${schoolConfig.SSL === false ? '' : 's'}://${schoolCode}.xjtu.edu.cn`;
    const response = await ofetch(`${baseUrl}/${categoryConfig.path}.htm`);
    const $ = load(response);

    const newsItems = $(categoryConfig.newsListSelector ?? schoolConfig.newsListSelector)
        .toArray()
        .map((element) => {
            const item = $(element);
            const linkElement = item.find('a');
            return {
                title: linkElement.attr('title'),
                link: new URL(linkElement.attr('href')!, baseUrl).href,
                pubDate: schoolConfig.dateSelector ? timezone(parseDate(item.find(schoolConfig.dateSelector).text()), +8) : undefined,
            } as DataItem;
        });

    const items = await Promise.all(
        newsItems.map((item) =>
            cache.tryGet(item.link!, async () => {
                try {
                    const res = await ofetch(item.link!);
                    const content = load(res);
                    item.description = content('#vsb_content').html() || '';
                    if (content('form ul').length > 0) {
                        item.description += content('form ul').html();
                    }
                    return item;
                } catch (error) {
                    logger.error(`Fetch failed for ${item.link}:`, error);
                    return item;
                }
            })
        )
    );

    return {
        title: `${schoolConfig.name}-${categoryConfig.name}`,
        link: baseUrl,
        item: items,
    } as Data;
}

function generateMarkdownTable(schools: SchoolItem[]) {
    const allCategories = new Set<string>();
    for (const school of schools) {
        for (const category of school.categories) {
            allCategories.add(category.name);
        }
    }

    const categoriesArray = [...allCategories];
    let table = `| 学院名称 | 学院代码 | ${categoriesArray.join(' | ')} |\n`;
    table += `| -------- | -------- | ${'- | '.repeat(categoriesArray.length)}\n`;

    for (const school of schools) {
        const categoryMap = new Map(school.categories.map((c) => [c.name, c.id]));
        table += `| ${school.name} | ${school.code} | `;
        table += categoriesArray.map((name) => (categoryMap.has(name) ? categoryMap.get(name) : '')).join(' | ');
        table += ' |\n';
    }

    return table;
}
