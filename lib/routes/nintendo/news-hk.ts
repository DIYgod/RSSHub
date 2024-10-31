import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news/hk',
    categories: ['game'],
    example: '/nintendo/news/hk',
    parameters: {},
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
            source: ['nintendo.com.hk/topics', 'nintendo.com.hk/'],
        },
    ],
    name: 'News（Hong Kong）',
    maintainers: ['benzking'],
    handler,
    url: 'nintendo.com.hk/topics',
};

async function handler(ctx) {
    const response = await got('https://www.nintendo.com.hk/api/top/topics_pickup');
    const data = response.data.slice(0, 10);
    //  console.log(data);
    const list = data.map((item) => ({
        // 文章标题
        title: item.title,
        // 文章链接
        link: `https://www.nintendo.com.hk${item.href}`,
        // 文章发布日期
        pubDate: timezone(parseDate(item.displayDate, 'YYYY.M.D'),+8),
        itunes_item_image:item.banner.url,
        category:item.category,
    }));
    //  console.log(list);
    // 获取新闻正文
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                //  判断
                //  console.log(item.link);
                const { data: response } = await got(item.link);
               //   console.log(data);
                //  console.log(response);
                const $ = load(response);
                // 选择类名为“comment-body”的第一个元素1
                item.description = $('div.topics-articleBody').first().html();
                // 上面每个列表项的每个属性都在此重用，
                // 并增加了一个新属性“description”
                return item;
            })
        )
    );
    //  console.log(items);
    return {
        title: 'Nintendo（香港）主页资讯',
        link: 'https://www.nintendo.com.hk/topics/',
        description: 'Nintendo 香港有限公司官网刊登的资讯',
        item:items,
    };
}
