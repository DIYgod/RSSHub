import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const tagMap: Record<string, string> = {
    basemodel: '基座模型',
    multimodal: '多模态',
    reasoning: '推理模型',
    agent: 'Agent',
    codemodel: '代码模型',
};

const extractArticles = (html: string): Array<Record<string, unknown>> => {
    let startIdx = html.indexOf(String.raw`blogsItems\":[`);
    let offset = String.raw`blogsItems\":`.length;
    if (startIdx === -1) {
        startIdx = html.indexOf('blogsItems":[');
        offset = 'blogsItems":'.length;
    }
    if (startIdx === -1) {
        throw new Error('blogsItems not found in page');
    }

    const arrStart = startIdx + offset;
    let depth = 0;
    let arrEnd = arrStart;
    for (let i = arrStart; i < html.length; i++) {
        const c = html[i];
        if (c === '[') {
            depth++;
        } else if (c === ']') {
            depth--;
            if (depth === 0) {
                arrEnd = i + 1;
                break;
            }
        }
    }

    const raw = html
        .slice(arrStart, arrEnd)
        .replaceAll(String.raw`\"`, '"')
        .replaceAll(String.raw`\n`, '\n')
        .replaceAll(String.raw`\\`, '\\');
    return JSON.parse(raw);
};

export const route: Route = {
    path: '/research/:language?/:tag?',
    categories: ['programming'],
    example: '/zhipuai/research',
    parameters: {
        language: {
            description: 'Language',
            options: [
                { value: 'zh', label: '中文' },
                { value: 'en', label: 'English' },
            ],
            default: 'zh',
        },
        tag: {
            description: 'Filter by tag',
            options: [
                { value: 'basemodel', label: '基座模型' },
                { value: 'multimodal', label: '多模态' },
                { value: 'reasoning', label: '推理模型' },
                { value: 'agent', label: 'Agent' },
                { value: 'codemodel', label: '代码模型' },
            ],
        },
    },
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
            source: ['zhipuai.cn/zh/research', 'zhipuai.cn/en/research'],
            target: '/zhipuai/research',
        },
    ],
    name: 'Research',
    maintainers: ['27Aaron'],
    url: 'zhipuai.cn',
    description: '智谱AI研究文章，支持中英文切换和标签筛选',
    handler: async (ctx) => {
        const language = ctx.req.param('language') ?? 'zh';
        const validLanguages = ['zh', 'en'];
        const lang = validLanguages.includes(language) ? language : 'zh';
        const locale = lang === 'zh' ? 'zh' : 'en';

        const tag = ctx.req.param('tag');
        const filterTag = tag && tag in tagMap ? tagMap[tag] : undefined;

        // Fetch SSR page - article data is embedded in Next.js RSC payload
        const html = await ofetch(`https://www.zhipuai.cn/${locale}/research`, { responseType: 'text' });

        const items = extractArticles(html);

        const filtered = filterTag ? items.filter((item) => (item.tag_zh as string[])?.includes(filterTag)) : items;

        const titleKey = lang === 'zh' ? 'title_zh' : 'title_en';
        const resumeKey = lang === 'zh' ? 'resume_zh' : 'resume_en';
        const thumbnailKey = lang === 'zh' ? 'thumbnail_zh' : 'thumbnail_en';
        const tagKey = lang === 'zh' ? 'tag_zh' : 'tag_en';

        const result = filtered.map((item) => {
            const thumbnail = item[thumbnailKey] as string | undefined;
            const resume = item[resumeKey] as string | undefined;
            const coverHtml = thumbnail ? `<img src="${thumbnail}">` : '';
            const $ = load(`<div>${coverHtml}<p>${resume ?? ''}</p></div>`);
            $('div').find('script').remove();

            return {
                title: item[titleKey] as string,
                link: `https://www.zhipuai.cn/${locale}/research/${item.id}`,
                pubDate: parseDate(item.createAt as string),
                author: '智谱AI',
                category: item[tagKey] as string[],
                description: $('div').html() ?? '',
            };
        });

        const titlePrefix = lang === 'zh' ? '智谱AI 研究' : 'Zhipu AI Research';
        const titleSuffix = filterTag ? ` - ${filterTag}` : '';

        return {
            title: `${titlePrefix}${titleSuffix}`,
            link: `https://www.zhipuai.cn/${locale}/research`,
            item: result,
        };
    },
};
