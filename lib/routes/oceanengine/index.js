const dayjs = require('dayjs');
const template = require('art-template');
template.defaults.minimize = true;
dayjs.extend(require('dayjs/plugin/utc'));
dayjs.extend(require('dayjs/plugin/timezone'));
const parseDate = (date) => dayjs.tz(date, 'Asia/Shanghai').toDate();

// Parameters
const CACHE_MAX_AGE = 60 * 60 * 6; // 6 hours
const DEFAULT_FETCH_DURATION_MONTH = 6; // fetch data 6 month from now

// Fetch Data
const get_multi_keyword_hot_trend = async (page, keyword, start_date, end_date, app_name = 'aweme') => {
    const e = {
        url: 'https://trendinsight.oceanengine.com/api/open/index/get_multi_keyword_hot_trend',
        method: 'POST',
        data: JSON.stringify({ keyword_list: [keyword], start_date, end_date, app_name }),
    };

    const res = await page.evaluate((e) => {
        function queryData() {
            const p = new Promise((resolve) => {
                const req = new XMLHttpRequest();
                req.open(e.method, e.url, true);
                req.setRequestHeader('accept', 'application/json, text/plain, */*');
                req.setRequestHeader('content-type', 'application/json;charset=UTF-8');
                req.setRequestHeader('tea-uid', '7054893410171930123');
                req.onreadystatechange = function () {
                    if (req.readyState === 4 && req.status === 200) {
                        resolve(req.responseText);
                    } else {
                        return;
                    }
                };
                req.send(e.data);
            });
            return p;
        }
        return Promise.all([queryData()]).then((result) => result);
    }, e);
    return res[0];
};

// Decrypt Data
const { createDecipheriv } = require('node:crypto');
const key = 'anN2bXA2NjYsamlh';
const iv = 'amlheW91LHFpYW53';
const algorithm = 'aes-128-cfb';
const decrypt = (rawData) => {
    const encrypted = Buffer.from(rawData, 'base64').toString('hex');
    const decipher = createDecipheriv(algorithm, key, iv);
    const decrypted = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
    return JSON.parse(decrypted);
};

// Generate Feed
const search_link_urls = (keyword) => [
    `https://tophub.today/search?e=tophub&q=${keyword}`,
    `https://www.baidu.com/s?wd=${keyword}`,
    `https://www.google.com/search?q=${keyword}`,
    `https://m.zhihu.com/search?type=content&q=${keyword}`,
    `https://s.weibo.com/weibo/${keyword}`,
    `https://www.douyin.com/search/${keyword}`,
    `https://so.toutiao.com/search?keyword=${keyword}`,
];

const search_link_names = ['今日热榜', '百度', '谷歌', '知乎', '微博', '抖音', '头条'];

const create_content = (keyword, queryList, queryListText) =>
    template(__dirname + '/item-content.art', {
        keyword,
        queryListText,
        queries: queryList.map((query) => ({
            links: search_link_urls(encodeURIComponent(query)).map((url, index) => `<a href="${url}" rel="noopener noreferrer" target="_blank">${search_link_names[index]}</a>`),
            key: query,
        })),
    });

module.exports = async (ctx) => {
    const now = dayjs();
    const start_date = now.subtract(DEFAULT_FETCH_DURATION_MONTH, 'month').format('YYYYMMDD');
    const end_date = now.format('YYYYMMDD');
    const keyword = ctx.params.keyword;
    if (!keyword) {
        throw Error('Invalid keyword');
    }
    if (ctx.params.channel && !['douyin', 'toutiao'].includes(ctx.params.channel)) {
        throw Error('Invalid channel。 Only support `douyin` or `toutiao`');
    }

    const channel = ctx.params.channel === 'douyin' ? 'aweme' : 'toutiao';
    const channelName = ctx.params.channel === 'douyin' ? '抖音' : '头条';

    const link = `https://trendinsight.oceanengine.com/arithmetic-index/analysis?keyword=${keyword}&appName=${channel}`;

    const item = await ctx.cache.tryGet(
        link,
        async () => {
            const browser = await require('@/utils/puppeteer')();
            const page = await browser.newPage();
            await page.goto('https://trendinsight.oceanengine.com/arithmetic-index');
            const res = await get_multi_keyword_hot_trend(page, keyword, start_date, end_date, channel);
            browser.close();

            const rawData = JSON.parse(res).data;
            const data = decrypt(rawData).hot_list[0];

            const search_top_point_list = data.search_top_point_list;
            const search_hot_list = data.search_hot_list;
            const search_average = parseInt(data.average.search_average);

            return search_top_point_list.map(({ date, query_list }) => {
                const search_index = parseInt(search_hot_list.find((listItem) => listItem.datetime === date).index);
                const relative_percent = Math.round(((search_index - search_average) / search_average) * 100);
                const icon = relative_percent > 0 ? '📈' : '📉';

                const uniqueQueryList = query_list.filter((query) => query !== keyword);
                const uniqueQueryListStr = uniqueQueryList.join(', ');

                const content = create_content(keyword, uniqueQueryList, uniqueQueryListStr);

                return {
                    title: `${icon} ${keyword} ${relative_percent}% | ${uniqueQueryListStr}`,
                    author: `巨量算数 - ${channelName}算数指数`,
                    description: content,
                    link,
                    pubDate: parseDate(date),
                    guid: `巨量算数 - ${channelName}算数指数 | ${keyword} - ${date}`,
                };
            });
        },
        CACHE_MAX_AGE
    );

    ctx.state.data = {
        title: `${keyword} - ${channelName}热搜`,
        link,
        description: `巨量算数 - ${channelName}算数指数 | 关键词: ${keyword}`,
        language: 'zh-cn',
        item,
    };
};
