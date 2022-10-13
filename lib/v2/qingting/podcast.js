const crypto = require('crypto');
const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const channelUrl = `https://i.qingting.fm/capi/v3/channel/${ctx.params.id}`;
    let response = await got({
        method: 'get',
        url: channelUrl,
        headers: {
            Referer: 'https://www.qingting.fm/',
        },
    });
    const title = response.data.data.title;
    const channel_img = response.data.data.thumbs['400_thumb'];
    const authors = response.data.data.podcasters.map((author) => author.nick_name).join(',');
    const desc = response.data.data.description;
    const programUrl = `https://i.qingting.fm/capi/channel/${ctx.params.id}/programs/${response.data.data.v}?curpage=1&pagesize=10&order=asc`;
    response = await got({
        method: 'get',
        url: programUrl,
        headers: {
            Referer: 'https://www.qingting.fm/',
        },
    });

    const resultItems = await Promise.all(
        response.data.data.programs.map((item) =>
            ctx.cache.tryGet(`qingting:podcast:${ctx.params.id}:${item.id}`, async () => {
                const link = `https://www.qingting.fm/channels/${ctx.params.id}/programs/${item.id}/`;

                const path = `/audiostream/redirect/${ctx.params.id}/${item.id}?access_token=&device_id=MOBILESITE&qingting_id=&t=${new Date().getTime()}`;
                const sign = crypto.createHmac('md5', 'fpMn12&38f_2e').update(path).digest('hex').toString();

                const [detailRes, mediaRes] = await Promise.all([
                    got({
                        method: 'get',
                        url: link,
                        headers: {
                            Referer: 'https://www.qingting.fm/',
                        },
                    }),
                    got({
                        method: 'get',
                        url: `https://audio.qingting.fm${path}&sign=${sign}`,
                        headers: {
                            Referer: 'https://www.qingting.fm/',
                        },
                    }),
                ]);

                const detail = JSON.parse(detailRes.data.match(/},"program":(.*?),"plist":/)[1]);

                return {
                    title: item.title,
                    link,
                    itunes_item_image: item.cover,
                    itunes_duration: item.duration,
                    pubDate: timezone(parseDate(item.update_time), +8),
                    description: detail.richtext,
                    enclosure_url: mediaRes.url,
                    enclosure_type: 'audio/x-m4a',
                };
            })
        )
    );

    ctx.state.data = {
        title: `${title} - 蜻蜓FM`,
        description: desc,
        itunes_author: authors,
        image: channel_img,
        link: `https://www.qingting.fm/channels/${ctx.params.id}`,
        item: resultItems,
    };
};
