const axios = require('../../utils/axios');
const cheerio = require('cheerio');

const generateItems = ($) =>
    $('.ias-container .pure-u')
        .map(function() {
            const $item = $(this);
            const $link = $item.find('.name a');
            const title = $link.text();
            const link = `https://www.xiachufang.com${$link.attr('href')}`;
            const desc = $item
                .find('.desc')
                .text()
                .replace(/\n/g, '<br>');
            const img = $item
                .find('.cover img')
                .attr('data-src')
                .replace(/\?.+/g, '');

            return {
                title,
                link,
                description: `
        <img referrerpolicy="no-referrer" src="${img}" /><br>
        <strong>${title}</strong><br>
        ${desc}
      `,
            };
        })
        .get();

const fetchPage = (url) =>
    axios({
        method: 'get',
        url,
        headers: {
            Referer: url,
        },
    });

module.exports = {
    async generateUserData({ id = 0, path = 'created' }) {
        const url = `https://www.xiachufang.com/cook/${id}/${path}/`;
        const response = await fetchPage(url);

        const $ = cheerio.load(response.data);
        const author = $('.page-title')
            .text()
            .trim();

        return {
            title: `下厨房-${author}`,
            link: url,
            item: generateItems($),
        };
    },

    async generatePopularData(timeframe = '') {
        const mapper = {
            '': '最新上传',
            hot: '正在流行',
            pop: '24小时最佳',
        };
        const url = `https://www.xiachufang.com/activity/site/?order=${timeframe}`;
        const response = await fetchPage(url);
        const $ = cheerio.load(response.data);

        return {
            title: `下厨房-${mapper[timeframe]}`,
            link: url,
            item: generateItems($),
        };
    },
};
