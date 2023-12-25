const got = require('@/utils/got');
const cheerio = require('cheerio');
const baseUrl = 'https://xsijishe.com';

module.exports = async (ctx) => {
    const rankType = ctx.params.type;
    let title;
    let rankId;
    if (rankType === 'weekly') {
        title = '司机社综合周排行榜';
        rankId = 'nex_recons_demens';
    } else if (rankType === 'monthly') {
        title = '司机社综合月排行榜';
        rankId = 'nex_recons_demens1';
    } else {
        throw Error('Invalid rank type');
    }
    const url = `${baseUrl}/portal.php`;
    const resp = await got(url);
    const $ = cheerio.load(resp.data);
    let items = $(`#${rankId} dd`)
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('h5').text().trim();
            const link = item.find('a').attr('href');
            return {
                title,
                link: `${baseUrl}/${link}`,
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
        title,
        link: url,
        description: title,
        item: items,
    };
};
