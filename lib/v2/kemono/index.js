const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const source = ctx.params.source ?? '';
    const id = ctx.params.id;

    const rootUrl = 'https://kemono.party';
    const apiUrl = `${rootUrl}/api/discord/channels/lookup?q=${id}`;
    const currentUrl = `${rootUrl}/${source ? `${source}/${source === 'discord' ? `server/${id}` : `user/${id}`}` : 'posts'}`;

    const headers = {
        cookie: '__ddg2=sBQ4uaaGecmfEUk7',
    };

    const response = await got({
        method: 'get',
        url: source === 'discord' ? apiUrl : currentUrl,
        headers,
    });

    let items = [],
        title = '';

    if (source === 'discord') {
        title = `Posts of ${id} from Discord | Kemono`;

        items = await Promise.all(
            response.data.map((channel) =>
                ctx.cache.tryGet(channel.id, async () => {
                    const channelResponse = await got({
                        method: 'get',
                        url: `${rootUrl}/api/discord/channel/${channel.id}?skip=0`,
                        headers,
                    });

                    return channelResponse.data
                        .filter((i) => i.content || i.attachments)
                        .map((i) => ({
                            title: i.content,
                            description: art(path.join(__dirname, 'templates', 'discord.art'), { i }),
                            author: `${i.author.username}#${i.author.discriminator}`,
                            pubDate: parseDate(i.published),
                            category: channel.name,
                            guid: `kemono:${source}:${i.server}:${i.channel}:${i.id}`,
                            link: `https://discord.com/channels/${i.server}/${i.channel}/${i.id}`,
                        }));
                })
            )
        );
        items = items.flat();
    } else {
        const $ = cheerio.load(response.data);

        title = $('title').text();

        items = await Promise.all(
            $('.card-list__items')
                .find('a')
                .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 25)
                .toArray()
                .map((item) => {
                    item = $(item);

                    return {
                        link: `${rootUrl}${item.attr('href')}`,
                    };
                })
                .map((item) =>
                    ctx.cache.tryGet(item.link, async () => {
                        const detailResponse = await got({
                            method: 'get',
                            url: item.link,
                            headers,
                        });

                        const content = cheerio.load(detailResponse.data);

                        content('.post__thumbnail').each(function () {
                            const href = content(this).find('.fileThumb').attr('href');
                            content(this).html(`<img src="${href.startsWith('http') ? href : rootUrl + href}">`);
                        });

                        item.description = content('.post__body').html();
                        item.author = content('.post__user-name').text();
                        item.title = content('.post__title span').first().text();
                        item.pubDate = parseDate(content('.timestamp').attr('datetime'));

                        return item;
                    })
                )
        );
    }

    ctx.state.data = {
        title,
        link: currentUrl,
        item: items,
    };
};
