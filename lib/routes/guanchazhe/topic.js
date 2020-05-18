const cheerio = require('cheerio');
const got = require('@/utils/got');
const date = require('@/utils/date');
const url = require('url');

const host = 'https://user.guancha.cn';

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const link = `https://user.guancha.cn/topic/attention-topic?follow-topic-id=${id}`;
    const res = await got.get(encodeURI(link));
    const $ = cheerio.load(res.data);
    // 话题名称
    const title = $('.topic-main').text();
    // 文章列表
    const list = $('.article-list .list-item h4')
        .find('a')
        .map((i, e) => $(e).attr('href'))
        .get();

    const out = await Promise.all(
        list.map(async (itemUrl) => {
            // 将相对链接替换为绝对链接
            const absoluteUrl = url.resolve(host, itemUrl);
            const cache = await ctx.cache.get(absoluteUrl);
            // 判断缓存
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const res = await got.get(absoluteUrl);
            const $ = cheerio.load(res.data);

            const dateStr = $('.user-main .time1').text();
            const item = {
                title: $('.article-content h1').text(),
                author: $('.user-main h4').first().find('a').text(),
                link: absoluteUrl,
                description: $('.article-txt-content').html(),
                // 格式化日期
                pubDate: date(dateStr),
            };
            ctx.cache.set(absoluteUrl, JSON.stringify(item));

            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: `风闻话题-${title}`,
        link: link,
        item: out,
    };
};
