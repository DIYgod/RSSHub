const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const response = await got(`https://i.ui.cn/ucenter/${id}.html`);
    const $ = cheerio.load(response.data);
    const name = $('.person_name').text();
    const intro = $('.person_intro').text();
    const response2 = await got({
        method: 'get',
        url: `https://i.ui.cn/index.php/Uweb/Api/projectlst?uid=${id}&type=&size=12&page=0`,
        headers: {
            Referer: `https://i.ui.cn/ucenter/${id}.html`,
        },
    });
    const postList = response2.data.data.list;
    ctx.state.data = {
        title: `${name} 的设计作品 - UI 中国`,
        link: `https://i.ui.cn/ucenter/${id}.html`,
        description: intro,
        item: postList.map((item) => ({
            title: item.name,
            description: `${item.name}<br><img src="${item.picurl}">`,
            link: `https://www.ui.cn/detail/${item.id}.html`,
            guid: item.id,
        })),
    };
};
