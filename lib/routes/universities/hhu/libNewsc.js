const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const host = 'http://lib.hhuc.edu.cn';

module.exports = async (ctx) => {
    const response = await got.get(`${host}/7530/list.htm`);

    const data = response.data;
    const $ = cheerio.load(data);

    const links = $('#table29 tbody tr td table tbody tr td')
        .map((i, el) => {
            el = $(el);
            return {
                link: el.find('a').attr('href'),
                title: el.find('a').attr('title'),
            };
        })
        .get();

    const item = await Promise.all(
        [...links].map(async ({ title, link }) => {
            if (link.indexOf('.htm') !== -1) {
                const realLink = `${link.indexOf('http') === -1 ? host : ''}${link}`;

                const { data } = await got.get(realLink);

                const $ = cheerio.load(data);

                $('#table28 tbody tr td a').remove();

                let description, pubDate;
                // page from hhu
                if (realLink.indexOf('hhuc') === -1) {
                    pubDate = $('span.time').text();
                    description =
                        $('div.content') &&
                        $('div.content')
                            .html()
                            .replace(/src="\//g, `src="${url.resolve(host, '.')}`)
                            .replace(/href="\//g, `href="${url.resolve(host, '.')}`)
                            .trim();
                }
                // page from hhuc
                else {
                    pubDate = $('.Article_PublishDate').text();
                    description =
                        $('#table28') &&
                        $('#table28')
                            .html()
                            .replace(/src="\//g, `src="${url.resolve(host, '.')}`)
                            .replace(/href="\//g, `href="${url.resolve(host, '.')}`)
                            .trim();
                }
                // something went wrong
                if (!description) {
                    return;
                }
                return Promise.resolve({ pubDate, link, title, description });
            } else {
                // not a webpage, so return a brief info
                return Promise.resolve({ link, title, description: '请前往源网站查看内容' });
            }
        })
    );

    ctx.state.data = {
        link: `${host}/7530/list.htm`,
        title: '河海大学常州校区图书馆-新闻动态',
        description: '河海大学常州校区图书馆-新闻动态',
        item: item.filter((i) => i),
    };
};
