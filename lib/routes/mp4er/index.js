const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const type = ctx.params.type || 'all';
    const caty = ctx.params.caty || 'all';
    const area = ctx.params.area || 'all';
    const year = ctx.params.year || 'all';
    const order = ctx.params.order || '0';

    const rootUrl = 'https://www.mp4er.com';
    const currentUrl = `${rootUrl}/s/${caty}?${type === 'all' ? '' : '&type=' + type}${area === 'all' ? '' : '&area=' + area}${year === 'all' ? '' : '&year=' + year}&order=${order}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let jsessionid = '';

    const list = $('.card a')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            const link = item.attr('href').split(';jsessionid=');
            jsessionid = link[1];
            return {
                title: item.attr('title'),
                link: `${rootUrl}${link[0]}`,
                pubDate: Date.parse(item.parent().find('.meta span').text()),
            };
        })
        .get();

    const headers = {
        cookie: `JSESSIONID=${jsessionid}`,
    };

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    headers,
                });
                const downloadResponse = await got({
                    method: 'get',
                    url: `${rootUrl}/downloadInfo/list?mid=${item.link.split('/')[4].split('.')[0]}`,
                    headers,
                });
                const content = cheerio.load(detailResponse.data);

                let downloadLinks = '';
                for (const downloadLink of downloadResponse.data) {
                    downloadLinks += `<div class="item"><div class="content">${downloadLink.downloadCategory.name}: <a href="${downloadLink.url}">${downloadLink.url}</a></div></div>`;
                }

                const torrents = content('#torrent-list .list');

                item.description = content('.info0').html() + `<div><b>下载地址：</b>${downloadLinks}</div>` + `${torrents.html() ? `<div><b>种子列表：</b>${torrents.html()}</div>` : ''}`;
                item.enclosure_url = torrents.html() ? `${rootUrl}${torrents.find('a.header').last().attr('href')}` : downloadResponse.data.pop().url;
                item.enclosure_type = 'application/x-bittorrent';

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '哔嘀影视',
        link: currentUrl,
        item: items,
    };
};
