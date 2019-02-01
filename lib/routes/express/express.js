const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const company = ctx.params.company;
    const number = ctx.params.number;

    const response = await axios({
        method: 'get',
        url: `https://www.kuaidi100.com/query?type=${company}&postid=${number}`,
        headers: {
            Referer: 'https://www.kuaidi100.com',
        },
    });

    const data = response.data.data;

    ctx.state.data = {
        title: `快递 ${company}-${number}`,
        link: 'https://www.kuaidi100.com',
        description: `快递 ${company}-${number}`,
        item: data.map((item) => ({
            title: item.context,
            description: item.context,
            pubDate: new Date(item.time || item.ftime).toUTCString(),
            link: item.context,
        })),
    };
};
