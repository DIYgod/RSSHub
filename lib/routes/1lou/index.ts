import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.1lou.me';

export const handler = async (ctx) => {
    const { params } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;

    const queryString = Object.entries(ctx.req.query())
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

    const currentUrl = new URL(`${params && params.endsWith('.htm') ? params : `${params}.htm`}${queryString ? `?${queryString}` : ''}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang');

    let items = $('li.media.thread.tap:not(li.hidden-sm)')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const subjectEl = item.find('div.subject').children('a').first();

            return {
                title: subjectEl.text(),
                pubDate: timezone(parseDate(item.find('span.date').text()), +8),
                link: new URL(subjectEl.prop('href'), rootUrl).href,
                category: [
                    item.find('a.text-secondary').text().replaceAll('[]', ''),
                    ...item
                        .find('a.badge')
                        .toArray()
                        .map((c) => $(c).text()),
                ].filter(Boolean),
                author: item.find('a.username').text(),
                language,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const title = $$('h4.break-all').contents().last().text();

                if (title) {
                    const description = $$('div.message.break-all').html();
                    const image = new URL($$('img').first().prop('src'), rootUrl).href;

                    item.title = title;
                    item.description = description;
                    item.pubDate = timezone(parseDate($$('span.date').text()), +8);
                    item.category = $$('a.badge')
                        .toArray()
                        .map((c) => $$(c).text());
                    item.content = {
                        html: description,
                        text: $$('div.message.break-all').text(),
                    };
                    item.image = image;
                    item.banner = image;
                    item.language = language;

                    const torrents = $$('ul.attachlist li a');

                    if (torrents.length > 0) {
                        const torrent = torrents.first();

                        item.enclosure_url = new URL(torrent.prop('href'), rootUrl).href;
                        item.enclosure_type = 'application/x-bittorrent';
                        item.enclosure_title = torrent.text();
                    }
                }

                return item;
            })
        )
    );

    const author = 'BT 之家 1LOU 站';
    const image = new URL($('img.logo-2').prop('src'), rootUrl).href;

    return {
        title: `${$('title').text().split(/-/)[0]} - ${author}`,
        description: $('meta[name="description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author,
        language,
    };
};

export const route: Route = {
    path: '/:params{.+}?',
    name: '通用',
    url: '1lou.me',
    maintainers: ['falling', 'nczitzk'],
    handler,
    example: '/1lou/forum-2-1',
    parameters: { params: '路径参数，可以在对应页面的 URL 中找到' },
    description: `::: tip
  \`1lou.me/\` 后的内容填入 params 参数，以下是几个例子：

  若订阅 [大陆电视剧](https://www.1lou.me/forum-2-1.htm?tagids=0_97_0_0)，网址为 \`https://www.1lou.me/forum-2-1.htm?tagids=0_97_0_0\`。截取 \`https://www.1lou.me/\` 到末尾 \`.htm\` 的部分 \`forum-2-1\` 作为参数，并补充 \`tagids\`，此时路由为 [\`/1lou/forum-2-1?tagids=0_97_0_0\`](https://rsshub.app/1lou/forum-2-1?tagids=0_97_0_0)。
  
  若订阅 [最新发帖电视剧](https://www.1lou.me/forum-2-1.htm?orderby=tid&digest=0)，网址为 \`https://www.1lou.me/forum-2-1.htm?orderby=tid&digest=0\`。截取 \`https://www.1lou.me/\` 到末尾 \`.htm\` 的部分 \`forum-2-1\` 作为参数，并补充 \`orderby\`，此时路由为 [\`/1lou/forum-2-1?orderby=tid\`](https://rsshub.app/1lou/forum-2-1?orderby=tid)。
  
  若订阅 [搜素繁花主题贴](https://www.1lou.me/search-_E7_B9_81_E8_8A_B1-1.htm)，网址为 \`https://www.1lou.me/search-_E7_B9_81_E8_8A_B1-1.htm\`。截取 \`https://www.1lou.me/\` 到末尾 \`.htm\` 的部分 \`search-_E7_B9_81_E8_8A_B1-1\` 作为参数，此时路由为 [\`/1lou/search-_E7_B9_81_E8_8A_B1-1\`](https://rsshub.app/1lou/search-_E7_B9_81_E8_8A_B1-1)。
:::`,
    categories: ['multimedia'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['1lou.me/:params'],
            target: (_, url) => {
                url = new URL(url);

                return `/1lou${url.href.replace(rootUrl, '')}`;
            },
        },
    ],
};
