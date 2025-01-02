import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';
import cache from '@/utils/cache';
import { load } from 'cheerio';

export const route: Route = {
    path: '/news/:server?',
    categories: ['game'],
    example: '/priconne-redive/news',
    parameters: { server: '服务器，默认日服' },
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
            source: ['priconne-redive.jp/news'],
            target: '/news/jp',
        },
        {
            source: ['princessconnect.so-net.tw/news'],
            target: '/news/zh-tw',
        },
        {
            source: ['game.bilibili.com/pcr/news.html'],
            target: '/news/zh-cn',
        },
    ],
    name: '最新公告',
    maintainers: ['SayaSS', 'frankcwl'],
    handler,
    url: 'priconne-redive.jp/news',
    description: `服务器

  | 国服  | 台服  | 日服  |
  | ----- | ----- | ---- |
  | zh-cn | zh-tw | jp   |`,
};

async function handler(ctx) {
    const { server = 'jp' } = ctx.req.param();

    switch (server) {
        case 'jp': {
            const parseContent = (htmlString) => {
                const $ = load(htmlString);
                $('.contents-body h3').remove();
                const time = $('.meta-info .time').text().trim();
                $('.meta-info').remove();
                const content = $('.contents-body');

                return {
                    description: content.html(),
                    pubDate: parseDate(time),
                };
            };

            const response = await got({
                method: 'get',
                url: 'https://priconne-redive.jp/news/',
            });
            const data = response.data;
            const $ = load(data);
            const list = $('.article_box');

            const out = await Promise.all(
                list.map((index, item) => {
                    item = $(item);
                    const link = item.find('a').first().attr('href');
                    return cache.tryGet(link, async () => {
                        const rssitem = {
                            title: item.find('h4').text(),
                            link,
                        };

                        const response = await got(link);
                        const result = parseContent(response.data);

                        rssitem.description = result.description;
                        rssitem.pubDate = result.pubDate;

                        return rssitem;
                    });
                })
            );

            return {
                title: '公主链接日服-新闻',
                link: 'https://priconne-redive.jp/news/',
                language: 'ja',
                item: out,
            };
        }
        case 'zh-tw': {
            const parseContent = (htmlString) => {
                const $ = load(htmlString);
                $('.news_con h2 > span').remove();
                const time = $('.news_con h2').text().trim();
                $('.news_con section h4').first().remove();
                const content = $('.news_con section');

                return {
                    description: content.html(),
                    pubDate: parseDate(time),
                };
            };

            const response = await got({
                method: 'get',
                url: 'http://www.princessconnect.so-net.tw/news',
            });
            const $ = load(response.data);
            const list = $('.news_con dl dd').get();

            const items = await Promise.all(
                list.map((item) => {
                    const $ = load(item);
                    const title = $('a');
                    const link = `http://www.princessconnect.so-net.tw${title.attr('href')}`;

                    return cache.tryGet(link, async () => {
                        const rssitem = {
                            title: title.text().trim(),
                            link,
                        };

                        const response = await got(link);
                        const result = parseContent(response.data);

                        rssitem.description = result.description;
                        rssitem.pubDate = result.pubDate;

                        return rssitem;
                    });
                })
            );

            return {
                title: '公主连结台服-最新公告',
                link: 'http://www.princessconnect.so-net.tw/news',
                item: items,
            };
        }
        case 'zh-cn': {
            const response = await got({
                method: 'get',
                url: 'https://api.biligame.com/news/list?gameExtensionId=267&positionId=2&typeId=&pageNum=1&pageSize=5',
            });
            const list = response.data;
            const items = await Promise.all(
                list.data.map((item) => {
                    const link = `https://game.bilibili.com/pcr/news.html#detail=${item.id}`;

                    return cache.tryGet(link, async () => {
                        const rssitem = {
                            title: item.title,
                            link,
                            pubDate: parseDate(item.ctime),
                        };
                        const resp = await got({ method: 'get', url: `https://api.biligame.com/news/${item.id}` });
                        rssitem.description = resp.data.data.content;
                        return rssitem;
                    });
                })
            );

            return {
                title: '公主连结国服-最新公告',
                link: 'https://game.bilibili.com/pcr/news.html',
                item: items,
            };
        }
        default:
        // Do nothing
    }
}
