import { type CheerioAPI, load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const BASE = 'https://hex2077.dev';

const SECTION_NAMES = ['产品与功能更新', '前沿研究', '行业展望与社会影响', '开源top项目', '社媒分享'];

const ARTICLE_LIMIT = 10;
const ARTICLE_PATH_PATTERN = /^\/docs\/\d{4}-\d{2}\/\d{4}-\d{2}-\d{2}\/$/;

function extractSection($: CheerioAPI, sectionName: string): string[] {
    const ol = $(`h3[id="${sectionName}"]`).nextAll('ol').first();
    if (!ol.length) {
        return [];
    }

    return ol
        .find('> li')
        .toArray()
        .map((liEl) =>
            $(liEl as any)
                .text()
                .trim()
                .replaceAll(/\s+/g, ' ')
        )
        .filter(Boolean);
}

async function parseArticle(path: string): Promise<DataItem> {
    const dateLabel = path.match(/\d{4}-\d{2}-\d{2}/)?.[0] || '';
    const articleUrl = BASE + path;
    const detailHtml = await ofetch<string>(articleUrl);
    const $ = load(detailHtml);
    const description = SECTION_NAMES.map((sectionName) => {
        const sectionItems = extractSection($, sectionName);
        if (sectionItems.length === 0) {
            return '';
        }

        return `<h3>${sectionName}</h3><p>${sectionItems.join('</p><p>')}</p>`;
    })
        .filter(Boolean)
        .join('');

    return {
        title: `hex2077 AI日报 (${dateLabel})`,
        description,
        link: articleUrl,
        guid: articleUrl,
        pubDate: parseDate(dateLabel),
    };
}

export const route: Route = {
    name: 'AI 日报',
    categories: ['programming'],
    path: '/daily',
    example: '/hex2077/daily',
    maintainers: ['fc525260'],
    handler: async () => {
        const listingHtml = await ofetch<string>(BASE + '/docs/');
        const $ = load(listingHtml);

        const paths: string[] = $('a[href^="/docs/20"]')
            .toArray()
            .map((el) => $(el as any).attr('href') || '')
            .filter((href, index, array) => ARTICLE_PATH_PATTERN.test(href) && array.indexOf(href) === index)
            .toSorted((a, b) => b.localeCompare(a))
            .slice(0, ARTICLE_LIMIT);

        if (paths.length === 0) {
            throw new Error('未找到日报文章');
        }

        const items = await Promise.all(paths.map((path) => cache.tryGet(BASE + path, () => parseArticle(path))));

        return {
            title: 'hex2077 AI日报',
            link: BASE + '/docs/',
            description: 'hex2077 每日 AI 资讯日报',
            language: 'zh-CN',
            item: items,
        };
    },
};
