const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;

    const response = await axios({
        method: 'post',
        url: `https://www.uukanshu.com/b/${uid}`,
        headers: {
            'User-Agent': config.ua,
            Referer: 'https://github.com/DIYgod/RSSHub',
        },
        responseType: 'arraybuffer',
    });

    const data = iconv.decode(response.data, 'gb2312');
    const $ = cheerio.load(data);

    const name = $('.jieshao_content>h1>a').text();
    const list = $('#chapterList li a');
    const cover_url = $('.bookImg>img').attr('src');

    ctx.state.data = {
        title: `UU看书 ${name}`,
        link: `https://www.uukanshu.com/b/${uid}`,
        description: $('.jieshao_content h3').text(),
        image: cover_url,
        item: list.map((i, e) => ({
            title: $(e).attr('title'),
            link: `https://www.uukanshu.com${$(e).attr('href')}`,
            })
        ),
    };
};
