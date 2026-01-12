import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import iconv from 'iconv-lite';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/tieba/search/:qw/:routeParams?',
    categories: ['bbs'],
    example: '/baidu/tieba/search/neuro',
    parameters: { qw: '搜索关键词', routeParams: '额外参数；请参阅以下说明和表格' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '贴吧搜索',
    maintainers: ['JimenezLi'],
    handler,
    description: `| 键           | 含义                                                       | 接受的值      | 默认值 |
| ------------ | ---------------------------------------------------------- | ------------- | ------ |
| kw           | 在名为 kw 的贴吧中搜索                                     | 任意名称 / 无 | 无     |
| only_thread  | 只看主题帖，默认为 0 关闭                                  | 0/1           | 0      |
| rn           | 返回条目的数量                                             | 1-20          | 20     |
| sm           | 排序方式，0 为按时间顺序，1 为按时间倒序，2 为按相关性顺序 | 0/1/2         | 1      |

  用例：\`/baidu/tieba/search/neuro/kw=neurosama&only_thread=1&sm=2\``,
};

async function handler(ctx) {
    const qw = ctx.req.param('qw');
    const query = new URLSearchParams(ctx.req.param('routeParams'));
    query.set('ie', 'utf-8');
    query.set('qw', qw);
    query.set('rn', query.get('rn') || '20'); // Number of returned items
    const link = `https://tieba.baidu.com/f/search/res?${query.toString()}`;

    const response = await got.get(link, {
        headers: {
            Referer: 'https://tieba.baidu.com',
        },
        responseType: 'buffer',
    });
    const data = iconv.decode(response.data, 'gbk');

    const $ = load(data);
    const resultList = $('div.s_post');

    return {
        title: `${qw} - ${query.get('kw') || '百度贴'}吧搜索`,
        link,
        item: resultList.toArray().map((element) => {
            const item = $(element);
            const titleItem = item.find('.p_title a');
            const title = titleItem.text().trim();
            const link = titleItem.attr('href');
            const time = item.find('.p_date').text().trim();
            const details = item.find('.p_content').text().trim();
            const medias = item
                .find('.p_mediaCont img')
                .toArray()
                .map((element) => {
                    const item = $(element);
                    return `<img src="${item.attr('original')}">`;
                })
                .join('');
            const tieba = item.find('a.p_forum').text().trim();
            const author = item.find('a').last().text().trim();

            return {
                title,
                description: renderToString(
                    <>
                        <p>{details}</p>
                        <p>{raw(medias)}</p>
                        <p>
                            贴吧：{tieba}
                            <br />
                            作者：{author}
                        </p>
                    </>
                ),
                author,
                pubDate: timezone(parseDate(time, 'YYYY-MM-DD HH:mm'), +8),
                link,
            };
        }),
    };
}
