import { load, type CheerioAPI } from 'cheerio';
import type { Route, DataItem } from '@/types';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';

const BASE = 'https://hex2077.dev';

const SECTION_IDS = [
    '产品与功能更新',
    '前沿研究',
    '行业展望与社会影响',
    '开源top项目',
    '社媒分享',
];

const SECTION_NAMES = [
    '产品与功能更新',
    '前沿研究',
    '行业展望与社会影响',
    '开源TOP项目',
    '社媒分享',
];

function extractSection($: CheerioAPI, sectionName: string): string[] {
    const ol = $(`h3[id="${sectionName}"]`).nextAll('ol').first();
    if (!ol.length) {
        return [];
    }

    return ol
        .find('> li')
        .map((_, liEl) => $(liEl).text().trim().replaceAll(/\s+/g, ' '))
        .filter((_, text) => text)
        .toArray();
}

export const route: Route = {
    name: 'AI 日报',
    categories: ['programming'],
    path: '/daily/:section?',
    example: '/hex2077/daily',
    maintainers: ['fc525260'],
    parameters: {
        section: {
            description:
                '栏目序号（可选）：1=产品与功能更新，2=前沿研究，3=行业展望与社会影响，4=开源TOP项目，5=社媒分享。留空返回全文。',
        },
    },
    handler: async (ctx) => {
        const sectionParam = ctx.req.param('section');
        const sectionIndex = sectionParam ? Number.parseInt(sectionParam, 10) - 1 : -1;

        // Step 1: fetch listing page
        const listingHtml = await ofetch<string>(BASE + '/docs/');
        const $ = load(listingHtml);

        const paths = $('a[href^="/docs/20"]')
            .map((_, el) => $(el).attr('href') || '')
            .filter((_, href) => /^\/docs\/\d{4}-\d{2}\/\d{4}-\d{2}-\d{2}\/$/.test(href))
            .toArray()
            .toSorted((a, b) => b.localeCompare(a));
        const latestPath = paths[0];
        if (!latestPath) {
            throw new Error('未找到日报文章');
        }

        const dateLabel = latestPath.match(/\d{4}-\d{2}-\d{2}/)?.[0] || '';
        const articleUrl = BASE + latestPath;

        // Step 2: fetch article page
        const detailHtml = await ofetch<string>(articleUrl);
        const $d = load(detailHtml);

        // Step 3: build RSS items
        if (sectionIndex >= 0 && sectionIndex < SECTION_IDS.length) {
            // Single section mode
            const sectionName = SECTION_IDS[sectionIndex];
            const sectionDisplay = SECTION_NAMES[sectionIndex];
            const sectionItems = extractSection($d, sectionName);

            const items: DataItem[] = sectionItems.map((text, i) => ({
                title: text,
                description: text,
                link: articleUrl,
                guid: `${latestPath}${sectionName}-${i}`,
                pubDate: parseDate(dateLabel),
            }));

            return {
                title: `hex2077 AI日报 · ${sectionDisplay} (${dateLabel})`,
                link: BASE + '/docs/',
                description: `hex2077 每日 AI 资讯日报 - ${sectionDisplay}`,
                language: 'zh-CN',
                item: items,
            };
        } else {
            // Full-text mode: all sections
            const allItems: DataItem[] = SECTION_IDS.flatMap((sectionName, si) => {
                const sectionDisplay = SECTION_NAMES[si];
                return extractSection($d, sectionName).map((text, i) => ({
                    title: `[${sectionDisplay}] ${text}`,
                    description: text,
                    link: articleUrl,
                    guid: `${latestPath}${sectionName}-${i}`,
                    pubDate: parseDate(dateLabel),
                }));
            });

            return {
                title: `hex2077 AI日报 · 全文 (${dateLabel})`,
                link: BASE + '/docs/',
                description: 'hex2077 每日 AI 资讯日报 - 全 5 个栏目',
                language: 'zh-CN',
                item: allItems,
            };
        }
    },
};
