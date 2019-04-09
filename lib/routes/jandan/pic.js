const axios = require('../../utils/axios');
const cheerio = require('cheerio');

const base64_decode = (i) => Buffer.from(i, 'base64').toString('binary');

// jandan_decode is borrowed from jandan.net, which is used in function jandan_load_img.
const jandan_decode = (m) => base64_decode(m);
const baseUrl = 'http://jandan.net/';

module.exports = async (ctx) => {
    const { sub_model } = ctx.params;

    const response = await axios({
        method: 'get',
        url: `${baseUrl}${sub_model}/`,
        headers: {
            Referer: 'http://jandan.net',
        },
    });

    const $ = cheerio.load(response.data);
    const items = [];
    $('.commentlist > li').each((_, item) => {
        // Get current comment id, if comment_id is 'adsense', just need to skip..
        const comment_id = $(item).attr('id');
        if (comment_id === 'adsense') {
            return;
        }

        // Get current comment's link.
        const link = `https://jandan.net${$(item)
            .find('.righttext')
            .find('a')
            .attr('href')}`;

        const imgList = [];
        $(item)
            .find('.text .img-hash')
            .each((_, item) => {
                const imgUrl = $(item).html();

                if (imgUrl !== undefined) {
                    imgList.push(jandan_decode(imgUrl).replace(/(\/\/\w+\.sinaimg\.cn\/)(\w+)(\/.+\.(gif|jpg|jpeg))/, '$1large$3'));
                }
            });
        if (imgList.length === 0) {
            return;
        }

        $(item)
            .find('.img-hash')
            .remove();
        const text =
            $(item)
                .find('.text p')
                .text() || '';

        // TODO: should load user's comments.

        items.push({
            guid: comment_id,
            title: `${comment_id}${text === '' ? '' : '/' + text}`,
            description:
                `${text}<br>` +
                imgList.reduce((description, imgUrl) => {
                    description += `<img referrerpolicy="no-referrer" src="http:${imgUrl}"><br>`;
                    return description;
                }, ''),
            link,
        });
    });

    let rss_title;
    let description;

    switch (sub_model) {
        case 'pic':
            rss_title = '煎蛋无聊图';
            description = '煎蛋官方无聊图，无限活力的热门图区。';
            break;

        case 'ooxx':
            rss_title = '煎蛋妹子图';
            description = '这儿才是正版妹子图。';
            break;

        case 'top-ooxx':
            rss_title = '煎蛋妹子图热榜';
            description = '';
            break;

        case 'top-4h':
            rss_title = '煎蛋4小时热榜';
            description = '';
            break;

        case 'top':
            rss_title = '煎蛋无聊图热榜';
            description = '';
            break;

        default:
            rss_title = '未知内容';
            description = '未知内容，请前往 https://github.com/DIYgod/RSSHub/issues 提交 issue';
    }

    ctx.state.data = {
        title: `${rss_title}`,
        link: `${baseUrl}${sub_model}/`,
        description: `${description}`,
        item: items,
    };
};
