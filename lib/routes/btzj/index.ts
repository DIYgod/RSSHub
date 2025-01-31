import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
const allowDomain = new Set(['2btjia.com', '88btbtt.com', 'btbtt15.com', 'btbtt20.com']);

export const route: Route = {
    path: '/:category?',
    categories: ['multimedia'],
    example: '/btzj',
    parameters: { category: '分类，可在对应分类页 URL 中找到，默认为首页' },
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
            source: ['btbtt20.com/'],
        },
    ],
    name: '分类',
    maintainers: ['nczitzk'],
    handler,
    url: 'btbtt20.com/',
    description: `::: tip
  分类页中域名末尾到 \`.htm\` 前的字段即为对应分类，如 [电影](https://www.btbtt20.com/forum-index-fid-951.htm) \`https://www.btbtt20.com/forum-index-fid-951.htm\` 中域名末尾到 \`.htm\` 前的字段为 \`forum-index-fid-951\`，所以路由应为 [\`/btzj/forum-index-fid-951\`](https://rsshub.app/btzj/forum-index-fid-951)

  部分分类页，如 [电影](https://www.btbtt20.com/forum-index-fid-951.htm)、[剧集](https://www.btbtt20.com/forum-index-fid-950.htm) 等，提供了更复杂的分类筛选。你可以将选项选中后，获得结果分类页 URL 中分类参数，构成路由。如选中分类 [高清电影 - 年份：2021 - 地区：欧美](https://www.btbtt20.com/forum-index-fid-1183-typeid1-0-typeid2-738-typeid3-10086-typeid4-0.htm) \`https://www.btbtt20.com/forum-index-fid-1183-typeid1-0-typeid2-738-typeid3-10086-typeid4-0.htm\` 中域名末尾到 \`.htm\` 前的字段为 \`forum-index-fid-1183-typeid1-0-typeid2-738-typeid3-10086-typeid4-0\`，所以路由应为 [\`/btzj/forum-index-fid-1183-typeid1-0-typeid2-738-typeid3-10086-typeid4-0\`](https://rsshub.app/btzj/forum-index-fid-1183-typeid1-0-typeid2-738-typeid3-10086-typeid4-0)
:::

  基础分类如下：

| 交流                | 电影                | 剧集                | 高清电影             |
| ------------------- | ------------------- | ------------------- | -------------------- |
| forum-index-fid-975 | forum-index-fid-951 | forum-index-fid-950 | forum-index-fid-1183 |

| 音乐                | 动漫                | 游戏                | 综艺                 |
| ------------------- | ------------------- | ------------------- | -------------------- |
| forum-index-fid-953 | forum-index-fid-981 | forum-index-fid-955 | forum-index-fid-1106 |

| 图书                 | 美图                | 站务              | 科技                |
| -------------------- | ------------------- | ----------------- | ------------------- |
| forum-index-fid-1151 | forum-index-fid-957 | forum-index-fid-2 | forum-index-fid-952 |

| 求助                 | 音轨字幕             |
| -------------------- | -------------------- |
| forum-index-fid-1187 | forum-index-fid-1191 |

::: tip
  BT 之家的域名会变更，本路由以 \`https://www.btbtt20.com\` 为默认域名，若该域名无法访问，可以通过在路由后方加上 \`?domain=<域名>\` 指定路由访问的域名。如指定域名为 \`https://www.btbtt15.com\`，则在 \`/btzj\` 后加上 \`?domain=btbtt15.com\` 即可，此时路由为 [\`/btzj?domain=btbtt15.com\`](https://rsshub.app/btzj?domain=btbtt15.com)

  如果加入了分类参数，直接在分类参数后加入 \`?domain=<域名>\` 即可。如指定分类 [剧集](https://www.btbtt20.com/forum-index-fid-950.htm) \`https://www.btbtt20.com/forum-index-fid-950.htm\` 并指定域名为 \`https://www.btbtt15.com\`，即在 \`/btzj/forum-index-fid-950\` 后加上 \`?domain=btbtt15.com\`，此时路由为 [\`/btzj/forum-index-fid-950?domain=btbtt15.com\`](https://rsshub.app/btzj/forum-index-fid-950?domain=btbtt15.com)

  目前，你可以选择的域名有 \`btbtt10-20.com\` 共 10 个，或 \`88btbbt.com\`，该站也提供了专用网址查询工具。详见 [此贴](https://www.btbtt20.com/thread-index-fid-2-tid-4550191.htm)
:::`,
};

async function handler(ctx) {
    let category = ctx.req.param('category') ?? '';
    let domain = ctx.req.query('domain') ?? 'btbtt15.com';
    if (!config.feature.allow_user_supply_unsafe_domain && !allowDomain.has(new URL(`http://${domain}/`).hostname)) {
        throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }

    if (category === 'base') {
        category = '';
        domain = '88btbtt.com';
    } else if (category === 'govern') {
        category = '';
        domain = '2btjia.com';
    }

    const rootUrl = `https://www.${domain}`;
    const currentUrl = `${rootUrl}${category ? `/${category}.htm` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    $('.bg2').prevAll('table').remove();

    let items = $('#threadlist table')
        .toArray()
        .map((item) => {
            const a = $(item).find('.subject_link');

            return {
                title: a.text(),
                link: `${rootUrl}/${a.attr('href')}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('h2, .message').remove();

                content('.attachlist')
                    .find('a')
                    .each(function () {
                        content(this)
                            .children('img')
                            .attr('src', `${rootUrl}${content(this).children('img').attr('src')}`);
                        content(this).attr(
                            'href',
                            `${rootUrl}/${content(this)
                                .attr('href')
                                .replace(/^attach-dialog/, 'attach-download')}`
                        );
                    });

                const torrents = content('.attachlist').find('a');

                item.description = content('.post').html();
                item.author = content('.purple, .grey').first().prev().text();
                item.pubDate = timezone(parseDate(content('.bg2 b').first().text()), +8);

                if (torrents.length > 0) {
                    item.description += art(path.join(__dirname, 'templates/torrents.art'), {
                        torrents: torrents.toArray().map((t) => content(t).parent().html()),
                    });
                    item.enclosure_type = 'application/x-bittorrent';
                    item.enclosure_url = torrents.first().attr('href');
                }

                return item;
            })
        )
    );

    return {
        title: `${$('#menu, #threadtype')
            .find('.checked')
            .toArray()
            .map((c) => $(c).text())
            .filter((c) => c !== '全部')
            .join('|')} - BT之家`,
        link: currentUrl,
        item: items,
    };
}
