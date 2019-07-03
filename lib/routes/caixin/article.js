const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://mapiv5.caixin.com//m/api/getWapIndexListByPage?page=1&callback=jQuery213030389065931348935_1560140003113&_=1560140003179',
        headers: {
            Referer: `http://mapiv5.caixin.com/`,
            Host: 'mapiv5.caixin.com',
        },
    });

    const reg = /(.*jQuery.*\()([\s\S]*)(\))/;
    const datatmp = response.data.replace(reg, '$2');
    const data = JSON.parse(datatmp).data.list;

    ctx.state.data = {
        title: `财新网 - 首页`,
        link: `http://www.caixin.com/`,
        description: '财新网 - 首页',
        item: data.map((item) => ({
            title: item.title,
            description: item.summary,
            link: item.web_url,
        })),
    };
};
