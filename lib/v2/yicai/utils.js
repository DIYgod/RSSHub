const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const rootUrl = 'https://www.yicai.com';

module.exports = {
    rootUrl,
    ProcessItems: async (apiUrl, tryGet) => {
        const response = await got({
            method: 'get',
            url: apiUrl,
        });

        const items = response.data.map((item) => ({
            title: item.NewsTitle,
            link: /^http/.test(item.url) ? item.url : `${rootUrl}${item.AppID === 0 ? `/vip` : ''}${item.url}`,
            author: item.NewsAuthor || item.NewsSource || item.CreaterName,
            pubDate: timezone(parseDate(item.CreateDate), +8),
            category: [item.ChannelName],
            description: art(path.join(__dirname, 'templates/description.art'), {
                thumb: item.originPic,
                video: item.VideoUrl,
                description: item.NewsNotes,
            }),
        }));

        return Promise.all(
            items.map((item) =>
                tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = cheerio.load(detailResponse.data);

                    content('h1').remove();
                    content('.u-btn6, .m-smallshare, .topic-hot').remove();

                    item.description += content('.multiText, #multi-text, .txt').html() ?? '';

                    return item;
                })
            )
        );
    },
};
