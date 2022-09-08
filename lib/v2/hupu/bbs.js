const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '34';
    const order = ctx.params.order ?? '1';

    const rootUrl = 'https://bbs.hupu.com';
    const apiRootUrl = 'https://games.mobileapi.hupu.com';
    const currentUrl = `${rootUrl}/${id}${order === '1' ? `-postdate` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    $('.page-icon').remove();

    let items = $('.bbs-sl-web-post-layout .post-title a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
                pubDate: timezone(parseDate(item.parent().parent().find('.post-time').text(), 'MM-DD HH:mm'), +8),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                try {
                    let detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = cheerio.load(detailResponse.data);

                    content('.seo-dom').remove();

                    item.author = content('.post-user-comp-info-top-name').first().text();
                    item.description = content('.main-thread').first().html();

                    const matches = detailResponse.data.match(/matchId=(\d+)-BATTLE_REPORT/);

                    if (matches) {
                        detailResponse = await got({
                            method: 'get',
                            url: `${apiRootUrl}/1/7.5.36/basketballapi/news/battleReport?relationId=${matches[1]}&relationType=BATTLE_REPORT`,
                        });

                        const result = detailResponse.data.result;

                        item.description = art(path.join(__dirname, 'templates/description.art'), {
                            image: result.img,
                            description: result.beginContent,
                            keyEvent: result.keyEvent,
                            playerImage: result.playerScoreImg,
                        });
                    }
                } catch (e) {
                    // no-empty
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `虎扑社区 - ${$('.bbs-sl-web-intro-detail-title').text()}`,
        link: currentUrl,
        item: items,
        description: $('.bbs-sl-web-intro-detail-desc-text').first().text(),
    };
};
