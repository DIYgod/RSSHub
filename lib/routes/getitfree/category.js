const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const { category = 'all' } = ctx.params;
    const baseUrl = `https://getitfree.cn`;
    const categoryToLabel = {
        '8': 'PC',
        '17': 'Android',
        '50': 'Mac',
        '309': '限时折扣',
        '310': '限时免费',
        '311': '永久免费',
        '312': 'UWP',
        all: '全部文章',
    };

    let item = [];
    if (category === 'all') {
        const res = await got(baseUrl);
        const $ = cheerio.load(res.data);
        $('#page-content .top-content .top-slide > .item')
            .toArray()
            .forEach((ele) => {
                const $item = cheerio.load(ele);
                const infoNode = $item('.slider-image > a');
                const title = infoNode.attr('title');
                const link = infoNode.attr('href');
                const thumbnail = infoNode.attr('style').replace(/background-image:url\(|\)/g, '');
                const deadlineStr = utils.getDeadlineStr($item, '.countDownCont');
                const description = [title, deadlineStr, `<a href="${thumbnail}"/>`].filter((str) => !!str).join('<br/>');
                item.push({
                    title,
                    link,
                    description,
                });
            });
        item = item.concat(utils.parseListItem($, '.main-content'));
    } else {
        const res = await got(baseUrl, {
            searchParams: {
                action: 'fa_load_postlist',
                paged: 1,
                category,
            },
        });
        const $ = cheerio.load(res.data);
        item = utils.parseListItem($, '.ajax-load-con');
    }

    const categoryLabel = categoryToLabel[category];
    ctx.state.data = {
        title: `正版中国 - ${categoryLabel}`,
        description: `正版中国 - ${categoryLabel}`,
        link: baseUrl,
        item,
    };
};
