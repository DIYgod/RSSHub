const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const host = 'https://tech.meituan.com';
    const homePage = host;

    const response = await axios({
        method: 'get',
        url: homePage,
        headers: {
            Referer: homePage,
        },
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const postList = $('.post-container').get();
    const itemList = postList.slice(0, postList.length - 1);
    const items = await util.ProcessTechFeed(itemList);

    ctx.state.data = {
        title: '美团技术团队',
        link: homePage,
        description: '美团技术团队面临世界级的用户规模和最接地气、真正“入口性”的需求，也面临世界级的技术挑战，欢迎更多优秀技术人才加入，一起打造世界冠军企业！',
        item: items,
    };
};
