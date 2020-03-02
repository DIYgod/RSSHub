const url = require('url');
const cheerio = require('cheerio');
const cloudscraper = require('cloudscraper');
const dateUtil = require('@/utils/date');

// 通过传入不同的ctx.state.data.link 返回javlibrary 不同link的rss
exports.template = async function template(ctx) {
    const link = ctx.state.data.link;
    const response = await cloudscraper.get(link);
    const $ = cheerio.load(response);
    const list = $('.videothumblist .video').get();

    const items = await Promise.all(
        list.map(async (item) => {
            item = $(item);
            const itemLink = url.resolve(link, item.find('a').attr('href'));
            const simple = {
                title: `[${item.find('.id').text()}]${item.find('.title').text()}`,
                link: itemLink,
            };

            const details = await ctx.cache.tryGet(itemLink, async () => {
                const response = await cloudscraper.get(itemLink);
                const $ = cheerio.load(response);
                $('#video_info #video_review .icon').remove();
                return {
                    author: $('.star').text(),
                    description: `<img src="${$('#video_jacket_img').attr('src')}"><br>${$('#video_info').html()}`,
                };
            });
            return Promise.resolve(Object.assign({}, simple, details));
        })
    );

    ctx.state.data = {
        title: `Javlibrary - ${$('.boxtitle').text()}`,
        link: link,
        item: items,
    };
};

exports.getVideoComments = async function getVideoComments(link) {
    const response = await cloudscraper.get(link);
    const $ = cheerio.load(response);
    const list = $('#video_comments > table');

    return (
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
            .get()
    );
};
