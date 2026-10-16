import { load } from 'cheerio';
import { escapeAttribute, escapeText } from 'entities';
import MarkdownIt from 'markdown-it';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import CaptchaError from '@/errors/types/captcha';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';

const PAGE = 1;
const PAGE_SIZE = 20;
const markdown = new MarkdownIt({ html: true });
const sourceOrigin = 'https://cloud.tencent.com';
type SourceBrowser = Awaited<ReturnType<typeof getPlaywrightPage>>;
type GetSourceBrowser = (link?: string) => Promise<SourceBrowser>;
type SourceBody = { classifyId: string | number; page: number; pagesize: number; type: string } | { scene: number };
class SourceBrowserInitializationError extends Error {}

const isSourceChallenge = (error: unknown): error is CaptchaError | FetchError =>
    error instanceof CaptchaError || (error instanceof FetchError && error.status === 567 && typeof error.data === 'string' && error.data.includes('已被该站点的安全策略拦截'));

async function createSourceBrowser(link: string) {
    let browser: SourceBrowser | undefined;
    try {
        browser = await getPlaywrightPage(link, { noGoto: true, closeTimeout: 0 });
        await browser.context.route('**/*', (request) => (['document', 'script', 'stylesheet', 'xhr', 'fetch'].includes(request.request().resourceType()) ? request.continue() : request.abort()));
        const response = await browser.page.goto(link, { waitUntil: 'domcontentloaded', timeout: 20000 });
        if (!response || (response.status() !== 200 && !(response.status() === 567 && (await response.text()).includes('已被该站点的安全策略拦截')))) {
            throw new Error(`The Tencent Cloud browser source returned HTTP ${response?.status() ?? 'unknown'}.`);
        }
        if (new URL(browser.page.url()).origin !== sourceOrigin) {
            throw new Error('The Tencent Cloud source redirected outside its expected origin.');
        }
        return browser;
    } catch (error) {
        if (browser) {
            await browser.destroy();
        }
        throw new SourceBrowserInitializationError('Failed to initialize the Tencent Cloud source browser.', { cause: error });
    }
}

async function withSourceBrowser<T>(callback: (getBrowser: GetSourceBrowser) => Promise<T>) {
    let pending: Promise<SourceBrowser> | undefined;
    let closing = false;
    const getBrowser = async (link = `${sourceOrigin}/developer/column`) => {
        if (closing) {
            throw new Error('The Tencent Cloud source browser is closing.');
        }
        const browser = await (pending ??= createSourceBrowser(link));
        if (closing) {
            throw new Error('The Tencent Cloud source browser is closing.');
        }
        return browser;
    };
    try {
        return await callback(getBrowser);
    } finally {
        closing = true;
        if (pending) {
            const [result] = await Promise.allSettled([pending]);
            if (result.status === 'fulfilled') {
                await result.value.destroy();
            }
        }
    }
}

