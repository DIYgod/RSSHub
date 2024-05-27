import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/lm/:id?',
    categories: ['traditional-media'],
    example: '/cctv/lm/xwzk',
    parameters: { id: '栏目 id，可在对应栏目页 URL 中找到，默认为 `xwzk` 即 新闻周刊' },
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
            source: ['news.cctv.com/:category'],
            target: '/:category',
        },
    ],
    name: '栏目',
    maintainers: ['nczitzk'],
    handler,
    description: `| 焦点访谈 | 等着我 | 今日说法 | 开讲啦 |
  | -------- | ------ | -------- | ------ |
  | jdft     | dzw    | jrsf     | kjl    |

  | 正大综艺 | 经济半小时 | 第一动画乐园 |
  | -------- | ---------- | ------------ |
  | zdzy     | jjbxs      | dydhly       |

  :::tip
  更多栏目请看 [这里](https://tv.cctv.com/lm)
  :::`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? 'xwzk';

    const rootUrl = 'https://tv.cctv.com';
    const apiRootUrl = 'https://api.cntv.cn';
    const vdnRootUrl = 'https://vdn.apps.cntv.cn';

    const currentUrl = `${rootUrl}/lm/${id}/videoset`;

    const titleResponse = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(titleResponse.data);

    const topId = titleResponse.data.match(/(TOPC\d{16})/)[1];
    const apiUrl = `${apiRootUrl}/NewVideo/getVideoListByColumn?id=${topId}&n=20&sort=desc&p=1&mode=0&serviceId=tvcctv`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const list = response.data.data.list.map((item) => ({
        url: item.url,
        guid: item.guid,
        image: item.image,
        title: item.title,
        pubDate: timezone(parseDate(item.time), +8),
        link: `${vdnRootUrl}/api/getHttpVideoInfo.do?pid=${item.guid}`,
        description: `<p>${item.brief.replaceAll('\r\n', '</p><p>')}</p>`,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const data = detailResponse.data;

                item.description += `<video src="${data.hls_url}" controls="controls" poster="${item.image}" width="100%"></video><br>`;

                for (const c of data.video.chapters) {
                    item.description += `<video src="${c.url}" controls="controls" poster="${c.image}" width="100%"></video><br>`;
                }

                for (let i = 2; data.video[`chapters${i}`]; i++) {
                    for (const c of data.video[`chapters${i}`]) {
                        item.description += `<video src="${c.url}" controls="controls" poster="${c.image}" width="100%"></video><br>`;
                    }
                }

                item.link = item.url;

                delete item.url;
                delete item.image;

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
        description: $('meta[name=description]').attr('content'),
    };
}
