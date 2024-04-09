const got = require('@/utils/got');
const cheerio = require('cheerio');

const generateItems = ($, timeframe) => {
    let selector;
    if (['week', 'rising', 'monthhonor'].includes(timeframe)) {
        selector = '.normal-recipe-list li';
    } else {
        selector = '.ias-container .pure-u';
    }

    return $(selector)
        .map(function () {
            const $item = $(this);
            const $link = $item.find('.name a');
            const title = $link.text();
            const link = `https://www.xiachufang.com${$link.attr('href')}`;
            const img = $item.find('.cover img').attr('data-src').replace(/\?.+/g, '');
            let desc = $item.find('.ing').text();
            if (!desc) {
                desc = $item.find('.desc').text().replace(/\n/g, '<br>');
            }

            return {
                title,
                link,
                description: `
                <img src="${img}" /><br>
                <strong>${title}</strong><br>
                ${desc}
            `,
            };
        })
        .get();
};

const fetchPage = (url) =>
    got({
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
        const author = $('.page-title').text().trim();

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
            week: '本周最受欢迎',
            rising: '新秀菜谱',
            monthhonor: '月度最佳',
        };
        let url;

        switch (timeframe) {
            case 'hot':
            case 'pop':
                url = `https://www.xiachufang.com/activity/site/?order=${timeframe}`;
                break;

            case 'rising':
            case 'monthhonor':
                url = `https://www.xiachufang.com/explore/${timeframe}/`;
                break;

            case 'week':
                url = 'https://www.xiachufang.com/explore/';
                break;

            default:
                url = 'https://www.xiachufang.com/activity/site/?order=';
        }

        const response = await fetchPage(url);
        const $ = cheerio.load(response.data);

        return {
            title: `下厨房-${mapper[timeframe]}`,
            link: url,
            item: generateItems($, timeframe),
        };
    },
};
