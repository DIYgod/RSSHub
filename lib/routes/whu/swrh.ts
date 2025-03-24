// 修改自计算机学院route
import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
// import { parseDate } from '@/utils/parse-date';
// import timezone from '@/utils/timezone';
import { load } from 'cheerio';
import { fetchArticle } from '@/utils/wechat-mp';

const baseUrl = 'https://swrh.whu.edu.cn';

export const route: Route = {
    path: '/swrh/:type',
    categories: ['university'],
    example: '/whu/swrh/2',
    radar: [
        {
            source: ['swrh.whu.edu.cn/:type'],
            target: '/swrh/:type',
        },
    ],
    parameters: { type: '公告类型，详见表格' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '水利水电学院公告',
    maintainers: ['FanofZY'],
    handler,
    description: `| 公告类型 | 学院新闻 | 学术科研 | 通知公告 |
| -------- | -------- | -------- | -------- |
| 参数     | 0        | 1        | 2        |`,
};

async function handler(ctx) {
    const type = Number.parseInt(ctx.req.param('type'));

    let link;
    switch (type) {
        case 0:
            link = `${baseUrl}/index/xyxw.htm`; // 学院新闻
            break;

        case 1:
            link = `${baseUrl}/index/xsky.htm`; // 学术科研
            break;

        case 2:
            link = `${baseUrl}/xxgk/tzgg.htm`; // 通知公告
            break;

        default:
            throw new Error(`Unknown type: ${type}`);
    }

    const response = await got(link);
    const $ = load(response.data);

    const list =
        type === 0
            ? $('div.my_box_nei')
                  .toArray()
                  .map((item) => {
                      item = $(item);
                      return {
                          title: item.find('a b.am-text-truncate').text().trim(),
                          pubDate: item.find('a i').text().trim(),
                          link: new URL(item.find('a').attr('href'), baseUrl).href,
                      };
                  })
            : $('div.list_txt.am-fr ul.am-list li')
                  .toArray()
                  .map((item) => {
                      item = $(item);
                      return {
                          title: item.find('a span').text().trim(),
                          pubDate: item.find('a i').text().trim(),
                          link: new URL(item.find('a').attr('href'), baseUrl).href,
                      };
                  });

    let items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                // 首先检查是否是微信公众号
                item.description = item.link.includes('weixin')
                    ? await fetchArticle(item.link).then((article) => article.description)
                    : await (async () => {
                          try {
                              const response = await got(item.link);
                              const $ = load(response.data);

                              return $('.v_news_content').length ? $('.v_news_content').html().trim() : ($('.prompt').length ? $('.prompt').html() : item.title);
                          } catch {
                              return item.title;
                          }
                      })();

                return item;
            })
        )
    );

    items = items.filter((item) => item !== null);

    return {
        title: $('title').first().text(),
        link,
        item: items,
    };
}
