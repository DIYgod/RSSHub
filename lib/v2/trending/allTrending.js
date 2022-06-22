const dayjs = require('dayjs');
dayjs.extend(require('dayjs/plugin/utc'));
dayjs.extend(require('dayjs/plugin/timezone'));
const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');
const config = require('@/config').value;
const md5 = require('@/utils/md5');

// Constants
const DATA_REPO_BASE_URL = 'https://raw.githubusercontent.com/huqi-pr/trending-in-one/master/raw';
const DATE_FORMAT = 'YYYY-MM-DD';
// TODO: support custom data repo urls
const CHANNELS = {
    'toutiao-search': {
        baseUrl: 'https://so.toutiao.com/search?keyword=',
        name: '今日头条热搜',
    },
    'weibo-search': {
        baseUrl: 'https://s.weibo.com/weibo?q=',
        name: '微博热搜',
    },
    'zhihu-search': {
        baseUrl: 'https://www.zhihu.com/search?q=',
        name: '知乎热搜',
    },
    'zhihu-questions': {
        baseUrl: 'https://www.zhihu.com/search?type=question&q=',
        name: '知乎热门话题',
    },
    'zhihu-video': {
        baseUrl: 'https://www.zhihu.com/search?type=video&q=',
        name: '知乎热门视频',
    },
};

// Helper Functions
// TODO: integrate into CHANNELS
const processRawDataByChannel = {
    'toutiao-search': ({ word: title }) => ({
        // 源 url 存在 encoding 问题，暂时不使用
        url: CHANNELS['toutiao-search'].baseUrl + encodeURIComponent(title),
        title,
    }),
    'weibo-search': ({ title }) => ({
        // 源 url 存在 encoding 问题，暂时不使用
        url: CHANNELS['weibo-search'].baseUrl + encodeURIComponent(title),
        title,
    }),
    'zhihu-questions': (item) => item,
    'zhihu-search': ({ query }) => {
        const title = query.trim();
        return {
            // 源 url 存在 encoding 问题，暂时不使用
            url: CHANNELS['zhihu-search'].baseUrl + encodeURIComponent(title),
            title,
        };
    },
    'zhihu-video': (item) => item,
};

const hasKeyword = (str, keywordList) => keywordList.some((keyword) => str.includes(keyword));
const toShanghaiTimezone = (date) => dayjs.tz(date, 'Asia/Shanghai');

// Data Fetcher
// TODO: support channel selection
const fetchAllData = async (keywordList = [], dateList = [], cache) => {
    const cachedGetData = (url, dataMappingFn) =>
        cache.tryGet(
            url,
            () =>
                got(url)
                    .json()
                    // Normalize data to { title, url } format
                    .then((res) => res.map((item) => dataMappingFn(item))),
            config.cache.contentExpire,
            false
        );

    const data = await Promise.all(
        dateList.map(async (dateTime) => ({
            dateTime,
            data: await Promise.all(
                Object.keys(CHANNELS).map(async (channel) => ({
                    name: CHANNELS[channel].name,
                    data: await cachedGetData(`${DATA_REPO_BASE_URL}/${channel}/${dateTime.format(DATE_FORMAT)}.json`, processRawDataByChannel[channel]).then((res) => res.filter(({ title }) => hasKeyword(title, keywordList))),
                }))
            ),
        }))
    );
    for (const i of data) {
        i.count = i.data.reduce((acc, { data }) => acc + data.length, 0);
    }

    return data.filter(({ count }) => count > 0);
};

// Generate Feed Items
const searchLinkUrls = (keyword) => [
    `https://tophub.today/search?e=tophub&q=${keyword}`,
    `https://www.baidu.com/s?wd=${keyword}`,
    `https://www.google.com/search?q=${keyword}`,
    `https://www.zhihu.com/search?type=content&q=${keyword}`,
    `https://s.weibo.com/weibo/${keyword}`,
    `https://www.douyin.com/search/${keyword}`,
    `https://so.toutiao.com/search?keyword=${keyword}`,
];

const searchLinkNames = ['热榜', '百度', '谷歌', '知乎', '微博', '抖音', '头条'];

const createItem = ({ dateTime, data, count }, keywords, isToday) => {
    const EOD = dateTime.endOf('day');
    const pubDate = isToday ? new Date() : EOD.toDate();
    return {
        title: `${keywords.join(', ')} | ${dateTime.format(DATE_FORMAT)} 热点追踪 (${count})`,
        author: 'Trending All In One',
        pubDate,
        description: art(path.join(__dirname, 'templates/content.art'), {
            data,
            queries: keywords.map((query) => ({
                links: searchLinkUrls(encodeURIComponent(query)).map((url, index) => `<a href="${url}" rel="noopener noreferrer" target="_blank">${searchLinkNames[index]}</a>`),
                key: query,
            })),
        }),
        guid: `trending-all-in-one-${EOD.toISOString()}-${md5(JSON.stringify(data))}-${keywords.join('-')}`,
    };
};

// Main
module.exports = async (ctx) => {
    // Prevent making over 100 requests per invocation
    if (ctx.params.numberOfDays > 14) {
        throw new Error('days must be less than 14');
    }
    const numberOfDays = ctx.params.numberOfDays || 3;
    const currentShanghaiDateTime = dayjs(toShanghaiTimezone(new Date()));
    const currentShanghaiDateStr = currentShanghaiDateTime.format(DATE_FORMAT);
    const dateList = [];
    for (let i = 0; i < numberOfDays; i++) {
        const d = currentShanghaiDateTime.subtract(i, 'day');
        dateList.push(d);
    }

    const keywordList = ctx.params.keywords
        .replace('，', ',')
        .split(',')
        .map((keyword) => keyword.trim());
    const keywordStr = keywordList.join(', ');

    const data = await fetchAllData(keywordList, dateList, ctx.cache);
    const item =
        data.length > 0
            ? data.map((i, index) => createItem(i, keywordList, index === 0))
            : [
                  {
                      title: `${keywordStr} | ${currentShanghaiDateStr} 热点追踪 (0)`,
                      author: 'Trending All In One',
                      description: `近${numberOfDays}日的热搜都不包含下列关键词：${keywordStr}<br>请耐心等待，或添加更多关键词试试。`,
                      guid: `trending-all-in-one-${md5(JSON.stringify(data))}-${keywordList.join('-')}`,
                  },
              ];

    ctx.state.data = {
        title: `${keywordStr} | 热点聚合`,
        description: `${keywordStr} | 今日头条热搜，知乎热门视频，知乎热搜榜，知乎热门话题，微博热搜榜聚合追踪`,
        language: 'zh-cn',
        item,
    };
};
