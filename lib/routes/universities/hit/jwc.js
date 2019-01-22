const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');

const baseUrl = 'http://jwc.hit.edu.cn';
const type = (filename) => filename.split('.').pop();

module.exports = async (ctx) => {
    const response = await axios.get(`${baseUrl}/2591/list.htm`);

    const { data } = response;
    const $ = cheerio.load(data);
    const links = $('.news_list li')
        .map((i, el) => ({
            pubDate: new Date(
                $('span.fbll', el)
                    .children()
                    .first()
                    .text()
                    .replace('[', '')
            ).toUTCString(),
            link: url.resolve(baseUrl, $('a', el).attr('href')),
            title: $('a', el).attr('title'),
        }))
        .get();

    const item = await Promise.all(
        [...links].slice(0, 10).map(async ({ pubDate, link, title }) => {
            if (type(link) === 'htm') {
                const { data } = await axios.get(link);
                const $ = cheerio.load(data);

                const author = $('p.arti_metas>span:nth-child(3)')
                    .text()
                    .trim();
                const description =
                    $('div.wp_articlecontent').html() &&
                    $('div.wp_articlecontent')
                        .html()
                        .replace(/src="\//g, `src="${url.resolve(baseUrl, '.')}`)
                        .replace(/href="\//g, `href="${url.resolve(baseUrl, '.')}`)
                        .trim();
                // check for some bug links.
                if (!description) {
                    return;
                }
                return Promise.resolve({ pubDate, author, link, title, description });
            } else {
                // file to download
                return Promise.resolve({ pubDate, link, title, description: '此链接为文件，点击以下载' });
            }
        })
    );

    ctx.state.data = {
        title: '哈尔滨工业大学教务处通知公告',
        link: `${baseUrl}/2591/list.htm`,
        item: item.filter((x) => x),
    };
};
