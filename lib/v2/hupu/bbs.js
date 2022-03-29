const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseRelativeDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '34';
    const order = ctx.params.order ?? '1';

    const rootUrl = 'https://m.hupu.com';
    const currentUrl = `${rootUrl}/api/v1/bbs-forumthreadlist-frontend/${id}-1?postdate=${order}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    let items = response.data.data.t_list.map((item) => ({
        title: item.title,
        link: `${rootUrl}/bbs/${item.tid}.html`,
        pubDate: timezone(parseRelativeDate(item.t_post), +8),
    }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                try {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = cheerio.load(detailResponse.data);

                    const videos = [];

                    content('.thread-video-wrap').each(function () {
                        videos.push(content('video').attr('src'));
                        content(this).remove();
                    });

                    item.author = content('.bbs-user-info-name').first().text();
                    item.description = art(path.join(__dirname, 'templates/description.art'), {
                        videos,
                        description: content('#bbs-thread-content').html(),
                    });
                } catch (e) {
                    // no-empty
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `虎扑社区 - ${response.data.data.keywords}`,
        link: currentUrl,
        item: items,
        description: response.data.data.description,
    };
};
