const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const urlRoot = 'https://tongqu.sjtu.edu.cn/';

module.exports = async (ctx) => {
    const sectionLink = url.resolve(urlRoot, 'act/type?type=-1&status=0&order=act.create_time');

    const response = await got({
        method: 'get',
        url: sectionLink,
        responseType: 'buffer',
    });
    const data = response.body;
    const $ = cheerio.load(data);

    let out;
    try {
        const activityInfo = $('body > script:nth-child(2)').html();
        const activityJson = activityInfo.match('var g_init_type_acts = (.*?);')[1];
        const activities = JSON.parse(activityJson).acts;
        out = await Promise.all(
            activities.map(async (i) => {
                const title = '【' + i.typename + '】' + i.name;
                const link = url.resolve(urlRoot, '/act/' + i.actid);
                const single = {
                    title,
                    link,
                };
                return Promise.resolve(single);
            })
        );
    } catch (err) {
        out = [
            {
                title: '糟了，这个 RSSHub 路由失效了',
                link: 'https://github.com/DIYgod/RSSHub',
                description: '可以去 Github 提 issue，@原作者',
                guid: 1926,
            },
        ];
    }

    ctx.state.data = {
        title: '同去网最新活动',
        link: sectionLink,
        item: out,
    };
};
