// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';
import timezone from '@/utils/timezone';

const rootUrl = 'http://www.mztoday.gov.cn';
const basicInfoDict = {
    zx: {
        name: '最新',
        url: '/news.html?page=1',
    },
    tj: {
        name: '推荐',
        url: '/list/42.html?page=1',
    },
    sz: {
        name: '时政',
        url: '/list/39.html?page=1',
    },
    jy: {
        name: '教育',
        url: '/list/40.html?page=1',
    },
    ms: {
        name: '民生',
        url: '/list/41.html?page=1',
    },
    wl: {
        name: '文旅',
        url: '/list/41.html?page=1',
    },
    jj: {
        name: '经济',
        url: '/list/53.html?page=1',
    },
    wwcj: {
        name: '文明创建',
        url: '/list/54.html?page=1',
    },
    bxsh: {
        name: '文明创建',
        url: '/list/55.html?page=1',
    },
    bm: {
        name: '部门',
        url: '/list/56.html?page=1',
    },
    zj: {
        name: '镇（街道）',
        url: '/list/57.html?page=1',
    },
    jkmz: {
        name: '健康绵竹',
        url: '/list/59.html?page=1',
    },
    nxjt: {
        name: '南轩讲堂',
        url: '/list/70.html?page=1',
    },
    sp: {
        name: '视频',
        url: '/vlist.html?page=1',
    },
    wmsj: {
        name: '文明实践',
        url: '/list/71.html?page=1',
    },
    lhzg: {
        name: '领航中国',
        url: '/list/74.html?page=1',
    },
    mznh: {
        name: '绵竹年画',
        url: '/list/36.html?page=1',
    },
    mzls: {
        name: '绵竹历史',
        url: '/list/16.html?page=1',
    },
    mzly: {
        name: '绵竹旅游',
        url: '/list/37.html?page=1',
    },
    wwkmz: {
        name: '外媒看绵竹',
        url: '/list/50.html?page=1',
    },
};

const getInfoUrlList = async (url) => {
    const response = await got(url);
    const $ = load(response.data);
    const infoList = $('div.sl')
        .toArray()
        .map((item) => ({
            title: $('a', item).attr('title'),
            url: `${rootUrl}${$('a', item).attr('href')}`,
            pubDate: parseDate(timezone($('div > div:nth-child(4)', item).html().trim()), +8),
        }));
    return infoList;
};

// 获取信息正文内容
const getInfoContent = (item) =>
    cache.tryGet(item.url, async () => {
        const response = await got(item.url);
        const $ = load(response.data);
        return {
            title: item.title,
            content: $('td:nth-child(2)').html(),
            link: item.url,
            pubDate: item.pubDate,
        };
    });

export default async (ctx) => {
    const infoType = ctx.req.param('infoType') || 'zx';
    const infoBasicUrl = `${rootUrl}${basicInfoDict[infoType].url}`;
    const infoUrlList = await getInfoUrlList(infoBasicUrl);
    const items = await Promise.all(infoUrlList.map((item) => getInfoContent(item)));

    ctx.set('data', {
        title: `今日绵竹-${basicInfoDict[infoType].name}`,
        link: `${infoBasicUrl}1`,
        item: items.map((item) => ({
            title: item.title,
            description: art(path.join(__dirname, './templates/mztoday.art'), { item }),
            link: item.link,
            pubDate: item.pubDate,
        })),
    });
};
