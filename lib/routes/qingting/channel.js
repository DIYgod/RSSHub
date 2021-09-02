const crypto = require('crypto');
const got = require('@/utils/got');

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
            ctx.cache.tryGet(item, async () => {
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
                    pubDate: new Date(item.update_time).toUTCString(),
                    description: detail.richtext,
                    enclosure_url: mediaRes.url,
                    enclosure_type: 'audio/x-m4a',
                    enclosure_length: item.duration,
                };
            })
        )
    );

    ctx.state.data = {
        title: `${title} - 蜻蜓FM`,
        link: `https://www.qingting.fm/channels/${ctx.params.id}`,
        item: resultItems,
    };
};
