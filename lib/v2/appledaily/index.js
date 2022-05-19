const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const path = require('path');
const { art } = require('@/utils/render');

const rootUrl = 'https://tw.appledaily.com';

const channelMap = {
    home: '首頁',
    recommend: '焦点',
    new: '最新',
    hot: '热门',
    life: '生活',
    entertainment: '娱乐',
    local: '社会',
    property: '财经地产',
    international: '国际',
    politics: '政治',
    gadget: '3C车城',
    supplement: '吃喝玩乐',
    sports: '体育',
    forum: '苹评理',
    micromovie: '微视频',
};

module.exports = async (ctx) => {
    const channel = ctx.params.channel ?? 'home';
    const url = `${rootUrl}${channel === 'home' ? '/home' : `/realtime/${channel}`}`;

    const response = await got.get(url);
    const $ = cheerio.load(response.data);
    const list = $('div.flex-feature')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 25)
        .map((_, item) => {
            const title = $(item).find('span.headline').text();
            const link = rootUrl + $(item).find('a').attr('href');
            const pubDate = parseDate($(item).find('div.timestamp').text(), 'YYYY/MM/DD HH:mm');

            return {
                title,
                link,
                pubDate,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got.get(item.link);
                const content = cheerio.load(detailResponse.data);
                const dataJs = content('script#fusion-metadata').html();
                const descDataJSON = JSON.parse(dataJs.match(/Fusion.globalContent=(.*);Fusion.globalConte/)[1]);
                item.description = art(path.join(__dirname, 'templates/content.art'), {
                    content_elements: descDataJSON.content_elements,
                });

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `蘋果日報 - ${channelMap[channel]}`,
        link: url,
        item: items,
    };
};
