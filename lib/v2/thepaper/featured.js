const utils = require('./utils');
const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got('https://m.thepaper.cn');
    const data = JSON.parse(cheerio.load(response.data)('#__NEXT_DATA__').html());
    const list = data.props.pageProps.data.list;

    const items = await Promise.all(list.map((item) => utils.ProcessItem(item, ctx)));
    ctx.state.data = {
        title: '澎湃新闻 - 首页头条',
        link: 'https://m.thepaper.cn',
        item: items,
        itunes_author: '澎湃新闻',
        image: 'https://bkimg.cdn.bcebos.com/pic/b3119313b07eca8065387971487280dda144ad342551',
    };
};
