import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/changelog',
    categories: ['programming'],
    example: '/vercel/changelog',
    parameters: {},
    radar: [
        {
            source: ['vercel.com/changelog', 'vercel.com'],
        },
    ],
    name: 'Changelog',
    maintainers: ['DIYgod'],
    handler,
    url: 'vercel.com/changelog',
};

function findPosts(data: any): any[] {
    const posts: any[] = [];

    if (!data) {
        return posts;
    }

    if (Array.isArray(data)) {
        for (const item of data) {
            posts.push(...findPosts(item));
        }
    } else if (typeof data === 'object') {
        if (data.slug && data.title && data.publishedAt) {
            posts.push(data);
        }
        for (const key in data) {
            posts.push(...findPosts(data[key]));
        }
    }

    return posts;
}

function findContent(data: any): any[] | null {
    if (!data) {
        return null;
    }

    if (Array.isArray(data)) {
        for (const item of data) {
            const result = findContent(item);
            if (result) {
                return result;
            }
        }
    } else if (typeof data === 'object') {
        if (data.content && Array.isArray(data.content)) {
            return data.content;
        }
        for (const key in data) {
            const result = findContent(data[key]);
            if (result) {
                return result;
            }
        }
    }

    return null;
}

function renderContent(content: any[]): string {
    let html = '';
    for (const node of content) {
        if (typeof node === 'string') {
            html += node;
        } else if (node?.type) {
            switch (node.type) {
                case 'p':
                    html += `<p>${renderContent(node.children || [])}</p>`;
                    break;
                case 'h1':
                case 'h2':
                case 'h3':
                case 'h4':
                case 'h5':
                case 'h6':
                    html += `<${node.type}>${renderContent(node.children || [])}</${node.type}>`;
                    break;
                case 'ul':
                    html += `<ul>${renderContent(node.children || [])}</ul>`;
                    break;
                case 'ol':
                    html += `<ol>${renderContent(node.children || [])}</ol>`;
                    break;
                case 'li':
                    html += `<li>${renderContent(node.children || [])}</li>`;
                    break;
                case 'a':
                    html += `<a href="${node.href || '#'}">${renderContent(node.children || [])}</a>`;
                    break;
                case 'strong':
                    html += `<strong>${renderContent(node.children || [])}</strong>`;
                    break;
                case 'em':
                    html += `<em>${renderContent(node.children || [])}</em>`;
                    break;
                case 'code':
                    html += `<code>${renderContent(node.children || [])}</code>`;
                    break;
                case 'pre':
                    html += `<pre><code>${renderContent(node.children || [])}</code></pre>`;
                    break;
                case 'img':
                    html += `<img src="${node.src || ''}" alt="${node.alt || ''}" />`;
                    break;
                case 'blockquote':
                    html += `<blockquote>${renderContent(node.children || [])}</blockquote>`;
                    break;
                case 'br':
                    html += '<br />';
                    break;
                default:
                    if (node.children) {
                        html += renderContent(node.children);
                    }
            }
        }
    }
    return html;
}

async function handler() {
    const baseUrl = 'https://vercel.com';
    const changelogUrl = `${baseUrl}/changelog`;
    const response = await ofetch(changelogUrl);
    const $ = load(response);

    const limit = 10;

    const selfNextFPush = /self\.__next_f\.push\((.+)\)/;
    const textList: string[] = [];
    for (const e of $('script').toArray()) {
        const $e = $(e);
        const text = $e.text();
        const match = selfNextFPush.exec(text);
        if (match) {
            let data;
            try {
                data = JSON.parse(match[1]);
                if (Array.isArray(data) && data.length === 2 && data[0] === 1) {
                    textList.push(data[1]);
                }
            } catch {
                // ignore
            }
        }
    }

    const partRegex = /^([0-9a-zA-Z]+):([0-9a-zA-Z]+)?(\[.*)$/;
    const fd = textList
        .join('')
        .split('\n')
        .map((d) => {
            const matchPart = partRegex.exec(d);
            if (matchPart) {
                try {
                    return {
                        id: matchPart[1],
                        tag: matchPart[2],
                        data: JSON.parse(matchPart[3]),
                    };
                } catch {
                    return {
                        id: '',
                        tag: '',
                        data: d,
                    };
                }
            }
            return {
                id: '',
                tag: '',
                data: d,
            };
        });

    const allPosts: any[] = [];
    for (const item of fd) {
        allPosts.push(...findPosts(item.data));
    }

    const uniquePosts = allPosts.filter((post, index, self) => index === self.findIndex((p) => p.slug === post.slug));

    const list: DataItem[] = uniquePosts
        .filter((post) => post.slug && !post.slug.includes('/blog/'))
        .slice(0, limit)
        .map((post) => {
            const title = post.title;
            const href = `/changelog/${post.slug}`;
            const pubDate = post.publishedAt;
            const link = href.startsWith('http') ? href : `${baseUrl}${href}`;
            return {
                title,
                link,
                pubDate: parseDate(pubDate),
            };
        });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);

                const textList: string[] = [];
                for (const e of $('script').toArray()) {
                    const $e = $(e);
                    const text = $e.text();
                    const match = selfNextFPush.exec(text);
                    if (match) {
                        let data;
                        try {
                            data = JSON.parse(match[1]);
                            if (Array.isArray(data) && data.length === 2 && data[0] === 1) {
                                textList.push(data[1]);
                            }
                        } catch {
                            // ignore
                        }
                    }
                }

                const fd = textList
                    .join('')
                    .split('\n')
                    .map((d) => {
                        const matchPart = partRegex.exec(d);
                        if (matchPart) {
                            try {
                                return {
                                    id: matchPart[1],
                                    tag: matchPart[2],
                                    data: JSON.parse(matchPart[3]),
                                };
                            } catch {
                                return {
                                    id: '',
                                    tag: '',
                                    data: d,
                                };
                            }
                        }
                        return {
                            id: '',
                            tag: '',
                            data: d,
                        };
                    });

                let contentHtml = '';
                for (const item of fd) {
                    const content = findContent(item.data);
                    if (content) {
                        contentHtml = renderContent(content);
                        break;
                    }
                }

                item.description = contentHtml || undefined;

                return item;
            }),
        { concurrency: 5 }
    );

    return {
        title: 'Vercel Changelog',
        link: changelogUrl,
        description: 'Latest updates from Vercel Changelog',
        item: items,
    };
}
