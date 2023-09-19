const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const xmut = 'https://jwc.xmut.edu.cn';

module.exports = async (ctx) => {
    const { category = 'jwxt' } = ctx.params;
    const url = `${xmut}/index/tzgg/${category}.htm`;
    const res = await got(url, {
        headers: {
            referer: xmut,
        },
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = cheerio.load(res.data);
    const itemsArray = $('#result_list table tbody tr')
        .map((index, row) => {
            const res = $('td', row).eq(0);
            const resDate = $('td', row).eq(1);
            const resLink = $('a', res).attr('href');
            let link;
            if (resLink.startsWith('../../')) {
                const parsedUrl = new URL(resLink, xmut);
                link = parsedUrl.href;
            } else {
                link = resLink;
            }
            const title = $('a', res).attr('title');
            const pubDate = parseDate(resDate.text().trim());
            return {
                title,
                link,
                pubDate,
            };
        })
        .get();
    const items = await Promise.all(
        itemsArray.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const res = await got(item.link, {
                    headers: {
                        referer: xmut,
                    },
                    https: {
                        rejectUnauthorized: false,
                    },
                });
                const $item = cheerio.load(res.data);
                const content = $item('table #result #content form div #vsb_content_6').html();
                item.description = content;
                return item;
            })
        )
    );
    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: items,
    };
};
