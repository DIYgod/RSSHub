import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { feedMeta, fetchArticle, parseCardList, renderDescription } from './common';

export const route: Route = {
    path: '/video/lists/:id',
    parameters: { id: '分类 id，见下表，可在对应分类页 URL 中找到' },
    name: '视频',
    example: '/jiemian/video/lists/258_1',
    maintainers: ['nczitzk', 'pseudoyu'],
    handler,
    description: `| [界面 Vnews](https://www.jiemian.com/video/lists/258_1.html) | [直播](https://www.jiemian.com/videoLive/lists_1.html) | [箭厂](https://www.jiemian.com/video/lists/195_1.html) | [面谈](https://www.jiemian.com/video/lists/111_1.html) | [品牌创酷](https://www.jiemian.com/video/lists/226_1.html) | [番 茄社](https://www.jiemian.com/video/lists/567_1.html) |
| ------------------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------ | ---------------------------------------------------------- | --------------------------------------------------------- |
| 258\\_1                                                       | videoLive                                              | 195\\_1                                                 | 111\\_1                                                 | 226\\_1                                                     | 567\\_1                                                    |

| [商业微史记](https://www.jiemian.com/video/lists/882_1.html) |
| ------------------------------------------------------------ |
| 882\\_1                                                       |`,
};

async function handler(ctx: Context): Promise<Data> {
    const { id } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 20;

    if (id === 'videoLive') {
        const currentUrl = 'https://www.jiemian.com/videoLive/lists_1.html';
        const [pageResponse, listResponse] = await Promise.all([ofetch(currentUrl), ofetch('https://papi.jiemian.com/page/api/livevideo/moreHistroyLiveVideo', { parseResponse: JSON.parse })]);

        const items = await Promise.all(
            listResponse.data.slice(0, limit).map((live) =>
                cache.tryGet(live.url, async () => {
                    const detailResponse = await ofetch<string>('https://a.jiemian.com/index.php', {
                        query: {
                            m: 'video_live',
                            a: 'loadLiveNew',
                            id: live.id,
                        },
                    });
                    const { data } = JSON.parse(detailResponse.slice(detailResponse.indexOf('(') + 1, detailResponse.lastIndexOf(')')));

                    return {
                        title: live.title,
                        description: renderDescription({
                            image: data.back_url_mp4 ? undefined : { src: live.image, alt: live.title },
                            video: data.back_url_mp4
                                ? {
                                      src: data.back_url_mp4,
                                      poster: data.image || live.image,
                                      type: 'video/mp4',
                                  }
                                : undefined,
                            description: live.summary,
                        }),
                        link: live.url,
                        pubDate: parseDate(live.publish_time, 'X'),
                        category: [live.cate_name],
                        image: live.image,
                    };
                })
            )
        );

        return {
            item: items,
            ...feedMeta(load(pageResponse), currentUrl),
        };
    }

    const tid = id.split('_', 1)[0];
    const currentUrl = `https://www.jiemian.com/video/lists/${id}.html`;
    const [pageResponse, listResponse] = await Promise.all([
        ofetch(currentUrl),
        ofetch<string>('https://a.jiemian.com/index.php', {
            query: {
                m: 'newLists',
                a: 'loadMore',
                tid,
                page: 1,
                tpl: 'sub-card',
                cid: tid,
                repeat: '',
                list_type: 'video',
            },
        }),
    ]);

    const { html } = JSON.parse(listResponse.slice(listResponse.indexOf('(') + 1, listResponse.lastIndexOf(')')));
    const list = parseCardList(html);

    const items = await Promise.all(list.slice(0, limit).map((item) => fetchArticle(item)));

    return {
        item: items,
        ...feedMeta(load(pageResponse), currentUrl),
    };
}
