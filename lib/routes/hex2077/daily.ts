import { load, type CheerioAPI } from 'cheerio';
import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const BASE = 'https://hex2077.dev';

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
        .toArray()
        .map((liEl) => $(liEl as any).text().trim().replaceAll(/\s+/g, ' '))
        .filter(Boolean);
}

export const route: Route = {
    name: 'AI 日报',
    categories: ['programming'],
    path: '/daily/:section?',
    example: '/hex2077/daily',
    maintainers: ['fc525260'],
    handler: async (ctx) => {
        const sectionParam = ctx.req.param('section');
        const targetSections: string[] = sectionParam && /^[1-5]$/.test(sectionParam)
            ? [SECTION_NAMES[Number.parseInt(sectionParam, 10) - 1]]
            : SECTION_NAMES;
        // Step 1: fetch listing page
        const listingHtml = await ofetch<string>(BASE + '/docs/');
        const $ = load(listingHtml);

        const paths: string[] = $('a[href^="/docs/20"]')
            .toArray()
            .map((el) => $(el as any).attr('href') || '')
            .filter((href) => /^\/docs\/\d{4}-\d{2}\/\d{4}-\d{2}-\d{2}\/$/.test(href))
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

        // Step 3: build RSS items — one per section, description merges all <li>s
        const allItems: DataItem[] = targetSections.flatMap((sectionDisplay) => {
            const sectionItems = extractSection($d, sectionDisplay);
            if (sectionItems.length === 0) {
                return [];
            }
            return {
                title: `[${sectionDisplay}] ${dateLabel}`,
                description: sectionItems.join('\n\n'),
                link: articleUrl,
                guid: `${latestPath}${sectionDisplay}`,
                pubDate: parseDate(dateLabel),
            };
        });

        return {
            title: `hex2077 AI日报 · 全文 (${dateLabel})`,
            link: BASE + '/docs/',
            description: 'hex2077 每日 AI 资讯日报 - 全 5 个栏目',
            language: 'zh-CN',
            item: allItems,
        };
    },
};