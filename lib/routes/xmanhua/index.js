const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const host = 'https://xmanhua.com';
    const url_t = `https://xmanhua.com/${uid}/`;
    const response = await got({
        method: 'get',
        url: url_t,
        headers: {
            Referer: host,
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('div #chapterlistload').find('.detail-list-form-item');
    // let itemList = [];
    // for (let i = 0;i < list.length; i = i  + 1)
    // {
    //    list[i]
    // }
    ctx.state.data = {
        title: 'x漫画',
        link: `https://xmanhua.com/${uid}`,
        item: list
            .map((index, item) => {
                item = $(item);
                const itemTitle = item.text();
                const itemUrl = item.attr('href');
                return {
                    title: itemTitle,
                    link: host + itemUrl,
                };
            })
            .get(),
    };
};
