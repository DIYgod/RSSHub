import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?',
    categories: ['anime'],
    example: '/mox',
    parameters: { category: '分类，可在对应分类页 URL 中找到' },
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
            source: ['mox.moe/l/:category', 'mox.moe/'],
        },
    ],
    name: '首頁',
    maintainers: ['nczitzk'],
    handler,
    description: `:::tip
  在首页将分类参数选择确定后跳转到的分类页面 URL 中，\`/l/\` 后的字段即为分类参数。

  如 [科幻 + 日語 + 日本 + 長篇 + 完結 + 最近更新](https://mox.moe/l/CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL) 的 URL 为 [https://mox.moe/l/CAT%2A 科幻，日本，完結，lastupdate,jpn,l,BL](https://mox.moe/l/CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL)，此时 \`/l/\` 后的字段为 \`CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL\`。最终获得路由为 [\`/mox/CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL\`](https://rsshub.app/mox/CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL)
  :::`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '';

    const rootUrl = 'https://mox.moe';
    const currentUrl = `${rootUrl}${category ? `/l/${category}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.listbg td')
        .toArray()
        .map((item) => {
            item = $(item).find('a').last();

            const guid = item.attr('href').split('/').pop();
            const pubDate = item.parent().find('.filesize').text();

            return {
                title: item.text(),
                link: item.attr('href'),
                pubDate: parseDate(pubDate),
                guid: `${guid}-${pubDate}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.guid, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.author = content('.status font a').first().text();
                item.description = `<img src="${content('.img_book').attr('src')}"><br>${content('.author').html()}<br>${content('#desc_text').html()}`;

                return item;
            })
        )
    );

    return {
        title: 'Mox.moe',
        link: currentUrl,
        item: items,
    };
}
