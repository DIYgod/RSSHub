const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'https://developers.weixin.qq.com/community/plugins';
    const response = await got({
        method: 'post',
        url: `https://developers.weixin.qq.com/community/ngi/plugins/cases?random=${Math.random()}`,
        headers: {
            Referer: link,
        },
    });

    const { pluginCases } = response.data.data;
    const resultItem = await Promise.all(
        pluginCases.map(async (plugin) => {
            const item = {
                title: plugin.title,
                description: '',
                link: `https://developers.weixin.qq.com/community/develop/doc/${plugin.docid}`,
                author: plugin.nickname,
                pubDate: new Date(plugin.createTime * 1000).toUTCString(),
            };
            const url = `https://developers.weixin.qq.com/community/ngi/doc/detail/${plugin.docid}`;
            const key = `miniprogram-plugin: ${url}`;
            const value = await ctx.cache.get(key);

            if (value) {
                item.description = value;
            } else {
                const pluginDetail = await got({
                    method: 'get',
                    url: `${url}?random=${Math.random()}`,
                    headers: {
                        Referer: link,
                    },
                });
                const id = 'x-rsshub';
                const $ = cheerio.load(`<div id="${id}">${pluginDetail.data.data.Content}</div>`);

                item.description = $(`#${id}`).html();
                ctx.cache.set(key, item.description);
            }

            return item;
        })
    );

    ctx.state.data = {
        title: '微信小程序插件',
        link,
        item: resultItem,
    };
};
