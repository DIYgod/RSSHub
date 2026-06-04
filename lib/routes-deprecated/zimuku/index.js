const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { type = 'mv' } = ctx.params;
    const baseUrl = 'https://srtku.com';
    const url = `${baseUrl}/newsubs?t=${type}`;
    const response = await got(url);
    const $ = cheerio.load(response.data);

    const items = $('table > tbody > tr')
        .map((_, ele) => {
            const $item = cheerio.load(ele);
            const author = $item('.glyphicon-user').text();
            const baseInfoNode = $item('.first > a');
            const title = baseInfoNode.attr('title');
            const link = `${baseUrl}${baseInfoNode.attr('href')}`;
            const langs = $item('.lang > img')
                .map((_, ele) => ele.attribs.title.replace('字幕', ''))
                .get();
            return {
                title,
                link,
                author,
                description: `语言: ${langs.join(' | ')}`,
            };
        })
        .get();

    const typeToLabel = {
        mv: '电影字幕',
        tv: '美剧字幕',
    };
    const title = `字幕库 - ${typeToLabel[type]}`;
    ctx.state.data = {
        title,
        description: title,
        link: url,
        item: items,
    };
};
