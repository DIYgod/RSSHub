import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

// 参考 whu/news 武汉大学页面写成

const baseUrl = 'https://www.wfu.edu.cn';
const sizeTitle = '--潍坊学院新闻';

const catrgoryMap = {
    wyyw: ['/50/list.htm', '潍院要闻'],
    zhxw: ['/52/list.htm', '综合新闻'],
    xszh: ['/xszh/list.htm', '学术纵横'],
};

// 专门定义一个function用于加载文章内容
async function loadContent(link) {
    let description = '';

    let response;
    // 如果不是 大学的站点, 直接返回简单的标题即可
    // 判断 是否外站链接,如果是 则直接返回页面 不做单独的解析
    const https_reg = /^https:\/\/www.wfu.edu.cn(.*)/;
    if (!https_reg.test(link)) {
        return { description };
    }
    try {
        // 异步请求文章
        response = await got.get(link);
    } catch (error) {
        // 如果网络问题 直接出错
        if (error.name && (error.name === 'HTTPError' || error.name === 'RequestError' || error.name === 'FetchError')) {
            description = 'Page 404 Please Check!';
        }
        return { description };
    }
    // 加载文章内容
    const $ = load(response.data);

    // 提取文章内容
    description = $('div.wp_articlecontent').html();
    // 返回解析的结果
    return { description };
}

export const route: Route = {
    path: '/news/:type?',
    categories: ['university'],
    example: '/wfu/news/wyyw',
    parameters: { type: '分类，默认为 `wyyw`，具体参数见下表' },
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
            source: ['news.wfu.edu.cn/'],
            target: '/news',
        },
    ],
    name: '新闻',
    maintainers: ['cccht'],
    handler,
    url: 'news.wfu.edu.cn/',
    description: `| **内容** | **参数** |
| :------: | :------: |
| 潍院要闻 |   wyyw   |
| 综合新闻 |   zhxw   |
| 学术纵横 |   xszh   |`,
};

async function handler(ctx) {
    // 默认 潍院要闻 然后获取列表页面
    const type = ctx.req.param('type') ?? 'wyyw';
    const listPageUrl = baseUrl + catrgoryMap[type][0];
    const response = await got({
        method: 'get',
        url: listPageUrl,
        headers: {
            Referer: baseUrl,
        },
    });
    const $ = load(response.data);

    // 获取当前页面的 list
    const list = $('div[frag=窗口1]>ul>li');

    const result = await Promise.all(
        // 遍历每一篇文章
        list
            .map(async (item) => {
                const $ = load(list[item]); // 将列表项加载成 html
                const $item_url = 'https://www.wfu.edu.cn' + $('a').attr('href'); // 获取 每一项的url
                const $title = $('a>div.txt>h1').text(); // 获取每个的标题
                const $pubdate = timezone(parseDate($('a>div.txt>span.date').text().split('：')[1]), +8); // 获取发布时间

                // 列表上提取到的信息
                // 标题 链接
                const single = {
                    title: $title,
                    pubDate: $pubdate,
                    link: $item_url,
                    guid: $item_url,
                };

                // 对于列表的每一项, 单独获取 时间与详细内容

                const other = await cache.tryGet($item_url, () => loadContent($item_url));
                // 合并解析后的结果集作为该篇文章最终的输出结果
                return { ...single, ...other };
            })
            .get()
    );

    return {
        title: catrgoryMap[type][1] + sizeTitle,
        link: baseUrl,
        description: catrgoryMap[type][1] + sizeTitle,
        item: result,
    };
}
