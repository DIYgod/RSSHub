const cheerio = require('cheerio');
const dateUtil = require('@/utils/date');
const cloudscraper = require('cloudscraper');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const link = `http://www.javlibrary.com/cn/userposts.php?u=${uid}`;
    const response = await cloudscraper.get(link);
    const $ = cheerio.load(response);
    const list = $('#video_comments > table');

    ctx.state.data = {
        title: `Javlibrary - ${uid} 发表的文章`,
        link: link,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    // 文章内容只能抓取到 td.t textarea，若含有图片则替换[img]image-link[/img] => <img src="image-link" />
                    let comments = item.find('textarea').text();
                    comments = comments.replace(new RegExp('\\[img\\]', 'g'), '<img src="').replace(new RegExp('\\[\\/img\\]', 'g'), '" />');
                    return {
                        title: item.find('tbody > tr:nth-child(1) > td:nth-child(2)').text(),
                        link: item.find('tbody > tr:nth-child(1) > td:nth-child(2) > a').attr('href'),
                        description: `
                            <table><tbody>
                                <tr><td>${item.find('tbody > tr:nth-child(1) > td:nth-child(2)').html()}</td></tr>
                                <tr><td>${comments}</td></tr>
                            </tbody></table>`,
                        pubDate: dateUtil(item.find('tbody > tr:nth-child(3) > td.date')),
                    };
                })
                .get(),
    };
};
