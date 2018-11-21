const axios = require('../../../utils/axios');
const { load } = require('cheerio');
const { resolve } = require('url');

const base = 'http://sdcs.sysu.edu.cn/';

module.exports = async (ctx) => {
    const { data } = await axios.get('http://sdcs.sysu.edu.cn/');
    const $ = load(data);

    const urls = $('.view-content li > a')
        .map((_, ele) => $(ele).attr('href'))
        .toArray()
        .map((path) => path.match(/\/content\/(\d+)/)[1]) // extract article-id
        .sort()
        .reverse() // sort by article-id (or to say, date), latest first
        .map((aid) => resolve(base, `/content/${aid}`));

    ctx.state.data = {
        title: '中山大学 - 数据科学与计算机学院',
        link: 'http://sdcs.sysu.edu.cn/',
        description: '中山大学 - 数据科学与计算机学院',
        item: await getDetails(ctx.cache, urls),
    };
};

const getDetails = (cache, urls) => Promise.all(urls.map((url) => cache.tryGet(url, () => getDetail(url))));

const timezone = 8;
const serverOffset = new Date().getTimezoneOffset() / 60;
const shiftTimezone = (date) => new Date(date.getTime() - 60 * 60 * 1000 * (timezone + serverOffset)).toUTCString();

const getDetail = async (url) => {
    const { data } = await axios.get(url);
    const $ = load(data);

    // transforming images
    $('.content img').each((_, ele) => {
        $(ele).attr('referrerpolicy', 'no-referrer');
        $(ele).attr('src', resolve(base, $(ele).attr('src')));
    });

    return {
        title: $('section > h1').text(),
        description: $('.content').html(),
        link: url,
        pubDate: shiftTimezone(
            new Date(
                $('.submitted-by')
                    .text()
                    .match(/(\d+\/\d+\/\d+)/)[1]
            )
        ),
    };
};
