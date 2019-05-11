const cheerio = require('cheerio');
const axios = require('../../utils/axios');
const url = require('url');

const host = 'https://user.guancha.cn';

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const link = `https://user.guancha.cn/topic/attention-topic?follow-topic-id=${id}`;
    const res = await axios.get(encodeURI(link));
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
            const res = await axios.get(absoluteUrl);
            const $ = cheerio.load(res.data);

            const item = {
                title: $('.article-content h1').text(),
                author: $('.user-main h4')
                    .first()
                    .find('a')
                    .text(),
                link: absoluteUrl,
                description: $('.article-txt-content').html(),
                pubDate: $('.user-main .time1').text(),
            };
            const cache = await ctx.cache.get(absoluteUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            ctx.cache.set(absoluteUrl, JSON.stringify(item), 24 * 60 * 60);

            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: `风闻话题-${title}`,
        link: link,
        item: out,
    };
};
