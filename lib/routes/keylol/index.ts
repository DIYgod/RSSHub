import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';
import queryString from 'query-string';

const threadIdRegex = /(\d+)-\d+-\d+/;

export const route: Route = {
    path: '/:path',
    name: '论坛',
    parameters: { path: '路径，默认为热点聚焦' },
    categories: ['game'],
    example: '/keylol/f161-1',
    radar: [
        {
            source: ['keylol.com/:path'],
            target: (params, url) => url.replaceAll('forum.php?', ''),
        },
    ],
    maintainers: ['nczitzk', 'kennyfong19931'],
    handler,
    description: `:::tip
  若订阅 [热点聚焦](https://keylol.com/f161-1)，网址为 \`https://keylol.com/f161-1\`。截取 \`https://keylol.com/\` 到末尾的部分 \`f161-1\` 作为参数，此时路由为 [\`/keylol/f161-1\`](https://rsshub.app/keylol/f161-1)。
  若订阅子分类 [试玩免费 - 热点聚焦](https://keylol.com/forum.php?mod=forumdisplay&fid=161&filter=typeid&typeid=459)，网址为 \`https://keylol.com/forum.php?mod=forumdisplay&fid=161&filter=typeid&typeid=459\`。提取\`fid\`及\`typeid\` 作为参数，此时路由为 [\`/keylol/fid=161&typeid=459\`](https://rsshub.app/keylol/fid=161&typeid=459)。注意不要包括\`filter\`，会调用[全局的内容过滤](https://docs.rsshub.app/guide/parameters#filtering)。
  :::`,
};

async function handler(ctx) {
    let queryParams = {};
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
            threadId: item.link.match(threadIdRegex)[1],
            author: item.author,
        }));
    } catch {
        authorNameMap = [];
    }

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const rootUrl = 'https://keylol.com';
    const currentUrl = queryString.stringifyUrl({ url: `${rootUrl}/forum.php`, query: queryParams });

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('tbody[id^="normalthread_"] a.xst')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: new URL(item.prop('href').split('&extra=')[0], rootUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const threadId = threadIdRegex.test(item.link) ? item.link.match(threadIdRegex)[1] : queryString.parseUrl(item.link).query.tid;
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                let descriptionList: any[] = [];
                const indexDiv = content('div#threadindex');
                if (indexDiv.length > 0) {
                    // post with page
                    const postId = content('div.t_fsz > script')
                        .text()
                        .match(/show_threadindex\((\d+),/)[1];
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

                item.description = descriptionList.join('<br/>');
                const authorName = authorNameMap.find((a) => a.threadId === threadId);
                item.author = authorName && authorName.length > 0 ? authorName[0].author : content('a.xw1').first().text();
                item.category = content('#keyloL_thread_tags a')
                    .toArray()
                    .map((c) => content(c).text());

                const pubDateEm = content('img.authicn').first().next();
                const pubDateText = pubDateEm.find('span').prop('title') ?? pubDateEm.text();
                const pubDateMatches = pubDateText.match(/(\d{4}(?:-\d{1,2}){2} (?:\d{2}:){2}\d{2})/) ?? undefined;
                if (pubDateMatches) {
                    item.pubDate = timezone(parseDate(pubDateMatches[1], 'YYYY-M-D HH:mm:ss'), +8);
                }

                const updatedMatches =
                    content('i.pstatus')
                        .text()
                        .match(/(\d{4}(?:-\d{1,2}){2} (?:\d{2}:){2}\d{2})/) ?? undefined;
                if (updatedMatches) {
                    item.updated = timezone(parseDate(updatedMatches[1], 'YYYY-M-D HH:mm:ss'), +8);
                }

                item.comments = content('div.subforum_right_title_left_down').text() ? Number.parseInt(content('div.subforum_right_title_left_down').text(), 10) : 0;

                return item;
            })
        )
    );

    const icon = $('link[rel="apple-touch-icon"]').prop('href');

    return {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh-cn',
        icon,
        logo: icon,
        subtitle: $('meta[name="application-name"]').prop('content'),
        author: $('meta[name="author"]').prop('content'),
    };
}

function getDescription($) {
    const descriptionEl = $('td.t_f');
    descriptionEl.find('div.rnd_ai_pr').remove(); // remove ad image
    return descriptionEl.html();
}

async function getPage(url, pageTitle) {
    const { data: detailResponse } = await got(url);

    const $ = load(detailResponse, { xmlMode: true });
    const content = $('root').text();
    return '<h3>' + pageTitle + '</h3>' + getDescription(load(content));
}
