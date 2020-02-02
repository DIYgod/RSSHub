const cheerio = require('cheerio');
const dateUtil = require('@/utils/date');
const cloudscraper = require('cloudscraper');
const API = 'http://www.javlibrary.com/cn/userposts.php?u=';

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const link = API + uid;
    const response = await cloudscraper.get(link);
    const $ = cheerio.load(response);
    const list = $('div#rightcolumn table.comment');

    ctx.state.data = {
        title: `Javlibrary - ${uid} 发表的文章`,
        link: link,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    // 文章内容只能抓取到 td.t textarea，若含有图片则替换[img]image-link[/img] => <img src="image-link" />
                    let comments = item.find('td.t  textarea').text();
                    comments = comments.replace(new RegExp('\\[img\\]', 'g'), '<img src="').replace(new RegExp('\\[\\/img\\]', 'g'), '" />');
                    return {
                        title: item.find('td > strong').text(),
                        link: item.find('td > strong > a').attr('href'),
                        description: `<table>${item.find('table.videoinfo').html()}</table> 
                                <p>${comments}</p>`,
                        pubDate: dateUtil(item.find('td.date')),
                        guid: item.find('td > strong > a').attr('href'),
                    };
                })
                .get(),
    };
};
