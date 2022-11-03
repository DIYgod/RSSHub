const got = require('@/utils/got');
const utils = require('./utils');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const usertype = ctx.params.usertype;

    const { data } = await got(`https://www.zhihu.com/${usertype}/${id}/posts`, {
        headers: {
            ...utils.header,
            Referer: `https://www.zhihu.com/${usertype}/${id}/`,
        },
    });
    const $ = cheerio.load(data);
    const jsondata = $('#js-initialData');
    const authorname = $('.ProfileHeader-name')
        .contents()
        .filter((_index, element) => element.type === 'text')
        .text();
    const authordescription = $('.ProfileHeader-headline').text();

    const parsed = JSON.parse(jsondata.html());
    const articlesdata = parsed.initialState.entities.articles;

    const list = Object.keys(articlesdata).map((key) => {
        const $ = cheerio.load(articlesdata[key].content, null, false);
        $('noscript').remove();
        $('img').each((_, item) => {
            if (item.attribs['data-actualsrc'] || item.attribs['data-original']) {
                item.attribs['data-actualsrc'] = item.attribs['data-actualsrc'] ? item.attribs['data-actualsrc'].split('?source')[0] : null;
                item.attribs['data-original'] = item.attribs['data-original'] ? item.attribs['data-original'].split('?source')[0] : null;
                item.attribs.src = item.attribs['data-original'] || item.attribs['data-actualsrc'];
                delete item.attribs['data-actualsrc'];
                delete item.attribs['data-original'];
            }
        });
        return {
            title: articlesdata[key].title,
            description: $.html(),
            link: articlesdata[key].url,
            pubDate: parseDate(articlesdata[key].created, 'X'),
        };
    });

    ctx.state.data = {
        title: `${authorname} 的知乎文章`,
        link: `https://www.zhihu.com/${usertype}/${id}/posts`,
        description: authordescription,
        item: list,
    };
};
