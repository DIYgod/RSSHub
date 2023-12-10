const { getNoticeList } = require('./utils');

const url = 'https://gra.njucm.edu.cn/2899/list.htm';
const host = 'https://gra.njucm.edu.cn';

module.exports = async (ctx) => {
    const out = await getNoticeList(ctx, url, host, '#wp_news_w3 > table > tbody > tr', 'a', {
        title: '.Article_Title',
        content: '.Article_Content',
        date: '.Article_PublishDate',
    });

    ctx.state.data = {
        title: '南京中医药大学 -- 博士招生',
        link: url,
        item: out,
    };
};
