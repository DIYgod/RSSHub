import { type Cheerio, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';
import { escapeUTF8 } from 'entities/escape';
import pMap from 'p-map';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

const rootUrl = 'https://kxx.moe';

function getItemLink(href: string | undefined, currentUrl: string): string | undefined {
    if (!href) {
        return;
    }
    try {
        const link = new URL(href, currentUrl);
        if (link.origin === rootUrl && !link.username && !link.password) {
            return link.href;
        }
    } catch {
        return;
    }
}

async function getPage(url: string, cookie: string | undefined, redirects = 0): Promise<string> {
    const target = new URL(url);
    if (target.origin !== rootUrl || target.username || target.password) {
        throw new Error('Kmoe content must be requested from https://kxx.moe.');
    }

    const response = await ofetch.raw<string, 'text'>(target.href, {
        headers: cookie ? { cookie } : undefined,
        redirect: 'manual',
        responseType: 'text',
    });
    if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        const nextUrl = location ? new URL(location, target) : undefined;
        if (!nextUrl || nextUrl.origin !== rootUrl || nextUrl.username || nextUrl.password) {
            throw new Error('Kmoe redirected outside https://kxx.moe; the configured Cookie was not forwarded.');
        }
        if (nextUrl.pathname === '/login.php') {
            throw new ConfigNotFoundError('This Kmoe category requires a valid MOX_COOKIE from https://kxx.moe.');
        }
        if (redirects >= 3) {
            throw new Error('Kmoe returned too many redirects.');
        }
        return getPage(nextUrl.href, cookie, redirects + 1);
    }

    return response._data ?? '';
}

function copyElements<T extends AnyNode>(selection: Cheerio<T>): Cheerio<T> {
    const copy = selection.map((_, element) => cloneNode(element, true));
    const root = new Document(copy.toArray());
    copy.each((_, element) => {
        element.parent = root;
    });
    return copy;
}

export const route: Route = {
    path: '/:category?',
    categories: ['anime'],
    example: '/mox',
    parameters: { category: '分类，可在对应分类页 URL 中找到' },
    features: {
        requireConfig: [
            {
                name: 'MOX_COOKIE',
                optional: true,
                description: 'Kmoe（kxx.moe）登录后的 Cookie，可从该站浏览器开发者工具的 Network 请求中获取。原 mox.moe 现跳转至该站；Cookie 仅发送到 kxx.moe。',
            },
        ],
        antiCrawler: true,
    },
    radar: [
        {
            source: ['kxx.moe/l/:category', 'kxx.moe/', 'mox.moe/l/:category', 'mox.moe/'],
        },
    ],
    name: '首頁',
    maintainers: ['nczitzk'],
    handler,
    description: `::: tip
在首页将分类参数选择确定后跳转到的分类页面 URL 中，\`/l/\` 后的字段即为分类参数。

如 [科幻 + 日語 + 日本 + 長篇 + 完結 + 最近更新](https://kxx.moe/l/CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL) 的 URL 为 [https://kxx.moe/l/CAT%2A 科幻，日本，完結，lastupdate,jpn,l,BL](https://kxx.moe/l/CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL)，此时 \`/l/\` 后的字段为 \`CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL\`。最终获得路由为 [\`/mox/CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL\`](https://rsshub.app/mox/CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL)
:::

::: warning
原 mox.moe 现跳转至 kxx.moe。未配置 \`MOX_COOKIE\` 时只获取首页漫画标题和封面，不请求详情；部分分类需要登录。配置该站有效登录 Cookie 后才获取详情，Cookie 不会随跳转发送到其他站点。
:::`,
};

function getDescription(content: string): string {
    const description = content.match(/document\.getElementById\("div_desc_content"\)\.innerHTML\s*=\s*("(?:\\.|[^"\\])*")\s*;/s)?.[1];
    return description ? JSON.parse(description) : '';
}

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '';

    const currentUrl = `${rootUrl}${category ? `/l/${category}` : ''}`;

    const cookie = config.mox.cookie;
    const page = await getPage(currentUrl, cookie);
    const $ = load(page);

    let items: DataItem[] = $('.listbg td')
        .toArray()
        .map((item) => {
            const lastItem = $(item).find('a').last();

            const link = getItemLink(lastItem.attr('href'), currentUrl);
            const guid = link ? new URL(link).pathname.split('/').pop() : undefined;

            const cover = $(item)
                .find('a div div')
                .attr('style')
                ?.match(/background:url\((.*?)\)/)?.[1];

            return {
                title: lastItem.text(),
                description: cover ? `<img src="${cover}">` : undefined,
                link,
                guid,
            };
        })
        .filter((i) => i.guid);

    if (!items.length) {
        items = $('script')
            .toArray()
            .flatMap((script) =>
                Array.from(
                    $(script)
                        .text()
                        .matchAll(/disp_divinfo\(\s*"div_info_"\s*\+\s*"\d+",([\s\S]*?)\);/g),
                    (match) => {
                        const values = Array.from(match[1].matchAll(/"(?:\\.|[^"\\])*"/g), (value) => JSON.parse(value[0]));
                        const link = getItemLink(values[0], currentUrl);
                        return link
                            ? {
                                  title: values[8],
                                  author: values[9] || undefined,
                                  link,
                                  guid: new URL(link).pathname.split('/').pop(),
                                  description: values[1] ? `<img src="${escapeUTF8(values[1])}">` : undefined,
                              }
                            : undefined;
                    }
                )
            )
            .filter((item) => item !== undefined);
    }

    if (cookie) {
        items = await pMap(
            items,
            async (item) => {
                const details = await cache.tryGet(`${item.link}:article`, async () => {
                    const detailPage = await getPage(item.link!, cookie);
                    const content = load(detailPage);

                    const author = content('.author .text_bglight font a')
                        .toArray()
                        .map((i) => content(i).text())
                        .filter(Boolean)
                        .join('、');

                    const categoryBlock = copyElements(content('.author .text_bglight').filter((_, element) => content(element).text().trimStart().startsWith('分類：')));
                    categoryBlock.find('.filesize').remove();
                    const category = categoryBlock
                        .children('font')
                        .toArray()
                        .map((element) => content(element).text().trim())
                        .filter(Boolean);
                    const cover = content('.img_book').attr('src');
                    const desc = getDescription(detailPage);
                    const description = `${cover ? `<img src="${escapeUTF8(cover)}"><br>` : ''}${desc}`;

                    return { author, description, category };
                });
                return { ...item, ...details, description: details.description || item.description };
            },
            { concurrency: 3 }
        );
    }

    return {
        title: 'Kmoe',
        link: currentUrl,
        item: items,
    };
}
