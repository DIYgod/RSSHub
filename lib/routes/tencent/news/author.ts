import { Route, Data } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/news/author/:mid',
    categories: ['new-media'],
    example: '/tencent/news/author/5933889',
    parameters: { mid: '企鹅号 ID' },
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
            title: '当前作者文章',
            source: ['news.qq.com/omn/author/:mid'],
        },
    ],
    name: '作者',
    maintainers: ['LogicJake', 'miles170'],
    handler,
};

async function handler(ctx): Promise<Data> {
    const mid = ctx.req.param('mid');
    const userType = /^\d+$/.test(mid) ? 'chlid' : 'guestSuid';
    const homePageInfoUrl = `https://i.news.qq.com/i/getUserHomepageInfo?${userType}=${mid}`;
    const userInfo = await cache.tryGet(homePageInfoUrl, async () => (await got(homePageInfoUrl)).data.userinfo);
    const title = userInfo.nick;
    const description = userInfo.user_desc;
    const suid = encodeURIComponent(userInfo.suid);

    const newsListUrl = `https://i.news.qq.com/getSubNewsMixedList?guestSuid=${suid}&tabId=om_index`;
    const news = await cache.tryGet(newsListUrl, async () => (await got(newsListUrl)).data.newslist, config.cache.routeExpire, false);

    const items = await Promise.all(
        news.map((item) => {
            const title = item.title;
            const pubDate = parseDate(item.timestamp, 'X');
            const itemUrl = item.url;
            const author = item.source;
            const abstract = item.abstract;

            if (item.articletype === '4' || item.articletype === '118') {
                // Video
                return {
                    title,
                    description: `<a href=${item.url}><img src="${item.articletype === '4' ? item.miniProShareImage : item.miniVideoPic}" style="width: 100%"></a>`,
                    link: itemUrl,
                    author,
                    pubDate,
                };
            }

            return cache.tryGet(itemUrl, async () => {
                const response = await got(itemUrl);
                const $ = load(response.data);
                const data = JSON.parse(
                    $('script:contains("window.DATA")')
                        .text()
                        .match(/window\.DATA = ({.+});/)[1]
                );
                const $data = load(data.originContent?.text || '', null, false);
                if ($data) {
                    // Not video page
                    $data('*')
                        .contents()
                        .filter((_, elem) => elem.type === 'comment')
                        .replaceWith((_, elem) =>
                            art(path.join(__dirname, '../templates/news/image.art'), {
                                attribute: elem.data.trim(),
                                originAttribute: data.originAttribute,
                            })
                        );
                }

                return {
                    title,
                    description: $data.html() || abstract,
                    link: itemUrl,
                    author,
                    pubDate,
                };
            });
        })
    );

    return {
        title,
        description,
        link: `https://new.qq.com/omn/author/${mid}`,
        item: items,
        image: userInfo?.shareImg,
    };
}
