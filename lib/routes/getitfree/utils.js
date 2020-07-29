const cheerio = require('cheerio');
const dayJs = require('dayjs');
require('dayjs/locale/zh-cn');

const getDeadlineStr = ($, countDownNodeSelector) => {
    const countDownNode = $(countDownNodeSelector);
    let deadlineStr = '';
    if (countDownNode.text().includes('活动已经结束')) {
        return '截至日期: 活动已经结束';
    }
    const countdownCodeStr = countDownNode.children('script').html() || '';
    const arr = /ShowCountDown\("\d*"\s*,\s*([\d,]+)\s*\)/.exec(countdownCodeStr.trim());
    if (arr) {
        const dateStr = arr[1].replace(/,/g, (...args) => {
            const index = args[args.length - 2];
            return index === 10 ? ' ' : index < 10 ? '-' : ':';
        });
        deadlineStr = `截至日期: ${dayJs(dateStr).locale('zh-cn').format('YYYY-MM-DD HH:mm:ss')}`;
    }
    return deadlineStr;
};

const parseListItem = ($, listSelector) =>
    $(`${listSelector} .content-box`)
        .map((_, ele) => {
            const $item = cheerio.load(ele);
            const infoNode = $item('.posts-default-title > h2 > a');
            const title = infoNode.attr('title');
            const link = infoNode.attr('href');
            const pubDateStr = $item('.posts-default-info .icon-time').text();
            const pubDate = new Date(pubDateStr).toUTCString();
            const thumbnail = $item('.posts-default-img img').attr('data-original');
            const deadlineStr = getDeadlineStr($item, '.countDownCont');
            const digest = $item('.posts-default-content > .posts-text').text().trim();
            return {
                title,
                link,
                pubDate,
                description: [title, deadlineStr, digest, `<img src="${thumbnail}"/>`].filter((str) => !!str).join('<br/>'),
            };
        })
        .get();

module.exports = {
    getDeadlineStr,
    parseListItem,
};
