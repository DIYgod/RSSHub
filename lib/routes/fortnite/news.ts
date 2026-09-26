import { escapeText } from 'entities';
import type { Context } from 'hono';

import { renderYoutube } from '@/routes/youtube/utils';
import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const langs = ['ar', 'de', 'en-US', 'es-ES', 'es-MX', 'fr', 'it', 'ja', 'ko', 'pl', 'pt-BR', 'ru', 'tr', 'zh-Hans'];

const tags = {
    'battle-royale': 'Battle Royale',
    'fortnite-competitive': 'Fortnite Competitive',
    'fortnite-festival': 'Fortnite Festival',
    'fortnite-news': 'Fortnite News',
    'fortnite-og': 'Fortnite OG',
    'fortnite-uefn-and-creative': 'UEFN and Creative',
    'lego-fortnite': 'LEGO Fortnite Odyssey',
    'lego-fortnite-brick-life': 'LEGO Fortnite Brick Life',
    ranked: 'Ranked Battle Royale',
    reload: 'Reload',
    'rocket-racing': 'Rocket Racing',
    'save-the-world': 'Save the World',
};

export const route: Route = {
    path: '/news/:options?',
    categories: ['game'],
    example: '/fortnite/news',
    parameters: {
        options: 'Query-style options, `lang` and `tag`, see below',
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
            source: ['www.fortnite.com/news'],
            target: '/news',
        },
        {
            source: ['www.fortnite.com/news/tag/:tag'],
            target: '/news/tag=:tag',
        },
    ],

    name: 'News',
    maintainers: ['lyqluis'],
    handler,
    url: 'www.fortnite.com/news',
    description: `- \`lang\`, default \`en-US\`, one of ${langs.map((lang) => `\`${lang}\``).join(', ')}
- \`tag\`, optional, one of ${Object.entries(tags)
        .map(([value, label]) => `\`${value}\` (${label})`)
        .join(', ')}`,
};

const fetchData = async (path: string, lang: string) => {
    const values = await ofetch(`https://www.fortnite.com${path}.data`, {
        query: { lang },
        responseType: 'json',
    });
    const get = (i: number) => {
        if (i < 0) {
            return null;
        }
        const value = values[i];
        if (Array.isArray(value)) {
            return value.map((element) => get(element));
        }
        if (typeof value === 'object') {
            return Object.fromEntries(Object.entries(value).map(([key, index]) => [values[Number(key.slice(1))], get(index as number)]));
        }
        return value;
    };
    return get(0);
};

const blockTags = {
    paragraph: 'p',
    'heading-one': 'h1',
    'heading-two': 'h2',
    'heading-three': 'h3',
    'heading-four': 'h4',
    'heading-five': 'h5',
    'heading-six': 'h6',
    'bulleted-list': 'ul',
    'numbered-list': 'ol',
    'list-item': 'li',
    'block-quote': 'blockquote',
    table: 'table',
    table_head: 'thead',
    table_body: 'tbody',
    table_row: 'tr',
    table_header_cell: 'th',
    table_cell: 'td',
};

const renderNodes = (nodes): string =>
    nodes
        .map((node) => {
            if (node.text !== undefined) {
                let html = escapeText(node.text);
                if (node.bold) {
                    html = `<b>${html}</b>`;
                }
                if (node.italic) {
                    html = `<i>${html}</i>`;
                }
                if (node.underline) {
                    html = `<u>${html}</u>`;
                }
                return html;
            }
            const inner = renderNodes(node.children);
            if (node.type === 'link') {
                return `<a href="${node.href}">${inner}</a>`;
            }
            if (node.type === 'list-item-child') {
                return inner;
            }
            const tag = blockTags[node.type] ?? 'div';
            return `<${tag}>${inner}</${tag}>`;
        })
        .join('');

const originalImage = (url: string) => url.replace('/resize=fit:clip,width:1920/quality=value:80/', '/');

const renderSection = (section) => {
    switch (section.__typename) {
        case 'ElementRichText':
            return renderNodes(section.text.raw.children);
        case 'ElementLegacyRichText':
            return section.content.markdown;
        case 'ElementArticleDivider':
            return '<hr>';
        case 'ElementArticleImage':
            return `<img src="${originalImage(section.image.url)}">`;
        case 'ElementImageGallery':
            return section.images.map((image) => `<img src="${originalImage(image.url)}">`).join('');
        case 'ElementArticleVideoYouTube':
            return renderYoutube(true, section.youTubeVideoId, undefined, undefined);
        case 'ElementArticleVideoEmbed':
            return `<video controls preload="metadata" src="${section.asset.url}"></video>`;
        default:
            throw new Error(`Unhandled section type: ${section.__typename}`);
    }
};

async function handler(ctx: Context) {
    const { lang = 'en-US', tag } = Object.fromEntries(new URLSearchParams(ctx.req.param('options')));
    const baseUrl = 'https://www.fortnite.com';
    const path = tag ? `/news/tag/${tag}` : '/news';

    const data = await fetchData(path, lang);
    const page = data[tag ? 'routes/news.tag.$tag' : 'routes/news._index'].data;

    const list: DataItem[] = [page.heroNewsItem, ...page.recentNewsItems.newsItems].filter(Boolean).map((item) => ({
        title: item.heading,
        link: `${baseUrl}${item.link}?lang=${lang}`,
        category: item.tags.map((t) => t.label),
        image: item.imgSrc,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const data = await fetchData(new URL(item.link!).pathname, lang);
                const article = data['routes/news.$'].data.newsArticle;

                item.pubDate = parseDate(article.publishedDate);
                item.description = article.sections.map((section) => renderSection(section)).join('');

                return item;
            })
        )
    );

    return {
        title: page.seo.title,
        description: page.seo.description,
        link: `${baseUrl}${path}?lang=${lang}`,
        image: page.seo.ogImage.url,
        language: lang as Language,
        item: items,
    };
}
