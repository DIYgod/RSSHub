import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx) => {
    const { category = 'index/tzgg' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const rootUrl = 'https://www.hubu.edu.cn';
    const currentUrl = new URL(`${category}.htm`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang');

    let items = $('div.list ul li')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('a').text(),
                pubDate: parseDate(item.find('span').text()),
                link: new URL(item.find('a').prop('href'), rootUrl).href,
                language,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const { data: detailResponse } = await got(item.link);

                    const $$ = load(detailResponse);

                    const title = $$('div.con-tit h4').text();

                    if (!title) {
                        return item;
                    }

                    const description = $$('div.v_news_content').html();

                    item.title = title;
                    item.description = description;
                    item.category = $$('META[Name="keywords"]')
                        .toArray()
                        .map((c) => $$(c).text());
                    item.content = {
                        html: description,
                        text: $$('div.v_news_content').text(),
                    };
                    item.language = language;
                } catch {
                    // no-empty
                }

                return item;
            })
        )
    );

    const title = $('title').text();
    const image = new URL($('div.logo a img').prop('src'), rootUrl).href;

    return {
        title,
        description: $('META[Name="keywords"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: title.split(/-/).pop(),
        language,
    };
};

export const route: Route = {
    path: '/www/:category{.+}?',
    name: '主页',
    url: 'hubu.edu.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/hubu/www/index/tzgg',
    parameters: { category: '分类，可在对应分类页 URL 中找到，默认为[通知公告](https://www.hubu.edu.cn/index/tzgg.htm)' },
    description: `:::tip
  若订阅 [通知公告](https://www.hubu.edu.cn/index/tzgg.htm)，网址为 \`https://www.hubu.edu.cn/index/tzgg.htm\`。截取 \`https://www.hubu.edu.cn/\` 到末尾 \`.htm\` 的部分 \`index/tzgg\` 作为参数填入，此时路由为 [\`/hubu/www/index/tzgg\`](https://rsshub.app/hubu/www/index/tzgg)。
  :::

  | 通知公告   | 学术预告   |
  | ---------- | ---------- |
  | index/tzgg | index/xsyg |
  `,
    categories: ['university'],

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
            title: '通知公告',
            source: ['hubu.edu.cn/index/tzgg.htm'],
            target: '/www/index/tzgg',
        },
        {
            title: '学术预告',
            source: ['hubu.edu.cn/index/xsyg.htm'],
            target: '/www/index/xsyg',
        },
    ],
};