async function getSourceJson<T>(link: string, body: SourceBody, getBrowser: GetSourceBrowser): Promise<T> {
    try {
        return await ofetch<T>(link, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
    } catch (error) {
        if (!isSourceChallenge(error)) {
            throw error;
        }
        const browser = await getBrowser();
        const response = await browser.page.evaluate(
            async ({ link, body }) => {
                const response = await fetch(link, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
                return { status: response.status, contentType: response.headers.get('content-type'), text: await response.text() };
            },
            { link, body }
        );
        if (response.status !== 200 || !response.contentType?.includes('application/json')) {
            throw error;
        }
        return JSON.parse(response.text);
    }
}

interface Article {
    articleId: number;
    title: string;
    summary: string;
    createTime: number;
    author: { nickname: string };
    tags: Array<{ tagName: string }>;
}

interface RichAttributes {
    level?: number;
    start?: number;
    src?: string;
    href?: string;
    alt?: string;
    colspan?: number;
    rowspan?: number;
    style?: string;
    color?: string;
    background?: string;
}

interface RichNode {
    type: string;
    text?: string;
    attrs?: RichAttributes;
    content?: RichNode[];
    marks?: Array<{ type: string; attrs?: RichAttributes }>;
}

const renderRichContent = (node: RichNode): string => {
    const attrs = node.attrs ?? {};
    const content = (node.content ?? []).map(renderRichContent).join('');
    if (node.type === 'text') {
        return (node.marks ?? []).reduce(
            (text, mark) => {
                const attributes = mark.attrs ?? {};
                switch (mark.type) {
                    case 'bold':
                        return `<strong>${text}</strong>`;
                    case 'italic':
                        return `<em>${text}</em>`;
                    case 'code':
                        return `<code>${text}</code>`;
                    case 'link':
                        return `<a href="${escapeAttribute(attributes.href ?? '')}">${text}</a>`;
                    case 'textStyle': {
                        const style = [attributes.color ? `color:${attributes.color}` : '', attributes.background ? `background:${attributes.background}` : ''].filter(Boolean).join(';');
                        return style ? `<span style="${escapeAttribute(style)}">${text}</span>` : text;
                    }
                    default:
                        throw new Error(`Unsupported article text mark: ${mark.type}`);
                }
            },
            escapeText(node.text ?? '')
        );
    }
    switch (node.type) {
        case 'doc':
            return content;
        case 'heading': {
            const level = Math.min(6, Math.max(1, attrs.level ?? 1));
            return `<h${level}>${content}</h${level}>`;
        }
        case 'image': {
            const image = `<img src="${escapeAttribute(attrs.src ?? '')}" alt="${escapeAttribute(attrs.alt ?? '')}">`;
            return attrs.href ? `<a href="${escapeAttribute(attrs.href)}">${image}</a>` : image;
        }
        case 'hardBreak':
            return '<br>';
        case 'codeBlock':
            return `<pre><code>${content}</code></pre>`;
        case 'orderedList':
            return `<ol start="${attrs.start ?? 1}">${content}</ol>`;
        case 'tableHeader':
        case 'tableCell': {
            const tag = node.type === 'tableHeader' ? 'th' : 'td';
            return `<${tag} colspan="${attrs.colspan ?? 1}" rowspan="${attrs.rowspan ?? 1}">${content}</${tag}>`;
        }
        case 'paragraph':
            return `<p>${content}</p>`;
        case 'blockquote':
            return `<blockquote>${content}</blockquote>`;
        case 'bulletList':
            return `<ul>${content}</ul>`;
        case 'listItem':
            return `<li>${content}</li>`;
        case 'table':
            return `<table>${content}</table>`;
        case 'tableRow':
            return `<tr>${content}</tr>`;
        default:
            throw new Error(`Unsupported article content node: ${node.type}`);
    }
};

interface ArticlePage {
    props?: {
        pageProps?: {
            fallback?: Record<string, { articleInfo?: { content?: string; contentType?: string } }>;
        };
    };
}

const extractArticleContent = (html: string): string => {
    const $ = load(html);
    const body = $('.mod-content__markdown');
    if (body.text().trim() || body.find('img,video,audio').length) {
        return body.html() ?? '';
    }
    const hydrated = $('#__NEXT_DATA__').text();
    if (hydrated) {
        const page: ArticlePage = JSON.parse(hydrated);
        const article = Object.values(page.props?.pageProps?.fallback ?? {}).find((value) => value.articleInfo)?.articleInfo;
        if (article?.content) {
            if (article.contentType === 'markdown') {
                return markdown.render(article.content);
            }
            if (article.contentType === 'rich') {
                const document: RichNode = JSON.parse(article.content);
                return renderRichContent(document);
            }
        }
    }
    if (html.includes('EO_Bot_Ssid')) {
        throw new CaptchaError('The article page requires source verification.');
    }
    throw new Error('The article page does not contain public article content.');
};

async function getArticleContent(link: string, getBrowser: GetSourceBrowser): Promise<string> {
    try {
        return extractArticleContent(await ofetch<string>(link));
    } catch (error) {
        if (!isSourceChallenge(error)) {
            throw error;
        }
        const browser = await getBrowser(link);
        const page = browser.page.url() === link ? browser.page : await browser.context.newPage();
        try {
            if (page !== browser.page) {
                await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 20000 });
            }
            await page.waitForSelector('.mod-content__markdown:not(:empty), #__NEXT_DATA__', { timeout: 10000, state: 'attached' });
            if (new URL(page.url()).origin !== sourceOrigin) {
                throw new Error('The Tencent Cloud article redirected outside its expected origin.', { cause: error });
            }
            return extractArticleContent(await page.content());
        } finally {
            if (page !== browser.page) {
                await page.close();
            }
        }
    }
}

export const route: Route = {
    path: '/cloud/developer/column/:categoryId?',
    categories: ['programming'],
    example: '/tencent/cloud/developer/column/1',
    parameters: { categoryId: 'categoryId from page url' },
    radar: [
        {
            source: ['cloud.tencent.com/developer/column'],
        },
    ],
    name: '开发者社区专栏',
    maintainers: ['lyling'],
    features: { requirePuppeteer: true },
    handler: (ctx) =>
        withSourceBrowser(async (getBrowser) => {
            const categoryId = ctx.req.param('categoryId') ?? 0;
            const link = 'https://cloud.tencent.com/developer/api/home/article-list';
            const response = await getSourceJson<{ list: Article[] }>(
                link,
                {
                    classifyId: categoryId,
                    page: PAGE,
                    pagesize: PAGE_SIZE,
                    type: '',
                },
                getBrowser
            );

            const items = await pMap(
                response.list,
                async (item) => {
                    const articleLink = `https://cloud.tencent.com/developer/article/${item.articleId}`;
                    let content: string;
                    try {
                        content = await cache.tryGet(`tencent:column-body:v1:${item.articleId}`, () => getArticleContent(articleLink, getBrowser));
                    } catch (error) {
                        if (error instanceof SourceBrowserInitializationError) {
                            throw error;
                        }
                        content = item.summary;
                    }
                    return {
                        // Article title
                        title: item.title,
                        // Article link
                        link: articleLink,
                        // Main article content
                        description: content,
                        // Source publication date
                        pubDate: parseDate(item.createTime * 1000),
                        // Source author, when available
                        author: item.author.nickname,
                        // Source categories, when available
                        category: item.tags.map((tag) => tag.tagName),
                    };
                },
                { concurrency: 3 }
            );

            const classify = await findClassifyById(categoryId, getBrowser);

            const title = classify?.name || `分类 ${categoryId}`;
            const description = `${title} - 腾讯云开发者社区`;

            return {
                title,
                description,
                link: 'https://cloud.tencent.com/developer/column',
                item: items,
            };
        }),
};

async function findClassifyById(id, getBrowser: GetSourceBrowser) {
    const classifylink = 'https://cloud.tencent.com/developer/api/column/get-classify-list-by-scene';
    try {
        const response = await cache.tryGet(classifylink, async () => {
            const response = await getSourceJson<{ list: Array<{ id: number; name: string }> }>(classifylink, { scene: 0 }, getBrowser);
            return response;
        });

        return response.list.find((classify) => classify.id === Number(id));
    } catch (error) {
        if (!(error instanceof FetchError)) {
            throw error;
        }
    }
}
