const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;

    const response = await got({
        method: 'post',
        url: `https://www.uukanshu.com/b/${uid}`,
        headers: {
            Referer: 'https://www.uukanshu.com/b/${uid}',
        },
        responseType: 'buffer',
    });

    const data = iconv.decode(response.data, 'gb2312');
    const $ = cheerio.load(data);

    const name = $('.jieshao_content>h1>a').text();
    const list = $('#chapterList li a');
    const cover_url = $('.bookImg>img').attr('src');
    const chapter_item = [];
    for (const element of list) {
        const el = $(element);
        const item = {
            title: el.text(),
            link: `https://www.uukanshu.com${el.attr('href')}`,
        };
        chapter_item.push(item);
    }
    ctx.state.data = {
        title: `UU看书 ${name}`,
        link: `https://www.uukanshu.com/b/${uid}`,
        description: $('.jieshao_content h3').text(),
        image: cover_url,
        item: chapter_item,
    };
};
