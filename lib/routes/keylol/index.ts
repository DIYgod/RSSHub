import { type Cheerio, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';
import type { ParsedQuery } from 'query-string';
import queryString from 'query-string';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import parser from '@/utils/rss-parser';
import timezone from '@/utils/timezone';

function copyElements<T extends AnyNode>(selection: Cheerio<T>): Cheerio<T> {
    const copy = selection.map((_, element) => cloneNode(element, true));
    const root = new Document(copy.toArray());
    copy.each((_, element) => {
        element.parent = root;
    });
    return copy;
}

const parseSourceClock = (value: string): Date | undefined => {
    const match = value.match(/\d{4}(?:-\d{1,2}){2} \d{2}:\d{2}(?::\d{2})?/);
    const date = match ? parseDate(match[0], ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm', 'YYYY-M-D HH:mm:ss', 'YYYY-M-D HH:mm'], true) : undefined;
    return date && Number.isFinite(date.getTime()) ? timezone(date, 8) : undefined;
};

const threadIdRegex = /(\d+)-\d+-\d+/;
const header = {
    Cookie: config.keylol.cookie ?? undefined,
};

export const route: Route = {
    path: '/:path',
    name: '论坛',
    parameters: { path: '路径，默认为热点聚焦' },
    categories: ['game'],
    example: '/keylol/f161-1',
    features: {
        requireConfig: [
            {
                name: 'KEYLOL_COOKIE',
                optional: true,
                description: '配置后可抓取具有阅读权限的帖子內容',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['keylol.com/f161-1'],
            target: '/f161-1',
        },
    ],
    maintainers: ['nczitzk', 'kennyfong19931'],
    handler,
    description: `::: tip
若订阅 [热点聚焦](https://keylol.com/f161-1)，网址为 \`https://keylol.com/f161-1\`。截取 \`https://keylol.com/\` 到末尾的部分 \`f161-1\` 作为参数，此时路由为 [\`/keylol/f161-1\`](https://rsshub.app/keylol/f161-1)。
若订阅子分类 [试玩免费 - 热点聚焦](https://keylol.com/forum.php?mod=forumdisplay\\&fid=161\\&filter=typeid\\&typeid=459)，网址为 \`https://keylol.com/forum.php?mod=forumdisplay&fid=161&filter=typeid&typeid=459\`。提取\`fid\`及\`typeid\` 作为参数，此时路由为 [\`/keylol/fid=161&typeid=459\`](https://rsshub.app/keylol/fid=161\\&typeid=459)。注意不要包括\`filter\`，会调用[全局的内容过滤](https://docs.rsshub.app/guide/parameters#filtering)。
:::`,
};

async function handler(ctx) {
    let queryParams: ParsedQuery = {};
    const path = ctx.req.param('path');
    if (/^f\d+-\d+/.test(path)) {
        queryParams.fid = path.match(/^f(\d+)-\d+/)[1];
    } else {
        queryParams = queryString.parse(path);
    }
    queryParams.mod = 'forumdisplay';
    queryParams.orderby = 'dateline';
    queryParams.filter = 'author';

    // get real author name from official rss feed
    let authorNameMap;
    try {
        const feed = await parser.parseURL(`https://keylol.com/forum.php?mod=rss&fid=${queryParams.fid}&auth=0`);
        authorNameMap = feed.items.map((item) => ({
            threadId: item.link!.match(threadIdRegex)![1],
            author: item.author,
        }));
    } catch {
        authorNameMap = [];
    }

    const limit = getRouteLimit(ctx, 30);

    const rootUrl = 'https://keylol.com';
    const currentUrl = queryString.stringifyUrl({ url: `${rootUrl}/forum.php`, query: queryParams });

    const { data: response } = await got({
        method: 'get',
        url: currentUrl,
        headers: header,
    });

    const $ = load(response);

    let items = $('tbody[id^="normalthread_"]')
        .slice(0, limit)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            const sourceDate = $item.find('td.by-author em').text().replaceAll(' 发表', '');
            const date = sourceDate ? parseRelativeDate(sourceDate) : undefined;
            return {
                title: $item.find('a.xst').text(),
                link: new URL($item.find(' a.xst').prop('href')!.split('&extra=', 1)[0], rootUrl).href,
                author: $item.find('td.by-author cite').text(),
                pubDate: date && Number.isFinite(date.getTime()) ? date : undefined,
            };
        });

    items = await Promise.all(
        items.map(async (item) => {
            const threadId = threadIdRegex.test(item.link!) ? item.link!.match(threadIdRegex)![1] : queryString.parseUrl(item.link!).query.tid;
            const details = await cache.tryGet(`keylol:detail:${item.link}`, async () => {
                const details: Partial<DataItem> = {};
                const { data: detailResponse } = await got({
                    method: 'get',
                    url: item.link,
                    headers: header,
                });

                const content = load(detailResponse);

                let descriptionList: string[] = [];
                const indexDiv = content('div#threadindex');
                if (indexDiv.length > 0) {
                    // post with page
                    const postId = content('div.t_fsz > script')
                        .text()
                        .match(/show_threadindex\((\d+),/)![1];
                    descriptionList = await Promise.all(
                        indexDiv.find('a').map((i, a) => {
                            const pageTitle = $(a).text();
                            const page = $(a).attr('page');
                            return getPage(
                                `${rootUrl}/forum.php?${queryString.stringify({
                                    mod: 'viewthread',
                                    tid: threadId,
                                    viewpid: postId,
                                    cp: page,
                                })}`,
                                pageTitle
                            );
                        })
                    );
                } else {
                    // normal post
                    descriptionList.push(getDescription(content));
                }

                details.description = descriptionList.join('<br/>');
                details.category = content('#keyloL_thread_tags a')
                    .toArray()
                    .map((c) => content(c).text());

                const pubDateEm = content('img.authicn').next();
                const pubDateText = pubDateEm.find('span').prop('title') ?? pubDateEm.text();
                details.pubDate = parseSourceClock(pubDateText);
                details.updated = parseSourceClock(content('i.pstatus').text());

                details.comments = content('div.subforum_right_title_left_down').text() ? Number(content('div.subforum_right_title_left_down').text()) : 0;

                return details;
            });
            const realAuthorName = authorNameMap.find((a) => a.threadId === threadId);
            return { ...item, ...details, pubDate: details.pubDate ?? item.pubDate, author: realAuthorName?.author ?? item.author };
        })
    );

    const icon = $('link[rel="apple-touch-icon"]').prop('href');

    return {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh-CN' as const,
        icon,
        logo: icon,
        subtitle: $('meta[name="application-name"]').prop('content'),
        author: $('meta[name="author"]').prop('content'),
    };
}

function getDescription($) {
    const descriptionEl = copyElements($('td.t_f'));
    descriptionEl.find('i.pstatus').remove();
    descriptionEl.find('div.rnd_ai_pr').remove(); // remove ad image

    // handle lazyload image
    descriptionEl.find('img').each((_, img) => {
        const $img = $(img);
        if (!($img.attr('src')?.endsWith('none.gif') && $img.attr('file'))) {
            return;
        }

        $img.attr('src', $img.attr('file'));
        $img.removeAttr('file');
        $img.removeAttr('zoomfile');
    });

    return descriptionEl.length > 0 ? descriptionEl.html() : $('div.alert_info').html();
}

async function getPage(url, pageTitle) {
    const { data: detailResponse } = await got({
        method: 'get',
        url,
        headers: header,
    });

    const $ = load(detailResponse, { xmlMode: true });
    const content = $('root').text();
    return '<h3>' + pageTitle + '</h3>' + getDescription(load(content));
}
