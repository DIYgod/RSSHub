const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const node = ctx.params.node ?? 1;
    const currentUrl = `https://6api.ycwb.com/app_if/jy/getArticles?nodeid=${node}&pagesize=15`;

    const { data: response } = await got(currentUrl);

    const list = response.artiles.map((item) => ({
        title: item.TITLE,
        description: art(path.join(__dirname, 'templates/description.art'), {
            thumb: item.PICLINKS,
            description: item.ABSTRACT,
        }),
        pubDate: timezone(parseDate(item.PUBTIME), +8),
        link: item.PUBURL,
        nodeName: item.NODENAME,
    }));

    let nodeName = '';
    let nodeLink = '';

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
                    // Filter author from comments
                    if (this.data.match(/author/)) {
                        item.author = this.data.split('<author>')[1].split('</author>')[0];
                    }
                });

                nodeName = nodeName === '' ? item.nodeName : nodeName;

                // Filter node link from content('.path a')
                const children = content('.path').children('a');
                for (const child of children) {
                    if (content(child).text() === nodeName && nodeLink === '') {
                        nodeLink = content(child).attr('href');
                    }
                }

                content('span').removeAttr('style').removeAttr('class');
                content('img').removeAttr('style').removeAttr('class').removeAttr('placement').removeAttr('data-toggle').removeAttr('trigger').removeAttr('referrerpolicy');
                content('br').removeAttr('style').removeAttr('class');
                content('p').removeAttr('style').removeAttr('class');
                content('.space10, .ddf').remove();

                item.description += content('.main_article').html() ?? '';

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `羊城晚报金羊网 - ${nodeName}`,
        link: String(nodeLink === '' ? 'https://www.ycwb.com/' : nodeLink),
        item: items,
    };
};
