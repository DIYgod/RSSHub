import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?',
    name: '线板酷',
    url: 'new.xianbao.fun',
    maintainers: ['nashi23'],
    handler,
    example: '/xianbao',
    parameters: { category: '类别id，默认为：latest' },
    description: `
| 分类         | id             |
| ------------ | -------------- |
| 最新         | latest         |
| 赚客吧       | zuankeba       |
| 赚客吧热帖   | zuankeba-hot   |
| 新赚吧       | xinzuanba      |
| 新赚吧热帖   | xinzuanba-hot  |
| 微博         | weibo          |
| 微博热帖     | weibo-hot      |
| 豆瓣线报     | douban         |
| 豆瓣热帖     | douban-hot     |
| 酷安         | kuan           |
| 小嘀咕       | xiaodigu       |
| 葫芦侠       | huluxia        |
| 小刀娱乐网   | xiadao         |
| 技术QQ网     | qqjishu        |
| YYOK大全     | yyok           |
| 活动资讯网   | huodong        |
| 免费赚钱中心 | mianfei        |
| 一小时       | yixiaoshi      |
| 三小时       | sanxiaoshi     |
| 六小时       | liuxiaoshi     |
| 十二小时     | shierxiaoshi   |
| 二十四小时   | ershisixiaoshi |
| 四十八小时   | sishibaxiaoshi |
| 今天         | jintian        |
| 昨天         | zuotian        |
| 前天         | qiantian       |
| 三天         | santian        |
| 五天         | wutian         |
| 七天         | qitian         |
| 十五天       | shiwutian      |`,
    categories: ['shopping'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['new.xianbao.fun'],
            target: '/',
        },
    ],
};

async function handler(ctx) {
    const categoryParam = ctx.req.param() || { category: 'latest' };

    let urlPath = '';

    const category = categoryParam.category || 'latest';

    const cat = CATEGORIES.find((cat) => cat.id === category) || CATEGORIES.find((cat) => cat.id === 'latest');
    const fullName = cat!.fullName;
    const pushPath = cat!.pushPath;

    if (category.endsWith('xiaoshi') || category.endsWith('tian')) {
        urlPath = `${category}-hot.html`;
    } else if (category.endsWith('hot')) {
        urlPath = `${category}.html`;
    } else {
        urlPath = category === 'latest' ? '' : `category-${category}`;
    }

    const apiUrl = `http://new.xianbao.fun/plus/json/${pushPath}.json`;
    const response = await got(apiUrl);
    const responseData = JSON.parse(response.body);

    let parsedData;
    if (Array.isArray(responseData)) {
        parsedData = responseData;
    } else {
        const hotKey = Object.keys(responseData).find((key) => key.startsWith('remen'));
        parsedData = responseData[hotKey];
    }

    const items = parsedData.map((item) => ({
        title: item.title,
        link: `http://new.xianbao.fun${item.url}`,
        description: item.content,
        pubDate: parseDate(item.shijianchuo * 1000),
        author: item.louzhu,
        category: item.catename,
    }));

    return {
        title: `线板酷-${fullName}`,
        link: `http://new.xianbao.fun/${urlPath}`,
        item: items,
    };
}

const CATEGORIES = [
    { id: 'latest', fullName: '最新', pushPath: 'push' },
    { id: 'yixiaoshi', fullName: '一小时', pushPath: 'rank/yixiaoshi' },
    { id: 'sanxiaoshi', fullName: '三小时', pushPath: 'rank/sanxiaoshi' },
    { id: 'liuxiaoshi', fullName: '六小时', pushPath: 'rank/liuxiaoshi' },
    { id: 'shierxiaoshi', fullName: '十二小时', pushPath: 'rank/shierxiaoshi' },
    { id: 'ershisixiaoshi', fullName: '二十四小时', pushPath: 'rank/ershisixiaoshi' },
    { id: 'sishibaxiaoshi', fullName: '四十八小时', pushPath: 'rank/sishibaxiaoshi' },
    { id: 'jintian', fullName: '今天', pushPath: 'rank/jintian' },
    { id: 'zuotian', fullName: '昨天', pushPath: 'rank/zuotian' },
    { id: 'qiantian', fullName: '前天', pushPath: 'rank/qiantian' },
    { id: 'santian', fullName: '三天', pushPath: 'rank/santian' },
    { id: 'wutian', fullName: '五天', pushPath: 'rank/wutian' },
    { id: 'qitian', fullName: '七天', pushPath: 'rank/qitian' },
    { id: 'shiwutian', fullName: '十五天', pushPath: 'rank/shiwutian' },
    { id: 'zuankeba', fullName: '赚客吧', pushPath: 'push_16' },
    { id: 'zuankeba-hot', fullName: '赚客吧热帖', pushPath: 'rank/zuankeba-hot' },
    { id: 'xinzuanba', fullName: '新赚吧', pushPath: 'push_18' },
    { id: 'xinzuanba-hot', fullName: '新赚吧热帖', pushPath: 'rank/xinzuanba-hot' },
    { id: 'weibo', fullName: '微博', pushPath: 'push_10' },
    { id: 'weibo-hot', fullName: '微博热帖', pushPath: 'rank/weibo-hot' },
    { id: 'douban', fullName: '豆瓣线报', pushPath: 'push_23' },
    { id: 'douban-hot', fullName: '豆瓣热帖', pushPath: 'rank/douban-hot' },
    { id: 'kuan', fullName: '酷安', pushPath: 'push_17' },
    { id: 'xiaodigu', fullName: '小嘀咕', pushPath: 'push_11' },
    { id: 'huluxia', fullName: '葫芦侠', pushPath: 'push_20' },
    { id: 'xiadao', fullName: '小刀娱乐网', pushPath: 'push_3' },
    { id: 'qqjishu', fullName: '技术QQ网', pushPath: 'push_6' },
    { id: 'yyok', fullName: 'YYOK大全', pushPath: 'push_7' },
    { id: 'huodong', fullName: '活动资讯网', pushPath: 'push_8' },
    { id: 'mianfei', fullName: '免费赚钱中心', pushPath: 'push_9' },
];
