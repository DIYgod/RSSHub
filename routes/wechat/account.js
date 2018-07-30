const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const arg = ctx.params.arg;
    let url = `https://weixin.sogou.com/weixin?query=${id}`;
    const res = await axios({
        method: 'get',
        url: url,
        headers: {
            'User-Agent': config.ua,
        },
    });
    const account = cheerio.load(res.data)('.tit a');
    url = account.attr('href');

    const response = await axios({
        method: 'get',
        url: url,
        headers: {
            'User-Agent': config.ua,
        },
    });

    const L = JSON.parse(response.data.match(/msgList = (.*);/)[1]).list;
    const out = [];
    for (let j = 0; j < L.length; j++) {
        const D = new Date(Number(L[j].comm_msg_info.datetime + '000')).toUTCString();
        out.push({
            title: L[j].app_msg_ext_info.title,
            pubDate: D,
            link: 'https://mp.weixin.qq.com' + L[j].app_msg_ext_info.content_url,
        });
        if (arg !== 'first') {
            const i = L[j].app_msg_ext_info.multi_app_msg_item_list;
            for (let k = 0; k < i.length; k++) {
                out.push({
                    title: i[k].title,
                    pubDate: D,
                    link: 'https://mp.weixin.qq.com' + i[k].content_url,
                });
            }
        }
    }

    ctx.state.data = {
        title: account.text(),
        link: url,
        item: out,
    };
};
