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

export const route: Route = {
    path: '/:node',
    categories: ['traditional-media'],
    example: '/ycwb/1',
    parameters: { node: '栏目 id' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '新闻',
    maintainers: ['TimWu007'],
    handler,
    description: `注：小部分栏目的 URL 会给出 nodeid。如未给出，可打开某条新闻链接后，查看网页源代码，搜索 nodeid 的值。

  常用栏目节点：

| 首页 | 中国 | 国际 | 体育 | 要闻 | 珠江评论 | 民生观察 | 房产 | 金羊教育 | 金羊财富 | 金羊文化 | 金羊健康 | 金羊汽车 |
| ---- | ---- | ---- | ---- | ---- | -------- | -------- | ---- | -------- | -------- | -------- | -------- | -------- |
| 1    | 14   | 15   | 16   | 22   | 1875     | 21773    | 222  | 5725     | 633      | 5281     | 21692    | 223      |

| 广州 | 广州 - 广州要闻 | 广州 - 社会百态 | 广州 - 深读广州 | 广州 - 生活服务 | 今日大湾区 | 广东 - 政经热闻 | 广东 - 民生视点 | 广东 - 滚动新闻 |
| ---- | --------------- | --------------- | --------------- | --------------- | ---------- | --------------- | --------------- | --------------- |
| 18   | 5261            | 6030            | 13352           | 83422           | 100418     | 13074           | 12252           | 12212           |`,
};

async function handler(ctx) {
    const node = ctx.req.param('node') ?? 1;
    const currentUrl = `https://6api.ycwb.com/app_if/jy/getArticles?nodeid=${node}&pagesize=15`;

    const { data: response } = await got(currentUrl);

    const list = response.artiles.map((item) => ({
        title: item.TITLE,
        description: art(path.join(__dirname, 'templates/description.art'), {
            thumb: item.PICLINKS,
            description: item.ABSTRACT,
        }),
        pubDate: timezone(parseDate(item.PUBTIME), +8),
        link: item.PUBURL,
        nodeName: item.NODENAME,
    }));

    let nodeName = '';
    let nodeLink = '';

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                const $comments = content('.main_article')
                    .contents()
                    .filter(function () {
                        return this.nodeType === 8;
                    });
                $comments.each(function () {
                    // Remove useless comments
                    if (/audioPlayer|audio-box/.test(this.data)) {
                        this.data = '';
                    }
                    // Filter author from comments
                    if (/author/.test(this.data)) {
                        item.author = this.data.split('<author>')[1].split('</author>')[0];
                    }
                });

                nodeName = nodeName === '' ? item.nodeName : nodeName;

                // Filter node link from content('.path a')
                const children = content('.path').children('a');
                for (const child of children) {
                    if (content(child).text() === nodeName && nodeLink === '') {
                        nodeLink = content(child).attr('href');
                    }
                }

                content('span').removeAttr('style').removeAttr('class');
                content('img').removeAttr('style').removeAttr('class').removeAttr('placement').removeAttr('data-toggle').removeAttr('trigger').removeAttr('referrerpolicy');
                content('br').removeAttr('style').removeAttr('class');
                content('p').removeAttr('style').removeAttr('class');
                content('.space10, .ddf').remove();

                item.description += content('.main_article').html() ?? '';

                return item;
            })
        )
    );

    return {
        title: `羊城晚报金羊网 - ${nodeName}`,
        link: String(nodeLink === '' ? 'https://www.ycwb.com/' : nodeLink),
        item: items,
    };
}
