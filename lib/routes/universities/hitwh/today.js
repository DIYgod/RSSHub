const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const baseUrl = 'http://today.hitwh.edu.cn';

module.exports = async (ctx) => {
    const response = await got.get(`${baseUrl}/1024/list.htm`);
    const { data } = response;
    const $ = cheerio.load(data);
    const type = (filename) => filename.split('.').pop();
    const links = $('#righ_list ul li')
        .map((_, el) => ({
            pubDate: new Date($(el).find('font').text().substr(-10, 10)).toUTCString(),
            link: url.resolve(baseUrl, $('a', el).attr('href')),
            title: $(el).find('a').text(),
        }))
        .get();

    ctx.state.data = {
        title: '哈尔滨工业大学（威海）通知公告',
        link: `${baseUrl}/1024/list.htm`,
        item: await Promise.all(
            links.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    if (type(item.link) === 'htm') {
                        const { data } = await got.get(item.link);
                        const $ = cheerio.load(data);
                        item.description =
                            $('div.wp_articlecontent').html() &&
                            $('div.wp_articlecontent')
                                .html()
                                .replace(/src="\//g, `src="${url.resolve(baseUrl, '.')}`)
                                .replace(/href="\//g, `href="${url.resolve(baseUrl, '.')}`)
                                .trim();
                        return item;
                    } else {
                        // file to download
                        item.description = '此链接为文件，点击以下载';
                        return item;
                    }
                })
            )
        ),
    };
};
