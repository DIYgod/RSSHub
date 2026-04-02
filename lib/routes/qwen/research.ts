import MarkdownIt from 'markdown-it';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const md = new MarkdownIt({
    html: true,
    breaks: true,
});

interface ResearchArticle {
    id: string;
    title: string;
    date: string;
    description?: string;
    introduction: string;
    tags: string[];
    cover?: string;
    cover_small?: string;
    authors?: string[];
    author?: string;
    tokenLinks?: string;
}

const extractExternalLinks = (tokens: Array<Record<string, string>>): Array<{ href: string; label: string }> => {
    const links: Array<{ href: string; label: string }> = [];
    for (const token of tokens) {
        if (token.type === 'hugoButton' && token.href && token.label) {
            links.push({ href: token.href, label: token.label });
        }
    }
    return links;
};

export const route: Route = {
    path: '/research/:language?/:tag?',
    categories: ['programming'],
    example: '/qwen/research',
    parameters: {
        language: {
            description: 'Language',
            options: [
                { value: 'en', label: 'English' },
                { value: 'zh-cn', label: '中文' },
            ],
            default: 'en',
        },
        tag: {
            description: 'Filter by tag',
            options: [
                { value: 'Research', label: 'Research' },
                { value: 'Open-Source', label: 'Open Source' },
                { value: 'Release', label: 'Release' },
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
            source: ['qwen.ai/research'],
            target: '/qwen/research',
        },
    ],
    name: 'Research',
    maintainers: ['27Aaron'],
    url: 'qwen.ai/research',
    handler: async (ctx) => {
        const language = ctx.req.param('language') ?? 'en';
        const validLanguages = ['en', 'zh-cn'];
        const lang = validLanguages.includes(language) ? language : 'en';
        const tag = ctx.req.param('tag');
        const validTags = ['Research', 'Open-Source', 'Release'];
        const filterTag = tag && validTags.includes(tag as string) ? tag : undefined;

        const list: ResearchArticle[] = await ofetch('https://qwen.ai/api/page_config', {
            params: { code: 'research.research-list', language: lang },
        });

        const filtered = filterTag ? list.filter((item) => item.tags?.includes(filterTag)) : list;

        const items = await Promise.all(
            filtered.map((item) =>
                cache.tryGet(`qwen:research:${lang}:${item.id}`, async () => {
                    let content = item.introduction || item.description || '';

                    if (item.tokenLinks) {
                        try {
                            const tokens: Array<Record<string, string>> = await ofetch(item.tokenLinks);
                            const links = extractExternalLinks(tokens);
                            if (links.length) {
                                content += '\n\n' + links.map((l) => `[${l.label}](${l.href})`).join(' | ');
                            }
                        } catch {
                            /* ignore */
                        }
                    }

                    const coverHtml = item.cover ? `<img src="${item.cover}">` : '';
                    return {
                        title: item.title,
                        link: `https://qwen.ai/blog?id=${item.id}`,
                        pubDate: parseDate(item.date),
                        author: item.authors?.join(', ') ?? item.author,
                        category: item.tags,
                        description: `${coverHtml}${md.render(content)}`,
                    };
                })
            )
        );

        const titlePrefix = lang === 'zh-cn' ? 'Qwen 研究' : 'Qwen Research';
        const titleSuffix = filterTag ? ` - ${filterTag}` : '';

        return {
            title: `${titlePrefix}${titleSuffix}`,
            link: 'https://qwen.ai/research',
            item: items,
        };
    },
};
