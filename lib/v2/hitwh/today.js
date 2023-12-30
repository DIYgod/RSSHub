const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const baseUrl = 'https://today.hitwh.edu.cn';

module.exports = async (ctx) => {
    const response = await got(`${baseUrl}/1024/list.htm`);
    const $ = cheerio.load(response.data);
    const type = (filename) => filename.split('.').pop();
    const links = $('.list_list_wrap #wp_news_w10002 ul > li')
        .map((_, el) => ({
            pubDate: timezone(parseDate($(el).find('.news-time2').text()), 8),
            link: new URL($(el).find('a').attr('href'), baseUrl).toString(),
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
                        try {
                            const { data } = await got(item.link);
                            const $ = cheerio.load(data);
                            item.description =
                                $('div.wp_articlecontent').html() &&
                                $('div.wp_articlecontent')
                                    .html()
                                    .replace(/src="\//g, `src="${baseUrl}/`)
                                    .replace(/href="\//g, `href="${baseUrl}/`)
                                    .trim();
                            return item;
                        } catch (e) {
                            // intranet
                            item.description = '请进行统一身份认证之后再访问';
                            return item;
                        }
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
