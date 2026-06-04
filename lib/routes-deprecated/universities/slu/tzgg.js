const utils = require('./utils');
const baseurl = 'http://www.lixin.edu.cn';

module.exports = async (ctx) => {
    const link = baseurl + `/info/iList.jsp?cat_id=${ctx.params.id}`;
    const { list, title } = await utils.fetchMain(link, 'body > table > tbody > tr > td:nth-child(2) > div.xjr_list > ul > li');

    ctx.state.data = {
        title: `${title} - 官网 - 上海立信会计金融学院`,
        link,
        description: `${title} - 官网 - 上海立信会计金融学院`,
        item: await utils.fetchDetail(list, baseurl, 'body > table > tbody > tr > td:nth-child(2) > div.xjr_content', ctx.cache),
    };
};
