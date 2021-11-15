import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const {
        userid
    } = ctx.params;
    const url = `https://m.vuevideo.net/share/user/${userid}`;

    const {
        data
    } = await got({
        method: 'get',
        url,
    });
    const $ = cheerio.load(data);
    const list = $('#hotVideosUl li').get();
    const author = $('.infoItem.name').text();

    const ProcessFeed = (data) => {
        const $ = cheerio.load(data);

        $('#openBtn').html('APP播放');

        // 提取内容
        return $('.videoContainer').html() + '<br>' + $('.footer').html();
    };

    const items = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const link = $('a').attr('href');

            const cache = await ctx.cache.get(link);
            if (cache) {
                return JSON.parse(cache);
            }

            const response = await got({
                method: 'get',
                url: link,
            });

            const description = ProcessFeed(response.data);

            const single = {
                title: $('.videoTitle').text(),
                description,
                link,
                author,
            };
            ctx.cache.set(link, JSON.stringify(single));
            return single;
        })
    );

    ctx.state.data = {
        title: $('title').text(),
        link: url,
        description: $('meta[property="og:description"]').attr('content') || $('title').text(),
        item: items,
    };
};
