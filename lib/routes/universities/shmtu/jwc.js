const axios = require('../../../utils/axios');
const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const host = 'http://jwc.shmtu.edu.cn';
    const type = ctx.params.type;
    const info = type === 'jiaowugonggao' ? '教务公告' : '教务新闻';

    const response = await axios({
        method: 'get',
        url: host + `/${type}`,
        headers: {
            Referer: host,
        },
    });

    const $ = cheerio.load(response.data);
    const list = $('tr', 'tbody')
        .slice(0, 10)
        .get();

    const result = await util.ProcessFeed(host, list, ctx.cache);

    ctx.state.data = {
        title: `上海海事大学 ${info}`,
        link: host + `/${type}`,
        description: '上海海事大学 教务信息',
        item: result,
    };
};
