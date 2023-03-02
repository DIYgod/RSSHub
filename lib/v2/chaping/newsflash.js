const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://chaping.cn';

module.exports = async (ctx) => {
    const newflashAPI = `${host}/api/official/information/newsflash?page=1&limit=21`;
    const response = await got(newflashAPI).json();
    const data = response.data;

    ctx.state.data = {
        title: '差评 快讯',
        link: `${host}/newsflash`,
        item:
            data &&
            data.map((item) => ({
                title: item.title,
                description: item.summary,
                pubDate: parseDate(item.time_publish_timestamp * 1000),
                link: item.origin_url,
            })),
    };
};
