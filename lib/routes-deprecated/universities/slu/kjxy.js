const utils = require('./utils');
const baseurl = 'http://kjxy.lixin.edu.cn';

module.exports = async (ctx) => {
    const link = baseurl + `/info/iList.jsp?cat_id=${ctx.params.id}`;
    const { list, title } = await utils.fetchMain(link, 'body > div.erji > div.erjiright > div.rightlist > ul > li');

    ctx.state.data = {
        title: `${title} - 会计学院 - 上海立信会计金融学院`,
        link,
        description: `${title} - 会计学院 - 上海立信会计金融学院`,
        item: await utils.fetchDetail(list, baseurl, 'body > div.wrapper > div.ContentPage > div.words > div.text', ctx.cache),
    };
};
