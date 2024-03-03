// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const url = require('url');

const baseUrl = 'http://www.wsyu.edu.cn';

const typeMap = {
    xxyw: {
        name: '学校要闻',
        url: '/info/iList.jsp?cat_id=10307',
    },
    zhxw: {
        name: '综合新闻',
        url: '/info/iList.jsp?cat_id=10119',
    },
    mtjj: {
        name: '媒体聚焦',
        url: '/info/iList.jsp?cat_id=10120',
    },
};

export default async (ctx) => {
    const type = ctx.req.param('type') || 'xxyw';
    const link = baseUrl + typeMap[type].url;
    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: baseUrl,
        },
    });
    const $ = load(response.data);

    const urlList = $('.mainContent li')
        .slice(0, 10)
        .map((i, e) => $('a', e).attr('href'))
        .get();

    const titleList = $('.mainContent li')
        .slice(0, 10)
        .map((i, e) => $('a', e).text())
        .get();

    const dateList = $('.mainContent li')
        .slice(0, 10)
        .map((i, e) => $('span', e).text())
        .get();

    const out = await Promise.all(
        urlList.map(async (itemUrl, index) => {
            itemUrl = url.resolve(baseUrl, itemUrl);
            if (itemUrl.includes('.htm')) {
                const cacheIn = await cache.get(itemUrl);
                if (cacheIn) {
                    return JSON.parse(cacheIn);
                }
                const response = await got.get(itemUrl);
                const $ = load(response.data);
                $('.content .photos').remove();
                const single = {
                    title: titleList[index],
                    link: itemUrl,
                    description: $('.content').html(),
                    pubDate: dateList[index],
                };
                cache.set(itemUrl, JSON.stringify(single));
                return single;
            } else {
                const single = {
                    title: titleList[index],
                    link: itemUrl,
                    description: '此链接为文件，请点击下载',
                    pubDate: dateList[index],
                };
                return single;
            }
        })
    );

    ctx.set('data', {
        title: '武昌首义学院-' + typeMap[type].name,
        link,
        item: out,
    });
};
