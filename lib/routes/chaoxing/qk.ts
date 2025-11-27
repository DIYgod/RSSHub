import path from 'node:path';

import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

export const route: Route = {
    path: '/qk/:id/:needContent?',
    categories: ['reading'],
    example: '/chaoxing/qk/6b5c39b3dd84352be512e29df0297437',
    parameters: { id: '期刊 id，可在期刊页 URL 中找到', needContent: '需要获取文章全文，填写 true/yes 表示需要，默认需要' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '期刊',
    maintainers: ['nczitzk'],
    handler,
    description: `::: tip
  全部期刊可以在 [这里](http://qk.chaoxing.com/space/index) 找到，你也可以从 [学科分类](https://qikan.chaoxing.com/jourclassify) 和 [期刊导航](https://qikan.chaoxing.com/search/openmag) 中发现更多期刊。

  如订阅 [**上海文艺**](http://m.chaoxing.com/mqk/list?sw=\&mags=6b5c39b3dd84352be512e29df0297437\&isort=20\&from=space)，其 URL 为 \`http://m.chaoxing.com/mqk/list?mags=6b5c39b3dd84352be512e29df0297437\`。\`6b5c39b3dd84352be512e29df0297437\` 即为期刊 id，所得路由为 [\`/chaoxing/qk/6b5c39b3dd84352be512e29df0297437\`](https://rsshub.app/chaoxing/qk/6b5c39b3dd84352be512e29df0297437)
:::

::: warning
  你可以设置参数 **需要获取文章全文** 为 \`true\` \`yes\` \`t\` \`y\` 等值（或者忽略这个参数），RSS 的条目会携带期刊中的 **文章全文**，而不仅仅是 **文章概要**。但因为发起访问请求过多会被该网站屏蔽，你可以将其关闭（设置该参数为 \`false\` \`no\` \`f\` \`n\` 等值），这将会大大减少请求次数从而更难触发网站的反爬机制。

  路由默认会获取 **30** 个条目。在路由后指定 \`?limit=<条目数量>\` 减少或增加单次获取条目数量，同样可以减少请求次数，如设置为一次获取 **10** 个条目，路由可以更改为 [\`/chaoxing/qk/6b5c39b3dd84352be512e29df0297437?limit=10\`](https://rsshub.app/chaoxing/qk/6b5c39b3dd84352be512e29df0297437?limit=10)

  在根据上文设置 **需要获取文章全文** 为不需要时，你可以将 \`limit\` 值增大，从而获取更多的条目，此时因为不获取全文也不会触发反爬机制，如 [\`/chaoxing/qk/6b5c39b3dd84352be512e29df0297437/false?limit=100\`](https://rsshub.app/chaoxing/qk/6b5c39b3dd84352be512e29df0297437/false?limit=100)
:::`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const needContent = /t|y/i.test(ctx.req.param('needContent') ?? 'true');

    const rootUrl = 'http://m.chaoxing.com';
    const currentUrl = `${rootUrl}/mqk/json?size=${ctx.req.query('limit') ?? 30}&mags=${id}&isort=20`;

    const headers = {
        cookie: 'duxiu=userName_dsr%2C%3Dmmxy%2C!userid_dsr%2C%3D837%2C!enc_dsr%2C%3D7EDE234634FC80D554A7F6D1AA0D3629; AID_dsr=665; msign_dsr=1638170006420;',
    };

    const response = await got({
        method: 'get',
        url: currentUrl,
        headers,
    });

    let items = response.data.list.map((item) => ({
        title: item.infos.C301,
        author: item.infos.C303,
        link: item.infos.read,
        category: [item.infos.C314, item.infos.C031],
        pubDate: parseDate(item.infos.C103, 'YYYYMMDD'),
        description: art(path.join(__dirname, 'templates/description.art'), {
            description: (item.infos.M305 ?? item.infos.C305 ?? '').trim(),
        }),
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                if (needContent) {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                        headers,
                    });

                    const content = load(detailResponse.data);

                    item.description = content('#article_content').html() ?? content('body').html();
                }
                return item;
            })
        )
    );

    return {
        title: response.data.list[0].infos.C307,
        link: `${rootUrl}/mqk/list?mags=${id}&isort=20&from=space`,
        item: items,
    };
}
