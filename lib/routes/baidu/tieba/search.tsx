import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { getTiebaPageContent, normalizeUrl } from './common';

export const route: Route = {
    path: '/tieba/search/:qw/:routeParams?',
    categories: ['bbs'],
    example: '/baidu/tieba/search/neuro',
    parameters: { qw: '搜索关键词', routeParams: '额外参数；请参阅以下说明和表格' },
    features: {
        requireConfig: [
            {
                name: 'BAIDU_COOKIE',
                optional: false,
                description: '百度 cookie 值，用于需要登录的贴吧页面',
            },
        ],
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '贴吧搜索',
    maintainers: ['JimenezLi', 'FlanChanXwO'],
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
    query.set('rn', query.get('rn') || '20');
    const link = `https://tieba.baidu.com/f/search/res?${query.toString()}`;

    const html = await getTiebaPageContent(link, `tieba:search:${qw}:${query.toString()}`, {
        waitForSelector: '.thread-content-box',
        timeout: 3000,
    });

    const $ = load(html);

    const resultList = $('.thread-content-box');

    if (resultList.length === 0) {
        throw new Error('No search results found. The page structure may have changed.');
    }

    return {
        title: `${qw} - ${query.get('kw') || '百度贴'}吧搜索`,
        link,
        item: resultList.toArray().map((element) => {
            const item = $(element);

            // 标题
            const title = item.find('.title-content-wrap .title-wrap span').text().trim();

            // 内容摘要
            const details = item.find('.abstract-wrap span').text().trim();

            // 从链接中提取帖子URL，并规范化为绝对地址
            const linkPath = item.find('.action-bar-warp a.action-link-bg').attr('href') || '';
            const linkHref = normalizeUrl(linkPath);

            // 作者
            const author = item.find('.forum-attention.user').text().trim();

            // 时间 - 从 top-title 中提取 "发布于 YYYY-M-D"
            const timeText = item.find('.top-title').text().trim();
            const timeMatch = timeText.match(/发布于\s+(\d{4}-\d{1,2}-\d{1,2})/);
            const time = timeMatch ? timeMatch[1] : '';
            const parsedDate = time ? parseDate(time, 'YYYY-M-D') : null;
            const validPubDate = parsedDate && !Number.isNaN(parsedDate.getTime()) ? timezone(parsedDate, +8) : undefined;

            // 图片
            const medias = item
                .find('.thread-media-new img')
                .toArray()
                .map((el) => {
                    const img = $(el);
                    const src = img.attr('src') || img.attr('data-src') || '';
                    return `<img src="${src}" alt="${title}">`;
                })
                .join('');

            // 贴吧名
            const tieba = item.find('.forum-name-text').text().trim();

            return {
                title,
                description: renderToString(
                    <>
                        <p>{details}</p>
                        <p>{raw(medias)}</p>
                        <p>贴吧：{tieba}</p>
                    </>
                ),
                author,
                pubDate: validPubDate,
                link: linkHref,
            };
        }),
    };
}
