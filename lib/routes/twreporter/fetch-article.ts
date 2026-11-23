import { load } from 'cheerio';
import { escapeText } from 'entities';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import { renderYoutube } from '@/routes/youtube/utils';
import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

import { renderImage } from './templates/image';

interface TableConfig {
    title: string;
    label?: string;
    footnotes: string[];
    columns: Array<{
        key: string;
        label: string;
    }>;
}
function parseCsv(value: string): Array<Record<string, string>> {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = '';
    let quoted = false;
    let closed = false;
    const text = value.replace(/^\u{FEFF}/u, '');
    for (let index = 0; index < text.length; index++) {
        const character = text[index];
        if (quoted) {
            if (character === '"') {
                if (text[index + 1] === '"') {
                    field += '"';
                    index++;
                } else {
                    quoted = false;
                    closed = true;
                }
            } else {
                field += character;
            }
        } else if (isOneOf(character, [',', '\r']) || character === '\n') {
            row.push(field);
            field = '';
            closed = false;
            if (character !== ',') {
                if (row.some((cell) => cell.trim().length > 0)) {
                    rows.push(row);
                }
                row = [];
                if (character === '\r' && text[index + 1] === '\n') {
                    index++;
                }
            }
        } else if (closed || (character === '"' && field.length > 0)) {
            throw new Error('The source table contains malformed CSV quoting');
        } else if (character === '"') {
            quoted = true;
        } else {
            field += character;
        }
    }
    if (quoted) {
        throw new Error('The source table contains an unterminated CSV field');
    }
    row.push(field);
    if (row.some((cell) => cell.trim().length > 0)) {
        rows.push(row);
    }
    const headers = rows.shift();
    if (!headers || new Set(headers).size !== headers.length || rows.some((cells) => cells.length !== headers.length)) {
        throw new Error('The source table contains missing, duplicate, or inconsistent CSV columns');
    }
    return rows.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index]])));
}
async function renderEmbeddedCode(embed): Promise<string> {
    const $ = load(embed.embeddedCodeWithoutScript, null, false);
    const tables = $('twreporter-table').toArray();
    await pMap(
        tables,
        async (table) => {
            const sourceUrl = $(table).attr('src');
            const configUrl = $(table).attr('config');
            if (!sourceUrl || !configUrl) {
                throw new Error('The source table is missing its CSV or configuration URL');
            }
            try {
                const rendered = await cache.tryGet(`twreporter:table:${sourceUrl}:${configUrl}`, async () => {
                    const csv = await ofetch<string, 'text'>(sourceUrl, { responseType: 'text' });
                    const config = await ofetch<TableConfig>(configUrl);
                    const rows = parseCsv(csv);
                    const headings = config.columns.map((column) => `<th>${escapeText(column.label)}</th>`).join('');
                    const body = rows.map((row) => `<tr>${config.columns.map((column) => `<td style="white-space: pre-line">${escapeText(row[column.key] ?? '—')}</td>`).join('')}</tr>`).join('');
                    const footnotes = config.footnotes.map((note) => `<p class="table-footnote">${escapeText(note)}</p>`).join('');
                    return `<figure class="source-table-container">${config.label ? `<p>${escapeText(config.label)}</p>` : ''}<table class="source-table"><caption>${escapeText(config.title)}</caption><thead><tr>${headings}</tr></thead><tbody>${body}</tbody></table>${footnotes}</figure>`;
                });
                $(table).replaceWith(rendered);
            } catch (error) {
                if (!(error instanceof FetchError)) {
                    throw error;
                }
            }
        },
        { concurrency: 1 }
    );
    return `<figure class="embedded-content">${$.html()}${embed.caption ? `<figcaption>${embed.caption}</figcaption>` : ''}</figure>`;
}
async function renderBlock(item): Promise<string> {
    if (item.type === 'embeddedcode') {
        const blocks = await pMap(item.content, renderEmbeddedCode, { concurrency: 1 });
        return blocks.join('<br>');
    }
    return format(item.type, item.content);
}
function format(type, content) {
    let block = '';
    if (content !== '') {
        switch (type) {
            case 'image':
            case 'slideshow':
                block = content.map((image) => renderImage({ image: image.desktop.url, description: image.description, caption: image.description })).join('<br>');
                break;
            case 'annotation':
                block = content
                    .map((value) =>
                        value.replaceAll(/<!--__ANNOTATION__=(.*?)--><!--.*?-->/gs, (_, payload) => {
                            const annotation = JSON.parse(payload);
                            return `<details class="annotation"><summary>${annotation.text}</summary><div class="annotation-content">${annotation.annotation}</div></details>`;
                        })
                    )
                    .join('<br>');
                break;
            case 'blockquote':
                block = `<blockquote>${content}</blockquote>`;
                break;
            case 'header-one':
                block = `<h1>${content}</h1>`;
                break;
            case 'header-two':
                block = `<h2>${content}</h2>`;
                break;
            case 'ordered-list-item':
                block = `<ol>${content.map((item) => `<li>${item}</li>`).join('')}</ol>`;
                break;
            case 'infobox': {
                const box = content[0];
                block = `<h2>${box.title}</h2>${box.body}`;
                break;
            }
            case 'youtube': {
                const video = content[0].youtubeId;
                const id = video.split('?', 1)[0];
                block = renderYoutube(true, id);
                break;
            }
            case 'quoteby': {
                const quote = content[0];
                block = `<blockquote>${quote.quote}</blockquote><p>${quote.quoteBy}</p>`;
                break;
            }
            default:
                block = `${content}<br>`;
        }
    }
    return block;
}
async function fetch(slug: string): Promise<Pick<DataItem, 'author' | 'description'>> {
    const url = `https://go-api.twreporter.org/v2/posts/${slug}?full=true`;
    const post = await cache.tryGet(`twreporter:post:${slug}`, async () => {
        const response = await ofetch(url);
        return response.data;
    });
    const authors = [...new Set([...(post.writers ?? []), ...(post.photographers ?? [])].map((author) => author.name))];
    // Prioritize hero_image, but fall back to og_image if it's missing
    const imageSource = post.hero_image ?? post.og_image;
    const bannerImage = imageSource?.resized_targets.desktop.url;
    const caption = post.leading_image_description;
    const bannerDescription = imageSource?.description ?? '';
    const brief = (post.brief?.api_data ?? [])
        .map((item) => format(item.type, item.content))
        .filter(Boolean)
        .join('<br>');
    // Only render the banner if we successfully found an image URL
    const banner = imageSource ? renderImage({ image: bannerImage, description: bannerDescription, caption }) : '';
    const text = (await pMap(post.content.api_data, renderBlock, { concurrency: 1 })).filter(Boolean).join('<br>');
    const contents = [banner, brief, text].filter(Boolean).join('<br><br>');
    return {
        author: authors.length > 0 ? authors.join('，') : undefined,
        description: contents,
    };
}
interface ArticleSummary {
    title: string;
    slug: string;
    published_date: string;
    category_set: Array<{
        category: {
            name: string;
        };
        subcategory?: {
            name: string;
        };
    }>;
    tags: Array<{
        name: string;
    }>;
}
export async function getArticleItem(item: ArticleSummary): Promise<DataItem> {
    const detail = await fetch(item.slug);
    const link = `https://www.twreporter.org/a/${item.slug}`;
    return {
        title: item.title,
        link,
        guid: link,
        pubDate: parseDate(item.published_date),
        category: [...new Set([...item.category_set.flatMap((entry) => [entry.category.name, entry.subcategory?.name]), ...item.tags.map((tag) => tag.name)].filter((name) => name !== undefined))],
        author: detail.author,
        description: detail.description,
    };
}

function isOneOf<const T>(value: unknown, values: readonly T[]): value is T {
    const candidates: readonly unknown[] = values;
    return candidates.includes(value);
}
