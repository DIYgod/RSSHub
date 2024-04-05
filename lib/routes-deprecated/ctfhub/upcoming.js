const got = require('@/utils/got');
const md5 = require('@/utils/md5');

const host = 'https://api.ctfhub.com';

async function get_details(event_id) {
    const res = await got
        .post(`${host}/User_API/Event/getInfo`, {
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({ event_id }),
        })
        .json();
    if (res.status !== true) {
        return '';
    }
    return res.data;
}

module.exports = async (ctx) => {
    const opt = {
        offset: 0,
        limit: Number.parseInt(ctx.params.limit) || 5,
    };

    const response = await got
        .post(`${host}/User_API/Event/getUpcoming`, {
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(opt),
        })
        .json();

    if (response.status !== true) {
        return;
    }
    const items = await Promise.all(
        response.data.items.map(async (item) => {
            const det = await get_details(item.id);
            return {
                title: item.title,
                description: det.details,
                pubDate: new Date(item.start_time * 1000).toUTCString(),
                link: det.official_url,
                guid: md5(item.title + item.start_time),
            };
        })
    );

    ctx.state.data = {
        title: 'CTFHub Calendar',
        link: 'https://www.ctfhub.com/#/calendar',
        description: '提供全网最全最新的 CTF 赛事信息，关注赛事定制自己专属的比赛日历吧。',
        item: items,
    };
};
