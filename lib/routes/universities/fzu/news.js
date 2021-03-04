const got = require('@/utils/got');
const cheerio = require('cheerio');

const url_map = {
    jxtz: '1804',
    zjjz: '1809',
};
const Referer_map = {
    jxtz: '/jxtz/',
    zjjz: '/zjjz/',
};
const title_map = {
    jxtz: '教学通知',
    zjjz: '专家讲座',
};
const description_map = {
    jxtz: '教学通知',
    zjjz: '嘉锡讲坛/信息素养讲座通知',
};

module.exports = async (ctx) => {
    const type = ctx.params.type || '';
    const response = await got({
        method: 'get',
        url: `http://jwch.fzu.edu.cn/plus/json.aspx?jid=J131925584886784703&classid=${url_map[type]}&page=1&column=infoid%2Cclassid%2Ctitle%2Cdefaultpic%2Cintro%2Cadddate%2Curl%2Cclassname`,
        headers: {
            Referer: `http://jwch.fzu.edu.cn${Referer_map[type]}`,
        },
    });
    const data = response.data.data;

    const urls = new Array();
    for (let i = 0; i <= 9; i++) {
        urls[i] = data[i].url;
    }

    const items = await Promise.all(
        urls.map(
            async (item) =>
                await ctx.cache.tryGet(item, async () => {
                    const response = await got({
                        method: 'get',
                        url: item,
                    });
                    const $ = cheerio.load(response.data);
                    const title = $('title').html();
                    const description = $('.articelMain').html();
                    const pubDate = $('.xl_sj_icon').text().replace('发布时间：', '');
                    return {
                        title,
                        link: item,
                        description,
                        pubDate,
                    };
                })
        )
    );

    ctx.state.data = {
        title: `福州大学教务处${title_map[type]}`,
        link: `http://jwch.fzu.edu.cn/jxtz/`,
        description: `福州大学教务处${description_map[type]}`,
        item: items,
    };
};
