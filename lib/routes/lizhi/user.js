const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = `https://www.lizhi.fm/api/user/audios/${ctx.params.id}/1`;
    const response = await got({
        method: 'get',
        url: link,
    });

    const userUrl = `https://m.lizhi.fm/vod/user/${ctx.params.id}`;
    const userResponse = await got({
        method: 'get',
        url: userUrl,
    });
    const $ = cheerio.load(userResponse.data);

    const list = response.data.audios.map((item) => ({
        title: item.name,
        enclosure_url: item.url,
        enclosure_length: item.duration,
        enclosure_type: 'audio/mpeg',
        link: `https://www.lizhi.fm/${$('div.user_info div.desc span').eq(0).text().replace('FM ', '')}/${item.id}`,
        pubDate: new Date(item.create_time).toUTCString(),
    }));

    ctx.state.data = {
        title: `荔枝FM - ${$('div.username h3.name').text()}`,
        link: `https://www.lizhi.fm/user/${ctx.params.id}`,
        itunes_author: $('div.username h3.name').text(),
        itunes_category: '',
        image: `http://${$('div.user_info div.cover img').attr('src').replace('200x200', '320x320')}`,
        item: await Promise.all(
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const res = await got({ method: 'get', url: item.link });
                    const content = cheerio.load(res.data);
                    item.description = content('div.desText').text();
                    item.itunes_item_image = content('div.audioCover img').attr('src');
                    return item;
                })
            )
        ),
        description: `${$('div.isAll').text()}`,
    };
};
