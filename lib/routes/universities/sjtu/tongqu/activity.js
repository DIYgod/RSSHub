const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const urlRoot = 'https://tongqu.sjtu.edu.cn/';

module.exports = async (ctx) => {
    const sectionLink = url.resolve(urlRoot, 'act/type?type=-1&status=0&order=act.create_time');

    const response = await got(sectionLink);
    const data = response.body;
    const $ = cheerio.load(data);

    const activityInfo = $('body > script:nth-child(2)')
        .html()
        .match('var g_init_type_acts = (.*?);')[1];
    const activities = JSON.parse(activityInfo).acts;
    const out = activities.map((i) => {
        const title = '【' + i.typename + '】' + i.name;
        const link = url.resolve(urlRoot, '/act/' + i.actid);
        const single = { title, link };
        return single;
    });

    ctx.state.data = {
        title: '同去网最新活动',
        link: sectionLink,
        item: out,
    };
};
