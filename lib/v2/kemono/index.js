const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

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

        await Promise.all(
            response.data.map(async (channel) => {
                await ctx.cache.tryGet(channel.id, async () => {
                    const channelResponse = await got({
                        method: 'get',
                        url: `${rootUrl}/api/discord/channel/${channel.id}?skip=0`,
                        headers,
                    });

                    items.push(
                        ...channelResponse.data
                            .filter((i) => i.content || i.attachments)
                            .map((i) => ({
                                title: i.content,
                                description: (i.content ? `<p>${i.content}</p>` : '') + (i.attachments ? i.attachments.map((a) => `<img src="${rootUrl}${a.path}">`).join('') : ''),
                                author: i.author.username,
                                pubDate: parseDate(i.published),
                                category: channel.name,
                            }))
                    );
                });
            })
        );
    } else {
        const $ = cheerio.load(response.data);

        title = $('title').text();

        items = await Promise.all(
            $('.post-card')
                .find('.fancy-link')
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
                            content(this).html(`<img src="${rootUrl}${content(this).find('.fileThumb').attr('href')}">`);
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
