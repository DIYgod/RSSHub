import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/beijing/bjedu/gh/:urlPath?',
    categories: ['government'],
    example: '/gov/beijing/bjedu/gh',
    parameters: { urlPath: '路径，默认为 `zxtzgg`' },
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
            source: ['gh.bjedu.gov.cn/ghsite/:urlPath/index.html', 'gh.bjedu.gov.cn/ghsite/:urlPath'],
            target: '/beijing/bjedu/gh/:urlPath',
        },
    ],
    name: '通用',
    maintainers: ['TonyRL'],
    handler,
    description: `::: tip
  路径处填写对应页面 URL 中 \`https://gh.bjedu.cn/ghsite/\` 和 \`/index.html\` 之间的字段。下面是一个例子。

  若订阅 [通知公告](https://gh.bjedu.cn/ghsite/zxtzgg/index.html) 则将对应页面 URL \`https://gh.bjedu.cn/ghsite/zxtzgg/index.html\` 中 \`https://gh.bjedu.cn/ghsite/\` 和 \`/index.html\` 之间的字段 \`zxtzgg\` 作为路径填入。此时路由为 [\`/gov/beijing/bjedu/gh/zxtzgg\`](https://rsshub.app/gov/beijing/bjedu/gh/zxtzgg)
:::`,
};

async function handler(ctx) {
    const baseUrl = 'https://gh.bjedu.cn';
    const { urlPath = 'zxtzgg' } = ctx.req.param();

    const { data: response, url: link } = await got(`${baseUrl}/ghsite/${urlPath}/index.html`);
    const $ = load(response);

    const list = $('.content li a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text().trim(),
                link: item.attr('href').startsWith('http') ? item.attr('href').replace(/^http:/, 'https:') : new URL(item.attr('href'), link).href,
                pubDate: item.prev().length ? timezone(parseDate(item.prev().text().trim(), 'YYYY-MM-DD'), +8) : null,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (!item.link.endsWith('.html')) {
                    return item;
                }
                const { data: response } = await got(item.link);
                const $ = load(response);

                item.title = item.title.endsWith('...') ? $('.con-h h1').text().trim() : item.title;
                item.pubDate = timezone(parseDate($('.con-h span').eq(0).text().trim(), 'YYYY-MM-DD HH:mm:ss'), +8);
                item.author = $('.con-h span').eq(1).text().trim();
                item.description = $('.content_font').html();

                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        link,
        item: items,
    };
}
