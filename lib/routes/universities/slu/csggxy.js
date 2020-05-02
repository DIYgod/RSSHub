const utils = require('./utils');
const baseurl = 'http://csggxy.lixin.edu.cn';

module.exports = async (ctx) => {
    const link = baseurl + `/info/iList.jsp?cat_id=${ctx.params.id}`;
    const { list, title } = await utils.fetchMain(link, 'body > div.details > div.contentright > div.rightlist > ul > li');
    ctx.state.data = {
        title: `${title} - 财税与公共管理学院 - 上海立信会计金融学院`,
        link,
        description: `${title} - 财税与公共管理学院 - 上海立信会计金融学院`,
        item: await utils.fetchDetail(list, baseurl, 'body > div.neirong > div.rong', ctx.cache),
    };
};
