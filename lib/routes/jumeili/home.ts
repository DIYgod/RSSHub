import { config } from '@/config';
import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';

export const route: Route = {
    path: '/home/:column?',
    categories: ['new-media'],
    example: '/jumeili/home',
    parameters: {
        column: '内容栏, 默认为 `0`（最新）。其他可选：`-1`（头条）、`62073`（精选）、`13243`（年度大会）等。详细可以在开发者工具 Network 面板中找到，如：`https://www.jumeili.cn/ws/AjaxService.ashx?act=index_article&page=1&pageSize=20&column=0`最后的 `column=0` 即为`column` 参数',
    },
    features: {
        requireConfig: [
            {
                name: 'JUMEILI_COOKIE',
                optional: true,
                description: '用户登录后，可以从浏览器开发者工具 Network 面板中的 jumeili 页面请求获取 Cookie，如：`ASP.NET_SessionId=xxx;jmlweb4=xxx`全部复制并设置为环境变量',
            },
        ],
        antiCrawler: true,
    },
    radar: [
        {
            source: ['www.jumeili.cn/', 'jumeili.cn/'],
            target: '/home/:column?',
        },
    ],
    name: '首页资讯',
    maintainers: ['kjasn'],
    handler,
    description: `::: Warning
未登录用户无法获取完整文章内容，只能看到预览内容。想要获取完整文章内容，需要设置\`JUMEILI_COOKIE\`环境变量。
:::`,
};

async function handler(ctx) {
    const baseUrl = 'https://www.jumeili.cn';
    const column = ctx.req.param('column') ?? 0;

    const link = `${baseUrl}/ws/AjaxService.ashx?act=index_article&page=1&pageSize=20&column=${column}`;

    const cookie = config.jumeili.cookie;
    const response = await ofetch(link, {
        headers: {
            referer: baseUrl,
            'user-agent': config.trueUA,
            accept: 'application/json, text/javascript, */*; q=0.01',
            cookie,
        },
    });

    // parse 两次
    let data = JSON.parse(response);
    if (data && typeof data === 'string') {
        data = JSON.parse(data);
    }

    let items = data.items.map((item) => ({
        title: item.title,
        link: baseUrl + item.url,
        description: item.subject, // 预览内容
        image: item.imgurl,
        author: item.author,
        // pubDate: parseDate(item.pubTime),
    }));

    if (cookie) {
        items = await Promise.all(
            items.map((item) =>
                cache.tryGet(item.link, async () => {
                    const article = await ofetch(item.link, {
                        headers: {
                            referer: baseUrl,
                            'user-agent': config.trueUA,
                            accept: 'application/json, text/javascript, */*; q=0.01',
                            cookie,
                        },
                    });
                    const $ = load(article);

                    const content = $('#Cnt-Main-Article-JML').html();
                    if (content) {
                        item.description = content; // 替换为完整正文
                    }

                    return item;
                })
            )
        );
    }

    return {
        title: '聚美丽 - 首页资讯',
        item: items,
    };
}
