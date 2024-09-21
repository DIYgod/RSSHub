import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';

function jsonGet(obj, attr) {
    if (typeof attr !== 'string') {
        return obj;
    }
    // a.b.c
    // a.b[0].c => a.b.0.c
    for (const key of attr.split('.')) {
        obj = obj[key];
    }
    return obj;
}

export const route: Route = {
    path: '/transform/json/:url/:routeParams',
    categories: ['other'],
    example: '/rsshub/transform/json/https%3A%2F%2Fapi.github.com%2Frepos%2Fginuerzh%2Fgost%2Freleases/title=Gost%20releases&itemTitle=tag_name&itemLink=html_url&itemDesc=body',
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
    name: 'Transformation - JSON',
    maintainers: ['ttttmr'],
    handler,
    description: `Specify options (in the format of query string) in parameter \`routeParams\` parameter to extract data from JSON.

| Key           | Meaning                                  | Accepted Values | Default                                    |
| ------------- | ---------------------------------------- | --------------- | ------------------------------------------ |
| \`title\`       | The title of the RSS                     | \`string\`        | Extracted from home page of current domain |
| \`item\`        | The JSON Path as \`item\` element          | \`string\`        | Entire JSON response                       |
| \`itemTitle\`   | The JSON Path as \`title\` in \`item\`       | \`string\`        | None                                       |
| \`itemLink\`    | The JSON Path as \`link\` in \`item\`        | \`string\`        | None                                       |
| \`itemDesc\`    | The JSON Path as \`description\` in \`item\` | \`string\`        | None                                       |
| \`itemPubDate\` | The JSON Path as \`pubDate\` in \`item\`     | \`string\`        | None                                       |

:::tip
JSON Path only supports format like \`a.b.c\`. if you need to access arrays, like \`a[0].b\`, you can write it as \`a.0.b\`.
:::

  Parameters parsing in the above example:

  | Parameter     | Value                                                                    |
  | ------------- | ------------------------------------------------------------------------ |
  | \`url\`         | \`https://api.github.com/repos/ginuerzh/gost/releases\`                    |
  | \`routeParams\` | \`title=Gost releases&itemTitle=tag_name&itemLink=html_url&itemDesc=body\` |

  Parsing of \`routeParams\` parameter:

  | Parameter   | Value           |
  | ----------- | --------------- |
  | \`title\`     | \`Gost releases\` |
  | \`itemTitle\` | \`tag_name\`      |
  | \`itemLink\`  | \`html_url\`      |
  | \`itemDesc\`  | \`body\`          |`,
};

async function handler(ctx) {
    if (!config.feature.allow_user_supply_unsafe_domain) {
        throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }
    const url = ctx.req.param('url');
    const response = await got({
        method: 'get',
        url,
    });

    const routeParams = new URLSearchParams(ctx.req.param('routeParams'));
    let rssTitle = routeParams.get('title');
    if (!rssTitle) {
        const resp = await got({
            method: 'get',
            url: new URL(url).origin,
        });
        const $ = load(resp.data);
        rssTitle = $('title').text();
    }

    const items = jsonGet(response.data, routeParams.get('item')).map((item) => {
        let link = jsonGet(item, routeParams.get('itemLink')).trim();
        // 补全绝对链接
        if (link && !link.startsWith('http')) {
            link = `${new URL(url).origin}${link}`;
        }
        return {
            title: jsonGet(item, routeParams.get('itemTitle')),
            link,
            description: routeParams.get('itemDesc') ? jsonGet(item, routeParams.get('itemDesc')) : '',
            pubDate: routeParams.get('itemPubDate') ? jsonGet(item, routeParams.get('itemPubDate')) : '',
        };
    });

    return {
        title: rssTitle,
        link: url,
        description: `Proxy ${url}`,
        item: items,
    };
}
