import { createDecipheriv } from 'node:crypto';

import dayjs from 'dayjs';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import { config } from '@/config';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import playwright from '@/utils/playwright';
import timezone from '@/utils/timezone';

// Parameters
const CACHE_MAX_AGE = config.cache.contentExpire;
const DEFAULT_FETCH_DURATION_MONTH = 6; // fetch data 6 month from now

// Fetch Data
const getMultiKeywordHotTrend = async (page, keyword, start_date, end_date, app_name = 'aweme') => {
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
                req.addEventListener('readystatechange', () => {
                    if (req.readyState === 4 && req.status === 200) {
                        resolve(req.responseText);
                    } else {
                        return;
                    }
                });
                req.send(e.data);
            });
            return p;
        }
        return Promise.resolve(queryData()).then((result) => result);
    }, e);
    return res[0];
};

// Decrypt Data
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
const searchLinkUrls = (keyword) => [
    `https://tophub.today/search?e=tophub&q=${keyword}`,
    `https://www.baidu.com/s?wd=${keyword}`,
    `https://www.google.com/search?q=${keyword}`,
    `https://m.zhihu.com/search?type=content&q=${keyword}`,
    `https://s.weibo.com/weibo/${keyword}`,
    `https://www.douyin.com/search/${keyword}`,
    `https://so.toutiao.com/search?keyword=${keyword}`,
];

const searchLinkNames = ['今日热榜', '百度', '谷歌', '知乎', '微博', '抖音', '头条'];

const createContent = (keyword, queryList, queryListText) =>
    renderToString(
        <OceanengineContent
            keyword={keyword}
            queryListText={queryListText}
            queries={queryList.map((query) => ({
                links: searchLinkUrls(encodeURIComponent(query)).map((url, index) => `<a href="${url}" rel="noopener noreferrer" target="_blank">${searchLinkNames[index]}</a>`),
                key: query,
            }))}
        />
    );

export const route: Route = {
    path: '/index/:keyword/:channel?',
    name: 'Unknown',
    maintainers: ['Jkker'],
    handler,
};

async function handler(ctx) {
    const now = dayjs();
    const start_date = now.subtract(DEFAULT_FETCH_DURATION_MONTH, 'month').format('YYYYMMDD');
    const end_date = now.format('YYYYMMDD');
    const keyword = ctx.req.param('keyword');
    if (!keyword) {
        throw new InvalidParameterError('Invalid keyword');
    }
    if (ctx.req.param('channel') && !['douyin', 'toutiao'].includes(ctx.req.param('channel'))) {
        throw new InvalidParameterError('Invalid channel。 Only support `douyin` or `toutiao`');
    }

    const channel = ctx.req.param('channel') === 'toutiao' ? 'toutiao' : 'aweme'; // default channel is `douyin`
    const channelName = ctx.req.param('channel') === 'toutiao' ? '头条' : '抖音';

    const link = `https://trendinsight.oceanengine.com/arithmetic-index/analysis?keyword=${keyword}&appName=${channel}`;

    const item = await cache.tryGet(
        link,
        async () => {
            const browser = await playwright();
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                request.resourceType() === 'document' || request.resourceType() === 'script' || request.resourceType() === 'xhr' ? request.continue() : request.abort();
            });
            await page.goto('https://trendinsight.oceanengine.com/arithmetic-index');
            const res = await getMultiKeywordHotTrend(page, keyword, start_date, end_date, channel);
            await browser.close();

            const rawData = JSON.parse(res).data;
            const data = decrypt(rawData).hot_list[0];

            const searchAverage = Number.parseInt(data.average.search_average);

            return data.search_top_point_list.map(({ date, query_list }) => {
                const searchIndex = Number.parseInt(data.search_hot_list.find((listItem) => listItem.datetime === date).index);
                const relativePercent = Math.round(((searchIndex - searchAverage) / searchAverage) * 100);
                const icon = relativePercent > 0 ? '📈' : '📉';

                const uniqueQueryList = query_list.filter((query) => query !== keyword);
                const uniqueQueryListStr = uniqueQueryList.join(', ');

                const content = createContent(keyword, [keyword, ...uniqueQueryList], uniqueQueryListStr);

                return {
                    title: `${icon} ${keyword} ${relativePercent}% | ${uniqueQueryListStr}`,
                    author: `巨量算数 - ${channelName}算数指数`,
                    description: content,
                    link,
                    pubDate: timezone(parseDate(date), +8),
                    guid: `巨量算数 - ${channelName}算数指数 | ${keyword} - ${date}`,
                };
            });
        },
        CACHE_MAX_AGE,
        false
    );

    return {
        title: `${keyword} - ${channelName}指数波峰`,
        link,
        description: `巨量算数 - ${channelName}算数指数 | 关键词: ${keyword}`,
        language: 'zh-cn',
        item,
    };
}

const OceanengineContent = ({ queryListText, queries }: { queryListText: string; queries: Array<{ key: string; links: string[] }> }) => (
    <article>
        <h2>关键词: </h2>
        {queryListText}
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <br />
        {queries.map((query) => (
            <>
                <h2>{query.key}</h2>
                <p>
                    {query.links.map((link) => (
                        <>{raw(link)}&nbsp;&nbsp;</>
                    ))}
                </p>
            </>
        ))}
    </article>
);
