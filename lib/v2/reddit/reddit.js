const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseRelativeDate } = require('@/utils/parse-date');

const baseUrl = 'https://www.reddit.com';

module.exports = async (ctx) => {
    const channel = ctx.params.channel;

    const { data } = await got({
        url: `${baseUrl}/r/${channel}`,
    });

    const $ = cheerio.load(data); // 使用 cheerio 加载返回的 HTML
    const list = $('div.Post');

    const items = list.toArray().map((e) => {
        const item = $(e);
        return {
            title: item.find('[data-adclicklocation="title"] h3').text(),
            description: `${item.find('div.RichTextJSON-root').text()} ${item.find('img').toString()} ${item.find('video').toString()} `,
            author: item.find('[data-click-id="user"]').text(),
            link: `${baseUrl}${item.find('[data-click-id="body"]').attr('href')}`,
            pubDate: parseRelativeDate(item.find('[data-testid="post_timestamp"]').text()),
        };
    });

    ctx.state.data = {
        title: `Reddit: /r/${channel}`,
        description: 'Reddit Community',
        link: `${baseUrl}/r/${channel}`,
        // image: '',
        item: items.filter((x) => x.link.length > 40),
        language: 'en-US',
    };
};
