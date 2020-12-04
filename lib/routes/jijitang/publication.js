const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `http://www.jijitang.com/api/publication/search?start=0&limit=40`;
    const res = await got.get(url);
    const data = res.data;

    ctx.state.data = {
        title: `唧唧堂 publication`,
        link: url,
        item: data.result.map((item) => ({
            title: item.titleCn,
            description: `杂志名称：` + item.journalName + `<br/> 英文标题：` + item.title + `<br/> 摘要：` + item.summary,
            pubDate: item.created,
            link: item.fullArticleLink,
        })),
    };
};
