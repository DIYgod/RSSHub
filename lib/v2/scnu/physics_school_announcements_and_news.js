const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const getAritlces = async (category, url) => {
    const { data } = await got(url);
    const $ = cheerio.load(data);
    const spiderResult = $('ul.article-list')
        .children()
        .toArray()
        .map(async (item) => {
            item = $(item);
            const a = item.find('a');
            const link = a.attr('href');
            const { data } = await got(link);
            const aritcle_content = $(data).find('div.detail').text();
            return {
                title: a.text(),
                link,
                pubData: timezone(parseDate(item.find('span').text()), +8),
                category,
                description: aritcle_content,
            };
        });
    if (spiderResult.length === 0) {
        return [];
    }
    return Promise.all(spiderResult);
};

module.exports.announcements_router = async (ctx) => {
    const URLs = {
        党政: 'https://physics.scnu.edu.cn/NEWS/Notices/PartyAndGovernment/',
        教务: 'https://physics.scnu.edu.cn/NEWS/Notices/Education/',
        科研: 'https://physics.scnu.edu.cn/NEWS/Notices/Research/',
        人事: 'https://physics.scnu.edu.cn/NEWS/Notices/People/',
        综合: 'https://physics.scnu.edu.cn/NEWS/Notices/General/',
        学工: 'https://physics.scnu.edu.cn/NEWS/Notices/Students/',
    };
    let items = [];

    for (const key of Object.keys(URLs)) {
        items.push(getAritlces(key, URLs[key]));
    }
    items = await Promise.all(items);
    items = items.flat();
    ctx.state.data = {
        title: '华南师范大学物理与电信工程学院通知',
        link: 'https://physics.scnu.edu.cn/NEWS/Notices/',
        item: items,
    };
};

module.exports.news_router = async (ctx) => {
    const URLs = {
        学院新闻: 'https://physics.scnu.edu.cn/NEWS/News/College/',
        教务新闻: 'https://physics.scnu.edu.cn/NEWS/News/Education/',
        学工新闻: 'https://physics.scnu.edu.cn/NEWS/News/Education/',
        科研新闻: 'https://physics.scnu.edu.cn/NEWS/News/Research/',
        院友新闻: 'https://physics.scnu.edu.cn/NEWS/News/People/',
    };
    let items = [];

    for (const key of Object.keys(URLs)) {
        items.push(getAritlces(key, URLs[key]));
    }
    items = await Promise.all(items);
    items = items.flat();
    ctx.state.data = {
        title: '华南师范大学物理与电信工程学院新闻动态',
        link: 'https://physics.scnu.edu.cn/NEWS/News/',
        item: items,
    };
};
