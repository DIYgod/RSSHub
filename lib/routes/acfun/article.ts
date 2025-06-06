import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import InvalidParameterError from '@/errors/types/invalid-parameter';

const baseUrl = 'https://www.acfun.cn';
const categoryMap = {
    184: {
        title: '二次元画师',
        realmId: 'realmId=18' + '&realmId=14' + '&realmId=51',
    },
    110: {
        title: '综合',
        realmId: 'realmId=5' + '&realmId=22' + '&realmId=28' + '&realmId=3' + '&realmId=4',
    },
    73: {
        title: '生活情感',
        realmId: 'realmId=50' + '&realmId=25' + '&realmId=34' + '&realmId=7' + '&realmId=6' + '&realmId=17' + '&realmId=1' + '&realmId=2' + '&realmId=49',
    },
    164: {
        title: '游戏',
        realmId: 'realmId=8' + '&realmId=53' + '&realmId=52' + '&realmId=11' + '&realmId=43' + '&realmId=44' + '&realmId=45' + '&realmId=46' + '&realmId=47',
    },
    74: {
        title: '动漫文化',
        realmId: 'realmId=13' + '&realmId=31' + '&realmId=48',
    },
    75: {
        title: '漫画文学',
        realmId: 'realmId=15' + '&realmId=23' + '&realmId=16',
    },
};
const sortTypeEnum = new Set(['createTime', 'lastCommentTime', 'hotScore']);
const timeRangeEnum = new Set(['all', 'oneDay', 'threeDay', 'oneWeek', 'oneMonth']);

export const route: Route = {
    path: '/article/:categoryId/:sortType?/:timeRange?',
    categories: ['anime'],
    view: ViewType.Articles,
    example: '/acfun/article/110',
    parameters: {
        categoryId: {
            description: '分区 ID',
            options: Object.keys(categoryMap).map((id) => ({ value: id, label: categoryMap[id].title })),
        },
        sortType: {
            description: '排序',
            options: [
                { value: 'createTime', label: '最新发表' },
                { value: 'lastCommentTime', label: '最新动态' },
                { value: 'hotScore', label: '最热文章' },
            ],
            default: 'createTime',
        },
        timeRange: {
            description: '时间范围，仅在排序是 `hotScore` 有效',
            options: [
                { value: 'all', label: '时间不限' },
                { value: 'oneDay', label: '24 小时' },
                { value: 'threeDay', label: '三天' },
                { value: 'oneWeek', label: '一周' },
                { value: 'oneMonth', label: '一个月' },
            ],
            default: 'all',
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '文章',
    maintainers: ['TonyRL'],
    handler,
    description: `| 二次元画师 | 综合 | 生活情感 | 游戏 | 动漫文化 | 漫画文学 |
| ---------- | ---- | -------- | ---- | -------- | -------- |
| 184        | 110  | 73       | 164  | 74       | 75       |

| 最新发表   | 最新动态        | 最热文章 |
| ---------- | --------------- | -------- |
| createTime | lastCommentTime | hotScore |

| 时间不限 | 24 小时 | 三天     | 一周    | 一个月   |
| -------- | ------- | -------- | ------- | -------- |
| all      | oneDay  | threeDay | oneWeek | oneMonth |`,
};

async function handler(ctx) {
    const { categoryId, sortType = 'createTime', timeRange = 'all' } = ctx.req.param();
    if (!categoryMap[categoryId]) {
        throw new InvalidParameterError(`Invalid category Id: ${categoryId}`);
    }
    if (!sortTypeEnum.has(sortType)) {
        throw new InvalidParameterError(`Invalid sort type: ${sortType}`);
    }
    if (!timeRangeEnum.has(timeRange)) {
        throw new InvalidParameterError(`Invalid time range: ${timeRange}`);
    }

    const url = `${baseUrl}/v/list${categoryId}/index.htm`;
    const response = await got.post(
        `${baseUrl}/rest/pc-direct/article/feed` +
            '?cursor=first_page' +
            '&onlyOriginal=false' +
            '&limit=10' +
            `&sortType=${sortType}` +
            `&timeRange=${sortType === 'hotScore' ? timeRange : 'all'}` +
            `&${categoryMap[categoryId].realmId}`,
        {
            headers: {
                referer: url,
            },
        }
    );

    const list = response.data.data.map((item) => ({
        title: item.title,
        link: `${baseUrl}/a/ac${item.articleId}`,
        author: item.userName,
        pubDate: parseDate(item.createTime, 'x'),
        category: item.realmName,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link, {
                    headers: {
                        referer: url,
                    },
                });
                const $ = load(response.data);
                const articleInfo = $('.main script')
                    .text()
                    .match(/window.articleInfo = (.*);\n\s*window.likeDomain/)[1];
                const data = JSON.parse(articleInfo);

                item.description = data.parts[0].content;
                if (data.tagList) {
                    item.category = [item.category, ...data.tagList.map((tag) => tag.name)];
                }

                return item;
            })
        )
    );

    return {
        title: categoryMap[categoryId].title,
        link: url,
        item: items,
    };
}
