import got from '~/utils/got.js';
import cheerio from 'cheerio';
import url from 'url';

const host = 'http://lib.hhuc.edu.cn';

export default async (ctx) => {
    const {
        data
    } = await got.get(`${host}/7530/list.htm`);
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
        links.slice().map(async ({ title, link }) => {
            if (link.includes('.htm')) {
                const realLink = `${!link.includes('http') ? host : ''}${link}`;

                const { data } = await got.get(realLink);

                const $ = cheerio.load(data);

                $('#table28 tbody tr td a').remove();

                let description;
                let pubDate;
                // page from hhu
                if (!realLink.includes('hhuc')) {
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
                return { pubDate, link, title, description };
            } else {
                // not a webpage, so return a brief info
                return { link, title, description: '请前往源网站查看内容' };
            }
        })
    );

    ctx.state.data = {
        link: `${host}/7530/list.htm`,
        title: '河海大学常州校区图书馆-新闻动态',
        description: '河海大学常州校区图书馆-新闻动态',
        item: item.filter(Boolean),
    };
};
