const cheerio = require('cheerio');

const statusListParser = ($) => {
    const items = $('.item')
        .map((_, ele) => {
            const timestamp = ele.attribs.pt;
            const $item = cheerio.load(ele);
            const mainNode = $item('.news-detail');
            const imgsStr = mainNode
                .find('img')
                .map((_, ele) => `<img src="${ele.attribs.src}"/>`)
                .get()
                .join('<br/>');
            const link = mainNode.find('.content a').first().attr('href');
            const content = mainNode
                .text()
                .trim()
                .replace(/展开全文$/, '');
            return {
                title: content,
                link: link.startsWith('http') ? link : `https:${link}`,
                description: [content, imgsStr].filter((s) => !!s).join('<br/>'),
                pubDate: new Date(timestamp * 1000).toUTCString(),
            };
        })
        .get();
    return items;
};

const articleListParser = ($) => {
    const items = $('.item')
        .map((_, ele) => {
            const $item = cheerio.load(ele);
            const timestamp = ele.attribs.pt;
            const imgUrl = $item('.news-img img').attr('src');
            const titleNode = $item('.title').first();
            const title = titleNode.text();
            const link = titleNode.find('a').attr('href');
            const description = $item('.desc').text();
            const author = $item('.author a').text();
            return {
                title,
                link: link.startsWith('http') ? link : `https:${link}`,
                description: [description, `<img src="${imgUrl}"/>`].join('<br/>'),
                author,
                pubDate: new Date(timestamp * 1000).toUTCString(),
            };
        })
        .get();
    return items;
};

const wireListParser = ($) => {
    const items = $('.item')
        .map((_, ele) => {
            const $item = cheerio.load(ele);
            const timestamp = ele.attribs.pt;
            const titleNode = $item('.text').first();
            const title = titleNode.text();
            const link = titleNode.find('a').attr('href');
            return {
                title,
                link: link.startsWith('http') ? link : `https:${link}`,
                description: title,
                pubDate: new Date(timestamp * 1000).toUTCString(),
            };
        })
        .get();
    return items;
};

module.exports = {
    articleListParser,
    statusListParser,
    wireListParser,
};
