const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const baseUrl = 'https://xsijishe.com';

module.exports = async (ctx) => {
    const fid = ctx.params.fid;
    const url = `${baseUrl}/forum-${fid}-1.html`;
    const resp = await got(url);
    const $ = cheerio.load(resp.data);
    const forumCategory = $('.nex_bkinterls_top .nex_bkinterls_ls a').text();
    let items = $('[id^="normalthread"]')
        .toArray()
        .map((item) => {
            item = $(item);
            const nexAuthorBtms = item.find('.nex_author_btms');
            const nexForumtitTopA = item.find('.nex_forumtit_top a').first();
            const nexFtdate = nexAuthorBtms.find('.nex_ftdate');
            let pubDate;
            if (nexFtdate.find('span').length > 0) {
                pubDate = nexFtdate.find('span').attr('title');
            } else {
                pubDate = nexFtdate.text().replace('发表于', '');
            }
            return {
                title: nexForumtitTopA.text().trim(),
                pubDate: parseDate(pubDate.trim()),
                category: nexAuthorBtms.find('em a').text().trim(),
                link: baseUrl + '/' + nexForumtitTopA.attr('href'),
                author: item.find('.nex_threads_author').find('a').text().trim(),
            };
        });
    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const resp = await got(item.link);
                const $ = cheerio.load(resp.data);
                const firstViewBox = $('.t_f').first();

                firstViewBox.find('img').each((_, img) => {
                    img = $(img);
                    if (img.attr('zoomfile')) {
                        img.attr('src', img.attr('zoomfile'));
                        img.removeAttr('zoomfile');
                        img.removeAttr('file');
                    }
                    img.removeAttr('onmouseover');
                });

                item.description = firstViewBox.html();
                return item;
            })
        )
    );
    ctx.state.data = {
        title: `司机社${forumCategory}论坛`,
        link: url,
        description: `司机社${forumCategory}论坛`,
        item: items,
    };
};
