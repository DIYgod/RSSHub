import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news/jp',
    categories: ['game'],
    example: '/nintendo/news/jp',
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
            source: ['nintendo.com/jp'],
        },
    ],
    name: 'News（JP）',
    maintainers: ['benzking'],
    handler,
    url: 'nintendo.com/jp',
};

async function handler(ctx) {
    const response = await got('https://www.nintendo.com/jp/topics/c/api/json_list?key=newtopics');
    //  console.log(response);
    const data = response.data.slice(0, 10);
    //  console.log(data);
    const list = data.map((item) => ({
        // 文章标题
        title: item.title,
        // 文章链接
        link: item.topic_url,
        // 文章发布日期
        pubDate: parseDate(item.release_date, 'YYYY/M/D HH:mm:ss'),  // "release_date": "2024/10/18 17:00:00"
        itunes_item_image:item.thumbnail.large.medium,
        category:item.categorylarge.name,
    }));
    //  console.log(list);
    // 获取新闻正文
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                // 选择类名为“comment-body”的第一个元素
                item.description = $('div.topics-articleBody').first().html();
                // 上面每个列表项的每个属性都在此重用，
                // 并增加了一个新属性“description”
                return item;
            })
        )
    );
    //  console.log(items);
    return {
        title: 'Nintendo（日本）主页资讯',
        link: 'https://www.nintendo.com/jp/topics',
        description: 'Nintendo JP',
        item:items,
    };
}
