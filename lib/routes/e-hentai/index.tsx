import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { getSubPath } from '@/utils/common-utils';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/category/:category?/:needTorrents?/:needImages?',
    categories: ['multimedia'],
    example: '/e-hentai/category/manga',
    parameters: {
        category: '分类，可在对应分类页中找到，默认为首页',
        needTorrents: '需要输出种子文件，填写 true/yes 表示需要，默认需要',
        needImages: '需要显示大图，填写 true/yes 表示需要，默认需要',
    },
    name: '分类',
    maintainers: ['nczitzk'],
    description: `::: tip
参数 **需要输出种子文件** 设置为 \`true\` \`yes\` \`t\` \`y\` 等值后，RSS 会携带种子文件的路径，以供支持 RSS 的下载工具订阅下载。

同理，参数 **需要显示大图** 启用后，RSS 会携带每项内容中的大图，而不只提供缩略图。

当然，选择 **需要输出种子文件**、**需要显示大图** 后获取内容时间需要更久，同时若指定获取数量过多，可能会出现获取超时错误。此时，可以在路由末尾处加上 \`?limit=限制获取数目\` 来限制获取条目数量，或直接修改全局的超时参数 \`REQUEST_TIMEOUT\`（详见文档中的 [其他应用配置](https://docs.rsshub.app/install/#pei-zhi-qi-ta-ying-yong-pei-zhi)）。

以下是一个例子：

选择浏览 [Manga 分类](https://e-hentai.org/manga)，并指定 **不携带种子文件**，**只显示大图**，并只 **输出 5 个**。由于 [Manga 分类](https://e-hentai.org/manga) 的 URL \`https://e-hentai.org/manga\` 中对应分类字段为 \`manga\`，所以对应路由为 [\`/e-hentai/category/manga/no/yes?limit=5\`](https://rsshub.app/e-hentai/category/manga/no/yes?limit=5)
:::

| Doujinshi | Manga | Artist CG | Game CG | Western |
| --------- | ----- | --------- | ------- | ------- |
| doujinshi | manga | artistcg  | gamecg  | western |

| Non-H | Image Set | Cosplay | Asian Porn | Misc | Popular |
| ----- | --------- | ------- | ---------- | ---- | ------- |
| non-h | imageset  | cosplay | asianporn  | misc | popular |`,
    features: {
        nsfw: true,
    },
    radar: [
        {
            source: ['e-hentai.org/'],
            target: '/category',
        },
        ...['doujinshi', 'manga', 'artistcg', 'gamecg', 'western', 'non-h', 'imageset', 'cosplay', 'asianporn', 'misc', 'popular'].map((category) => ({
            source: [`e-hentai.org/${category}`],
            target: `/category/${category}`,
        })),
    ],
    handler,
};

export async function handler(ctx) {
    const id = ctx.req.param('category') ?? ctx.req.param('tag') ?? ctx.req.param('keyword') ?? '';
    const what = getSubPath(ctx).split('/', 2)[1];
    const needTorrents = /t|y/i.test(ctx.req.param('needTorrents') ?? 'true');
    const needImages = /t|y/i.test(ctx.req.param('needImages') ?? 'true');

    const rootUrl = 'https://e-hentai.org';
    const currentUrl = `${rootUrl}/${id ? (what === 'search' ? `?${id}` : what === 'category' ? id : `${what}/${id}`) : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    $('.itd').parent().remove();

    const defaultLimit = needImages ? 15 : 25;
    const limit = getRouteLimit(ctx, defaultLimit);
    let items = $('table.gltc tbody tr')
        .slice(1, Math.max(defaultLimit, limit) + 1)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const published = parseDateInTimezone($item.find('div.ir').prev().text(), 0);

            return {
                title: $item.find('div.glink').text(),
                author: $item.find('td.glhide div a').text(),
                link: $item.find('td.glname a').attr('href'),
                pubDate: Number.isFinite(published.getTime()) ? published : undefined,
                category: $item
                    .find('div.gt')
                    .toArray()
                    .map((tag) => $(tag).attr('title')!.replace(/^:/, '')),
                description: needImages ? '' : `<img src="${$item.find('div.glthumb div img').attr('data-src') ?? $item.find('div.glthumb div img').attr('src')}">`,
                enclosure_url: needTorrents && $item.find('div.gldown a img[title="Show torrents"]').length > 0 ? $item.find('.gldown a').attr('href') : undefined,
            };
        });

    const sorted = ctx.req.query('sorted') !== 'false';
    const datedItems = items.every((item) => item.pubDate instanceof Date && Number.isFinite(item.pubDate.getTime()));
    if (sorted && datedItems) {
        items.sort((a, b) => (b.pubDate as Date).getTime() - (a.pubDate as Date).getTime());
    }
    if (!sorted || datedItems) {
        items = items.slice(0, limit);
    }

    items = await pMap(
        items,
        async (item) => {
            if (item.enclosure_url) {
                const torrentData = await cache.tryGet(`e-hentai:torrents:${item.enclosure_url}`, async () => {
                    const torrentResponse = await got({
                        method: 'get',
                        url: item.enclosure_url,
                    });

                    const torrent = load(torrentResponse.data);

                    const torrents = torrent('table tbody tr td a')
                        .toArray()
                        .map((t) => {
                            const $t = torrent(t);
                            return { link: $t.attr('href'), title: $t.text() };
                        });
                    return { torrents };
                });
                item.enclosure_url = torrentData.torrents[0].link;
                item.enclosure_type = 'application/x-bittorrent';
            }

            if (needImages) {
                const images = await cache.tryGet(`e-hentai:images:${item.link}`, async () => {
                    const imageResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = load(imageResponse.data);

                    const imagePages = content('#gdt a[href]')
                        .toArray()
                        .map((i) => content(i).attr('href')!);
                    if (!imagePages.length) {
                        throw new Error(`No public image pages were found for ${item.link}. Please check the original gallery.`);
                    }
                    return pMap(
                        imagePages,
                        (imagePage) =>
                            cache.tryGet(imagePage, async () => {
                                const imageResponse = await got({
                                    method: 'get',
                                    url: imagePage,
                                });

                                const image = load(imageResponse.data);
                                const imageUrl = image('#img').attr('src');
                                if (!imageUrl) {
                                    throw new Error(`No public image was found on ${imagePage}. Please check the original image page.`);
                                }
                                return imageUrl;
                            }),
                        { concurrency: 3 }
                    );
                });
                item.description += renderToString(
                    <>
                        {images.map((image) => (
                            <div>
                                <img src={image} />
                            </div>
                        ))}
                    </>
                );
            }
            return item;
        },
        { concurrency: 3 }
    );

    return {
        title: `${id || what} - E-Hentai Galleries`,
        link: currentUrl,
        item: items,
    };
}
