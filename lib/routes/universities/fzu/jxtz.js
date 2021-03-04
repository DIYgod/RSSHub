const got = require('@/utils/got');
const cheerio = require('cheerio');
module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `http://jwch.fzu.edu.cn/plus/json.aspx?jid=J131925584886784703&classid=1804&page=1&column=infoid%2Cclassid%2Ctitle%2Cdefaultpic%2Cintro%2Cadddate%2Curl%2Cclassname`,
        headers: {
            Referer: `http://jwch.fzu.edu.cn/jxtz/`,
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
                    return {
                        title,
                        link: item,
                        description,
                    };
                })
        )
    );

    ctx.state.data = {
        title: `福州大学教务处教务通知`,
        link: `http://jwch.fzu.edu.cn/jxtz/`,
        description: `福州大学教务处教学通知`,
        item: items,
    };
};
