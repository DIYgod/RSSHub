import { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { config } from '@/config';

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
                description: `注册用户登录后的 Cookie, 可以从浏览器开发者工具Network面板中的mox页面请求获取，Cookie内容形如VOLSKEY=xxxxxx; VLIBSID=xxxxxx; VOLSESS=xxxxxx`,
            },
        ],
        antiCrawler: true,
    },
    radar: [
        {
            source: ['mox.moe/l/:category', 'mox.moe/'],
        },
    ],
    name: '首頁',
    maintainers: ['nczitzk'],
    handler,
    description: `::: tip
  在首页将分类参数选择确定后跳转到的分类页面 URL 中，\`/l/\` 后的字段即为分类参数。

  如 [科幻 + 日語 + 日本 + 長篇 + 完結 + 最近更新](https://mox.moe/l/CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL) 的 URL 为 [https://mox.moe/l/CAT%2A 科幻，日本，完結，lastupdate,jpn,l,BL](https://mox.moe/l/CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL)，此时 \`/l/\` 后的字段为 \`CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL\`。最终获得路由为 [\`/mox/CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL\`](https://rsshub.app/mox/CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL)
:::

::: warning
  由于 mox.moe 对非登录用户屏蔽了部分漫画详情内容的获取，且极易触发反爬机制，导致访问ip被重定向至google.com，因此在未配置\`MOX_COOKIE\`参数的情况下路由只会返回漫画标题和封面，不会对详情内容进行抓取。
:::`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '';

    const rootUrl = 'https://mox.moe';
    const currentUrl = `${rootUrl}${category ? `/l/${category}` : ''}`;

    const cookie = config.mox.cookie;

    const response = await got({
        method: 'get',
        url: currentUrl,
        headers: {
            cookie,
        },
    });

    const $ = load(response.data);

    let items: DataItem[] = $('.listbg td')
        .toArray()
        .map((item) => {
            const lastItem = $(item).find('a').last();

            const guid = lastItem.attr('href')?.split('/').pop();

            const cover = $(item)
                .find('a div div')
                .attr('style')
                ?.match(/background:url\((.*?)\)/)?.[1];

            return {
                title: lastItem.text(),
                description: cover ? `<img src="${cover}">` : undefined,
                link: lastItem.attr('href'),
                guid,
            };
        })
        .filter((i) => i.guid);

    if (cookie) {
        items = await Promise.all(
            items.map(
                (item) =>
                    cache.tryGet(item.guid!, async () => {
                        const detailResponse = await got({
                            method: 'get',
                            url: item.link,
                            headers: {
                                cookie,
                            },
                        });

                        const content = load(detailResponse.data);

                        item.author = content('.author .text_bglight font a')
                            .toArray()
                            .map((i) => $(i).text())
                            .filter(Boolean)
                            .join('、');

                        const infoBlock = content('.author .text_bglight').toArray();

                        const desc = detailResponse.data?.match(/document\.getElementById\("div_desc_content"\)\.innerHTML = "(.*?)";/s)?.[1] ?? '';
                        item.description = `<img src="${content('.img_book').attr('src')}"><br>${infoBlock.map((i) => $(i).html()).join('<br>')}<br>${desc}`;

                        return item;
                    }) as unknown as DataItem
            )
        );
    }

    return {
        title: 'Mox.moe',
        link: currentUrl,
        item: items,
    };
}
