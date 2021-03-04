const got = require('@/utils/got');
module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `http://jwch.fzu.edu.cn/plus/json.aspx?jid=J131925584886784703&classid=1809&page=1&column=infoid%2Cclassid%2Ctitle%2Cdefaultpic%2Cintro%2Cadddate%2Curl%2Cclassname`,
        headers: {
            Referer: `http://jwch.fzu.edu.cn/zjjz/`,
        },
    });
    const data = response.data.data;

    ctx.state.data = {
        title: `福州大学教务处专家讲座`,
        link: `http://jwch.fzu.edu.cn/zjjz/`,
        description: `福州大学教务处嘉锡讲坛/信息素养讲座通知`,
        item: data.map((item) => ({
            title: item.title,
            description: `${item.title}`,
            pubDate: `${item.adddate}`,
            link: `${item.url}`,
        })),
    };
};
