const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

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
const sortTypeEnum = ['createTime', 'lastCommentTime', 'hotScore'];
const timeRangeEnum = ['all', 'oneDay', 'threeDay', 'oneWeek', 'oneMonth'];

module.exports = async (ctx) => {
    const { categoryId, sortType = 'createTime', timeRange = 'all' } = ctx.params;
    if (!categoryMap[categoryId]) {
        throw `Invalid category Id: ${categoryId}`;
    }
    if (!sortTypeEnum.includes(sortType)) {
        throw `Invalid sort type: ${sortType}`;
    }
    if (!timeRangeEnum.includes(timeRange)) {
        throw `Invalid time range: ${timeRange}`;
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
            ctx.cache.tryGet(item.link, async () => {
                const response = await got(item.link, {
                    headers: {
                        referer: url,
                    },
                });
                const $ = cheerio.load(response.data);
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

    ctx.state.data = {
        title: categoryMap[categoryId].title,
        link: url,
        item: items,
    };
};
