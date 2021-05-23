const date = require('@/utils/date');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.yicai.com';
    const url = `${baseUrl}/api/ajax/getbrieflist`;
    const query = {
        pagesize: 30,
        type: 0,
        page: 0,
    };
    const response = await got(url, {
        query,
    });

    const resList = response.data;
    const item = resList.map((obj) => {
        const { datekey, istop, url, newcontent, hm, indexTitle } = obj;
        const dateStr = `${datekey.replace(/\./g, '-')} ${hm}`;
        return {
            title: indexTitle.length === newcontent.length ? indexTitle : `${indexTitle}...`,
            description: [istop ? '置顶:' : '', newcontent].filter((str) => !!str).join('<br/>'),
            pubDate: date(dateStr, +8),
            link: `${baseUrl}${url}`,
        };
    });

    ctx.state.data = {
        title: `第一财经 - 直播区`,
        description: `第一财经 - 直播区`,
        link: `${baseUrl}/brief`,
        item,
    };
};
