import { load } from 'cheerio';
import { html } from 'hono/html';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

function parsePublicationDate(value?: string) {
    if (!value?.trim()) {
        return;
    }
    const date = parseDate(value);
    return Number.isNaN(date.getTime()) ? undefined : timezone(date, 8);
}

export const handler = async (ctx) => {
    const baseUrl = 'http://due.hitsz.edu.cn';

    // 按类型分组（可直接用于 handler 中的逻辑判断）
    const categoryGroups = {
        // 教务核心业务（传统教务管理相关）
        teaching: [
            'jwxw/jwgl', // 教务管理
            'jwxw/kwgl', // 考务管理
            'jwxw/zcgl', // 注册管理
            'jwxw/xkgl', // 选课管理
            'jwxw/cjgl', // 成绩管理
        ],

        // 学籍相关（学生档案与身份管理）
        studentStatus: [
            'jwxw/xjgl_b_', // 学籍管理（本）
            'jwxw/xjgl_y_', // 学籍管理（研）
        ],

        // 教学支持（辅助教学的资源与服务）
        teachingSupport: [
            'jwxw/jxxxh', // 教学信息化
            'jwxw/jzxj', // 奖助学金
        ],

        // 学生培养（不同学段的培养动态）
        education: [
            'xwgl/bksxw', // 本科生新闻
            'xwgl/ssxwpy/ktyzj', // 硕士学位培养
            'xwgl/bsxwpy/qqhj1', // 博士学位培养
        ],
    };

    // 修改：将 query 参数改为 path 参数（PR评论要求：Use path parameter instead of search query）
    const { type = 'all' } = ctx.req.param(); // 从路径参数获取，默认值 'all'
    if (type !== 'all' && !Object.hasOwn(categoryGroups, type)) {
        throw new InvalidParameterError('Unknown teaching-office group. Use all, teaching, studentStatus, teachingSupport, or education.');
    }
    const validType = type;

    // 根据类型选择对应栏目组
    const categories = validType === 'all' ? Object.values(categoryGroups).flat() : categoryGroups[validType];

    // 并发抓取所有栏目的第一页
    // 修复 ESLint：替换 .catch(() => null) 为带日志的try/catch
    const pagePromises = categories.map((category) => got(new URL(`${category}.htm`, baseUrl).href));
    const pageResponses = await Promise.all(pagePromises);

    // 提取所有文章链接
    // 修复：用flatMap替代for循环+push（同步逻辑优化）
    const articlePromises: Array<DataItem & { link: string }> = pageResponses.flatMap((response, i) => {
        if (!response) {
            return [];
        }

        const category = categories[i];
        const $ = load(response.data);
        const listItemsOnPage = $('ul.box-main-list li, .list-main li, .list-main-modular li').toArray();

        // 原map逻辑不变
        return listItemsOnPage
            .map((el) => {
                const $el = $(el);
                const linkUrl = $el.find('a').attr('href');
                if (!linkUrl) {
                    return null;
                } // 过滤无链接项

                const title = $el.find('span').text().trim();
                const pubDateStr = $el.find('label').text().trim();

                return {
                    title,
                    link: new URL(linkUrl, baseUrl).href,
                    pubDate: parsePublicationDate(pubDateStr),
                    category,
                    // 使用标题作为描述
                };
            })
            .filter(Boolean); // 过滤 null 项
    });

    // 获取所有文章详情
    const uniqueItems = new Map<string, DataItem & { link: string }>();
    for (const item of articlePromises) {
        const existing = uniqueItems.get(item.link);
        if (existing) {
            const previous = Array.isArray(existing.category) ? existing.category : existing.category ? [existing.category] : [];
            const current = Array.isArray(item.category) ? item.category : item.category ? [item.category] : [];
            existing.category = [...new Set([...previous, ...current])];
        } else {
            uniqueItems.set(item.link, item);
        }
    }
    const allResolvedItems = uniqueItems.values().toArray();

    // 排序和截取
    const filteredItems = allResolvedItems.filter((item) => !item.title.includes('统一身份认证平台'));

    const detailedItems = await pMap(
        filteredItems,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                const content = $('.v_news_content').html() ?? $('.wp_articlecontent').html() ?? '';
                const attachments = $('.page-main-fj a[href]')
                    .toArray()
                    .filter((element) => $(element).attr('href'))
                    .map((element) => String(html`<p><a href="${new URL($(element).attr('href')!, item.link).href}">${$(element).text()}</a></p>`))
                    .join('');
                return { description: content + attachments || undefined };
            })),
        }),
        { concurrency: 3 }
    );

    return {
        title: '哈尔滨工业大学（深圳）教务部-教务学务与学位管理-所有栏目新闻汇总',
        description: '哈尔滨工业大学（深圳）教务部中教务学务和学位管理所有栏目的最新新闻汇总，包括教务管理、考务管理、注册管理、选课管理、成绩管理、学籍管理、教学信息化、奖助学金、本科生新闻、硕士学位培养、博士学位培养等',
        link: 'http://due.hitsz.edu.cn/jwxw/jwgl.htm',
        item: detailedItems,
        author: '哈尔滨工业大学（深圳）教务部',
    };
};

