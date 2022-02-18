const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const aid = ctx.params.id;
    const novel_url = `https://www.wenku8.net/novel/${parseInt(aid / 1000)}/${aid}/index.htm`;
    const $ = cheerio.load(await get(novel_url));

    const novel_name = $('#title').text();

    const volume_list = $('.vcss');
    const last_volume = $(volume_list[volume_list.length - 1]);
    const vid = last_volume.parent().next().find('a')[0].attribs.href.replace('.htm', '');

    const volume_url = `https://dl.wenku8.com/packtxt.php?aid=${aid}&vid=${vid}&charset=gbk`;
    const item_list = await ctx.cache.tryGet(volume_url, async () => {
        const result = await get(volume_url);
        const chapter_list = [...result.matchAll(/ {2}(\S.*)\r\n([\S\s]+?)\r\n\r\n/g)];
        return chapter_list
            .filter((chapter) => chapter[2].trim())
            .reverse()
            .map((chapter) => ({
                title: chapter[1],
                description: format_description(chapter[2]),
                guid: Buffer.from(`${vid}${chapter[1]}`).toString('base64'),
            }));
    });

    ctx.state.data = {
        title: `轻小说文库 ${novel_name} 最新卷`,
        link: novel_url,
        item: item_list,
    };
};

const get = async (url) => {
    const response = await got({
        method: 'get',
        url,
        responseType: 'buffer',
    });

    return iconv.decode(response.data, 'gbk');
};

const format_description = (str) =>
    str
        .split('\r\n')
        .filter((line) => line.trim())
        .map((line) => `<p>${line.trim()}</p>`)
        .join('');
