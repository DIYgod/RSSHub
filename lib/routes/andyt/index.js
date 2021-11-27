const got = require('@/utils/got');
const cheerio = require('cheerio');

const baseUrl = 'https://andyt.cn/forum.php?mod=guide&view=';
const host = 'https://andyt.cn/';
const viewProps = {
    newthread: '最新发表',
    hot: '最新热门',
    digest: '最新精华',
    new: '最新回复',
};

module.exports = async (ctx) => {
    const view = ctx.params.view || 'newthread';
    const url = baseUrl + view;
    const response = await got({
        method: 'get',
        url,
    });
    const $ = cheerio.load(response.data);

    ctx.state.data = {
        title: `${viewProps[view]} - 书友社区`,
        link: url,
        description: `${viewProps[view]} - 书友社区`,
        item: $('.bm_c')
            .find('tbody')
            .map((index, item) => ({
                title: `【` + $(item).find('td.by a').eq(0).text() + `】` + $(item).find('a.xst').text(),
                description: '',
                author: $(item).find('cite').text().trim(),
                link: host + $(item).find('a').eq(0).attr('href'),
            }))
            .get(),
    };
};
