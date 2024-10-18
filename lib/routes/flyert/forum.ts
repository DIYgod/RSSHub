import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import iconv from 'iconv-lite';
import { load } from 'cheerio';
import { rootUrl, parseArticleList, parsePostList, parseArticle, parsePost } from './util';

export const handler = async (ctx) => {
    const { params } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 5;

    const decodedParams = params
        ? decodeURIComponent(params)
              .split(/&/)
              .filter((p) => p.split(/=/).length === 2)
              .join('&')
        : undefined;

    const currentUrl = new URL(`forum.php${decodedParams ? `?${decodedParams}` : ''}`, rootUrl).href;

    const { data: response } = await got(currentUrl, {
        responseType: 'buffer',
    });

    const $ = load(iconv.decode(response, 'gbk'));

    const language = $('meta[http-equiv="Content-Language"]').prop('content');

    let items = $('table#threadlisttableid').length === 0 ? parseArticleList($, limit) : parsePostList($, limit);

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link, {
                    responseType: 'buffer',
                });

                const $$ = load(iconv.decode(detailResponse, 'gbk').replaceAll(/<\/?ignore_js_op>/g, ''));

                item = $$('div.firstpost').length === 0 ? parseArticle($$, item) : parsePost($$, item);

                item.language = language;

                return item;
            })
        )
    );

    const image = `https:${$('div.wp h2 a img').prop('src')}`;

    return {
        title: `飞客 - ${$('a.forum_name, li.a, li.cur, li.xw1, div.z > a.xw1')
            .toArray()
            .map((a) => $(a).text())
            .join(' - ')}`,
        description: $('meta[name="description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: $('meta[name="application-name"]').prop('content'),
    };
};

export const route: Route = {
    path: '/forum/:params{.+}?',
    name: '会员说',
    url: 'www.flyert.com.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/flyert/forum',
    parameters: { params: '参数，默认为空，可在对应分类页 URL 中找到' },
    description: `:::tip
  若订阅 [酒店集团优惠](https://www.flyert.com.cn/forum.php?mod=forumdisplay&sum=all&fid=all&catid=322&filter=sortid&sortid=144&searchsort=1&youhui_type=19)，网址为 \`https://www.flyert.com.cn/forum.php?mod=forumdisplay&sum=all&fid=all&catid=322&filter=sortid&sortid=144&searchsort=1&youhui_type=19\`。截取 \`https://www.flyert.com.cn/forum.php?\` 到末尾的部分 \`mod=forumdisplay&sum=all&fid=all&catid=322&filter=sortid&sortid=144&searchsort=1&youhui_type=19\` **进行 UrlEncode 编码** 后作为参数填入，此时路由为 [\`/flyert/forum/mod%3Dforumdisplay%26sum%3Dall%26fid%3Dall%26catid%3D322%26filter%3Dsortid%26sortid%3D144%26searchsort%3D1%26youhui_type%3D226\`](https://rsshub.app/flyert/forum/mod%3Dforumdisplay%26sum%3Dall%26fid%3Dall%26catid%3D322%26filter%3Dsortid%26sortid%3D144%26searchsort%3D1%26youhui_type%3D226)。
  :::
    `,
    categories: ['bbs'],

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
            source: ['www.flyert.com.cn/forum.php'],
            target: (_, url) => {
                const params = [...url.searchParams.entries()].map(([key, value]) => key + '=' + value).join('&');

                return `/forum${params ? `/${encodeURIComponent(params)}` : ''}`;
            },
        },
    ],
};
