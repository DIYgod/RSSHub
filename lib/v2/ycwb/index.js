const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const node = ctx.params.node ?? 1;
    const page = ctx.params.page ?? 1;
    const pageSize = ctx.params.pagesize ?? 15;
    const currentUrl = `https://6api.ycwb.com/app_if/jy/getArticles?nodeid=${node}&page=${page}&pagesize=${pageSize}`;

    const { data: response } = await got(currentUrl);

    const list = response.artiles.map((item) => ({
        title: item.TITLE,
        description: art(path.join(__dirname, 'templates/description.art'), {
            thumb: item.PICLINKS,
            description: item.ABSTRACT,
        }),
        pubDate: item.PUBTIME,
        link: item.PUBURL,
        thumb: item.PICLINKS,
        nodeName: item.NODENAME,
    }));

    let nodeName = '';

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                const $comments = content('.main_article')
                    .contents()
                    .filter(function () {
                        return this.nodeType === 8;
                    });
                $comments.each(function () {
                    // Remove useless comments
                    if (this.data.match(/audioPlayer|audio-box/)) {
                        this.data = '';
                    }
                    // Filter node name from comments
                    if (this.data.match(/nodename/)) {
                        nodeName = this.data.split('<nodename>')[1].split('</nodename>')[0];
                    }
                });

                content('span').removeAttr('style').removeAttr('class');
                content('img').removeAttr('style').removeAttr('class').removeAttr('placement').removeAttr('data-toggle').removeAttr('trigger').removeAttr('referrerpolicy');
                content('br').removeAttr('style').removeAttr('class');
                content('p').removeAttr('style').removeAttr('class');
                content('.space10, .ddf').remove();

                item.description += content('.main_article').html() ?? '';

                nodeName = item.nodeName;
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `羊城晚报金羊网 - ${nodeName}`,
        link: 'http://www.ycwb.com',
        item: items,
    };
};
