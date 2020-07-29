const got = require('@/utils/got');
const cherrio = require('cheerio');

module.exports = async (ctx) => {
    const { category = '' } = ctx.params;
    let url;

    if (category !== '') {
        url = 'https://www.dbmeinv.com/index.htm?cid=' + category;
    } else {
        url = 'https://www.dbmeinv.com/';
    }

    const response = await got({
        method: 'get',
        url: url,
        headers: {
            Referer: 'https://www.dbmeinv.com/',
        },
    });

    const data = response.data;
    const $ = cherrio.load(data);

    const $list = $('li.span3 img');

    const resultItem = [];
    for (let i = 1; i <= $list.length; i++) {
        const title = $list.eq(i).attr('title');
        const img_url = $list.eq(i).attr('src');
        const single = {
            title: title,
            link: img_url,
            description: `<img src="${img_url}">`,
        };
        resultItem.push(single);
    }

    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: resultItem,
        description: '不羞涩 | 真实的图片分享交友社区',
    };
};
