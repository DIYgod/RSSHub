import { DataItem, Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import sanitizeHtml from 'sanitize-html';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/transform/html/:url/:routeParams',
    categories: ['other'],
    example: '/rsshub/transform/html/https%3A%2F%2Fwechat2rss.xlab.app%2Fposts%2Flist%2F/item=div%5Bclass%3D%27post%2Dcontent%27%5D%20p%20a',
    parameters: { url: '`encodeURIComponent`ed URL address', routeParams: 'Transformation rules, requires URL encode' },
    features: {
        requireConfig: [
            {
                name: 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN',
                description: '',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Transformation - HTML',
    maintainers: ['ttttmr', 'hyoban'],
    description: `Pass URL and transformation rules to convert HTML/JSON into RSS.

Specify options (in the format of query string) in parameter \`routeParams\` parameter to extract data from HTML.

| Key                 | Meaning                                                                                                       | Accepted Values | Default                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------- | --------------- | ------------------------ |
| \`title\`           | The title of the RSS                                                                                          | \`string\`      | Extract from \`<title>\` |
| \`item\`            | The HTML elements as \`item\` using CSS selector                                                              | \`string\`      | html                     |
| \`itemTitle\`       | The HTML elements as \`title\` in \`item\` using CSS selector                                                 | \`string\`      | \`item\` element         |
| \`itemTitleAttr\`   | The attributes of \`title\` element as title                                                                  | \`string\`      | Element text             |
| \`itemLink\`        | The HTML elements as \`link\` in \`item\` using CSS selector                                                  | \`string\`      | \`item\` element         |
| \`itemLinkAttr\`    | The attributes of \`link\` element as link                                                                    | \`string\`      | \`href\`                 |
| \`itemDesc\`        | The HTML elements as \`descrption\` in \`item\` using CSS selector                                            | \`string\`      | \`item\` element         |
| \`itemDescAttr\`    | The attributes of \`descrption\` element as description                                                       | \`string\`      | Element html             |
| \`itemPubDate\`     | The HTML elements as \`pubDate\` in \`item\` using CSS selector                                               | \`string\`      | \`item\` element         |
| \`itemPubDateAttr\` | The attributes of \`pubDate\` element as pubDate                                                              | \`string\`      | Element html             |
| \`itemContent\`     | The HTML elements as \`description\` in \`item\` using CSS selector ( in \`itemLink\` page for full content ) | \`string\`      |                          |
| \`encoding\`        | The encoding of the HTML content                                                                              | \`string\`      | utf-8                    |

  Parameters parsing in the above example:

| Parameter     | Value                                     |
| ------------- | ----------------------------------------- |
| \`url\`         | \`https://wechat2rss.xlab.app/posts/list/\` |
| \`routeParams\` | \`item=div[class='post-content'] p a\`      |

  Parsing of \`routeParams\` parameter:

| Parameter | Value                           |
| --------- | ------------------------------- |
| \`item\`    | \`div[class='post-content'] p a\` |`,
    handler: async (ctx) => {
        if (!config.feature.allow_user_supply_unsafe_domain) {
            throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
        }
        const url = ctx.req.param('url');
        const response = await got({
            method: 'get',
            url,
            responseType: 'arrayBuffer',
        });

        const routeParams = new URLSearchParams(ctx.req.param('routeParams'));
        const encoding = routeParams.get('encoding') || 'utf-8';
        const decoder = new TextDecoder(encoding);

        const $ = load(decoder.decode(response.data));
        const rssTitle = routeParams.get('title') || $('title').text();
        const item = routeParams.get('item') || 'html';
        let items: DataItem[] = $(item)
            .toArray()
            .slice(0, 20)
            .map((item) => {
                try {
                    item = $(item);

                    const titleEle = routeParams.get('itemTitle') ? item.find(routeParams.get('itemTitle')) : item;
                    const title = routeParams.get('itemTitleAttr') ? titleEle.attr(routeParams.get('itemTitleAttr')) : titleEle.text();

                    let link;
                    const linkEle = routeParams.get('itemLink') ? item.find(routeParams.get('itemLink')) : item;
                    if (routeParams.get('itemLinkAttr')) {
                        link = linkEle.attr(routeParams.get('itemLinkAttr'));
                    } else {
                        link = linkEle.is('a') ? linkEle.attr('href') : linkEle.find('a').attr('href');
                    }
                    // 补全绝对链接或相对链接
                    link = link.trim();
                    if (link && !link.startsWith('http')) {
                        link = new URL(link, url).href;
                    }

                    const descEle = routeParams.get('itemDesc') ? item.find(routeParams.get('itemDesc')) : item;
                    const desc = routeParams.get('itemDescAttr') ? descEle.attr(routeParams.get('itemDescAttr')) : descEle.html();

                    const pubDateEle = routeParams.get('itemPubDate') ? item.find(routeParams.get('itemPubDate')) : item;
                    const pubDate = routeParams.get('itemPubDateAttr') ? pubDateEle.attr(routeParams.get('itemPubDateAttr')) : pubDateEle.html();

                    return {
                        title,
                        link,
                        description: desc,
                        pubDate,
                    };
                } catch {
                    return null;
                }
            })
            .filter((i) => !!i);

        const itemContentSelector = routeParams.get('itemContent');
        if (itemContentSelector) {
            items = await Promise.all(
                items.map((item) => {
                    if (!item.link) {
                        return item;
                    }

                    return cache.tryGet(`transform:${item.link}:${itemContentSelector}`, async () => {
                        const response = await got({
                            method: 'get',
                            url: item.link,
                            responseType: 'arrayBuffer',
                        });
                        if (!response || typeof response === 'string') {
                            return item;
                        }

                        const $ = load(decoder.decode(response.data));
                        const content = $(itemContentSelector).html();
                        if (!content) {
                            return item;
                        }

                        item.description = sanitizeHtml(content, { allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img'] });

                        return item;
                    });
                })
            );
        }

        return {
            title: rssTitle,
            link: url,
            description: `Proxy ${url}`,
            item: items,
        };
    },
};
