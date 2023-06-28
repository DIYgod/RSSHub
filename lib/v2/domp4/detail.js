const cheerio = require('cheerio');
const got = require('@/utils/got');
const { baseUrl, decodeCipherText, composeMagnetUrl, getUrlType } = require('./utils');

// 兼容没有 script 标签的情况，直接解析 dom
function getDomList($, detailUrl) {
    const list = $('.down-list li')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('a').attr('title');
            const downurl = item.find('a').attr('href');
            const urlType = getUrlType(downurl);
            const enclosureUrl = urlType === 'magnet' ? composeMagnetUrl(downurl) : downurl;
            return {
                enclosure_url: enclosureUrl,
                enclosure_length: '',
                enclosure_type: 'application/x-bittorrent',
                title,
                link: detailUrl,
                guid: `${title}-${urlType}`,
            };
        });
    return list;
}

function getItemList($, detailUrl) {
    const encoded = $('.article script[type]')
        .text()
        .match(/return p}\('(.*)',(\d+),(\d+),'(.*)'.split\(/);
    // 若 script 标签没有内容，直接解析 dom
    if (!encoded) {
        return getDomList($, detailUrl);
    }
    const data = JSON.parse(
        decodeCipherText(encoded[1], encoded[2], encoded[3], encoded[4].split('|'), 0, {})
            .match(/var down_urls=\\'(.*)\\'/)[1]
            .replace(/\\\\"/g, '"')
            .replace(/\\\\\\/g, '')
    );
    const { downurls } = data.Data[0];
    return downurls.map((item) => {
        const [title, downurl] = item.split('$');
        const urlType = getUrlType(downurl);
        // only magnet need compose trackers
        const enclosureUrl = urlType === 'magnet' ? composeMagnetUrl(downurl) : downurl;
        return {
            enclosure_url: enclosureUrl,
            enclosure_length: '',
            enclosure_type: 'application/x-bittorrent',
            title,
            link: detailUrl,
            guid: `${title}-${urlType}`,
        };
    });
}

function getMetaInfo($) {
    const title = $('.article-header .text p').first().find('span').text();
    const cover = $('.article-header .pic img').attr('src');
    const description = $('.article-related.info p').text();
    return {
        title,
        cover,
        description,
    };
}

module.exports = async (ctx) => {
    const { id } = ctx.params;
    let pureId = id;
    let detailType = 'html';
    // compatible for .html suffix in radar
    if (id.endsWith('.html')) {
        pureId = id.replace('.html', '');
    }
    // compatible for /detail/123.html && /html/xxx.html
    if (/^\d+$/.test(pureId)) {
        detailType = 'detail';
    }
    const detailUrl = `${baseUrl}/${detailType}/${pureId}.html`;

    const res = await got(detailUrl);
    const $ = cheerio.load(res.data);
    const list = getItemList($, detailUrl);
    const meta = getMetaInfo($);

    ctx.state.data = {
        link: detailUrl,
        title: meta.title || 'domp4电影 - 详情',
        image: meta.cover,
        description: meta.description,
        item: list,
    };
};
