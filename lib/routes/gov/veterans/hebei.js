const got = require('@/utils/got');
const cheerio = require('cheerio');
function load(link, ctx) {
    return ctx.cache.tryGet(link, async () => {
        // 开始加载页面
        const response = await got.get(link);
        const $ = cheerio.load(response.data);
        // 获取标题
        const title = $('body > div.container.mt40 > div > div > div.m-lg.text-center > div.p-sm').text();
        // 获取正文内容
        const introduce = $('body > div.container.mt40 > div > div > div.m-lg.info-style-content').html();
        // eslint-disable-next-line no-useless-escape
        // 获取标题中的推送时间和作者等信息
        const temp = $('body > div.container.mt40 > div > div > div.m-lg.text-center > div.m-b-sm')
            .text()
            .replace(/[\r\n]/g, '');
        // 获取标题中的时间
        const dateTime = temp.substring(temp.indexOf('发布时间') + 5, temp.indexOf('信息来源')).trim() + ':00';
        const pubDate = new Date(new Date(dateTime).getTime()).toUTCString();
        // 获取标题中的作者
        const author = temp.substring(temp.indexOf('信息来源') + 5, temp.indexOf('阅读次数')).trim();

        return {
            title,
            description: introduce,
            link,
            pubDate,
            author,
        };
    });
}

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const checkType = {
        sxxx: '市县信息',
        tnxx: '厅内信息',
        ywgz: '省内信息',
    };
    const host = `http://tyjrswt.hebei.gov.cn/gk/${type}/`;
    const response = await got({
        method: 'get',
        url: host,
    });
    const data = response.data;

    const $ = cheerio.load(data);
    const list = $(`#${type}_list > li > a`).get();

    const process = await Promise.all(
        list.map(async (item) => {
            let itemUrl = $(item).attr('href');
            if (itemUrl.indexOf('./') === 0) {
                itemUrl = 'http://tyjrswt.hebei.gov.cn' + itemUrl.substring(2);
            } else {
                itemUrl = 'http://tyjrswt.hebei.gov.cn' + itemUrl;
            }
            const single = {
                title: $(item).text(),
                link: itemUrl,
                guid: itemUrl,
            };
            const other = await load(String(itemUrl), ctx);
            return Promise.resolve(Object.assign({}, single, other));
        })
    );
    ctx.state.data = {
        title: `河北省退伍军人事务厅 - ${checkType[type]}`,
        link: host,
        description: `河北省退伍军人事务厅 - ${checkType[type]} 更新提示`,
        item: process,
    };
};