export const route: Route = {
    // 修改：path 增加可选参数 :type?（适配路径参数逻辑）
    path: '/due/general/:type?',
    name: '教务部教务学务与学位管理所有栏目',
    url: 'due.hitsz.edu.cn',
    maintainers: ['guohuiyuan'],
    handler,
    example: '/hitsz/due/general',
    // 新增：补充 parameters 声明（修复PR评论的参数缺失问题）
    parameters: {
        type: {
            description: '栏目类型筛选，默认all（所有栏目）',
            options: [
                { value: 'all', label: '所有栏目' },
                { value: 'teaching', label: '教务核心业务' },
                { value: 'studentStatus', label: '学籍相关' },
                { value: 'teachingSupport', label: '教学支持' },
                { value: 'education', label: '学生培养' },
            ],
            default: 'all',
        },
    },
    // 修改：Markdown 二级标题##降级为四级标题####（PR评论要求：Do not use level 2 heading）
    description: `哈尔滨工业大学（深圳）教务部中教务学务和学位管理所有栏目的最新新闻汇总。

#### 栏目分组说明

支持按业务类型筛选，使用路径参数指定分组：

- \`type=teaching\` - 教务核心业务：教务管理、考务管理、注册管理、选课管理、成绩管理
- \`type=studentStatus\` - 学籍相关：本科生学籍管理、研究生学籍管理
- \`type=teachingSupport\` - 教学支持：教学信息化、奖助学金
- \`type=education\` - 学生培养：本科生新闻、硕士学位培养、博士学位培养
- \`type=all\` 或省略 - 所有栏目（默认）

#### 包含栏目：

- [教务管理](http://due.hitsz.edu.cn/jwxw/jwgl.htm)
- [考务管理](http://due.hitsz.edu.cn/jwxw/kwgl.htm)
- [注册管理](http://due.hitsz.edu.cn/jwxw/zcgl.htm)
- [选课管理](http://due.hitsz.edu.cn/jwxw/xkgl.htm)
- [成绩管理](http://due.hitsz.edu.cn/jwxw/cjgl.htm)
- [学籍管理（本）](http://due.hitsz.edu.cn/jwxw/xjgl_b_.htm)
- [学籍管理（研）](http://due.hitsz.edu.cn/jwxw/xjgl_y_.htm)
- [教学信息化](http://due.hitsz.edu.cn/jwxw/jxxxh.htm)
- [奖助学金](http://due.hitsz.edu.cn/jwxw/jzxj.htm)
- [本科生新闻](http://due.hitsz.edu.cn/xwgl/bksxw.htm)
- [硕士学位培养](http://due.hitsz.edu.cn/xwgl/ssxwpy/ktyzj.htm)
- [博士学位培养](http://due.hitsz.edu.cn/xwgl/bsxwpy/qqhj1.htm)`,
    categories: ['university'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['due.hitsz.edu.cn/jwxw/jwgl.htm'],
            target: '/due/general',
        },
    ],
};
