const axios = require('../../utils/axios');
// const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = `https://coffee.pmcaff.com/`;

    const response = await axios({
        method: 'post',
        url: url + 'list',
        headers: {
            Referer: url,
        },
        data: {
            page: 1,
            type: 2,
        },
    });
    const data = response.data.data;
    ctx.state.data = {
        title: `PMCAFF 精选`,
        link: `https://coffee.pmcaff.com/?type=2`,
        description: `PMCAFF 精选`,
        item: data.map((item) => ({
            title: item.title,
            description: `<img referrerpolicy="no-referrer" src="${item.picUrl}">`,
            // pubDate: new Date(item.time * 1000).toUTCString(),
            link: `${item.pageUrl}`,
        })),
    };
};
