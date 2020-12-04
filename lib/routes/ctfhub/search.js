const got = require('@/utils/got');

module.exports = async (ctx) => {
    const host = 'https://api.ctfhub.com';
    const opt = { like: {} };
    for (const i of ['title', 'form', 'class']) {
        if (ctx.params[i] !== undefined) {
            opt.like[i] = ctx.params[i];
        }
    }

    if (opt.like.class !== undefined) {
        const types = await got
            .post(`${host}/User_API/Event/getType`, {
                headers: {
                    'content-type': 'application/json',
                },
                body: '{}',
            })
            .json();
        opt.like.class = types.data[opt.like.class];
    }
    if (opt.like.form !== undefined) {
        opt.like.form = ['线上', '线下'][Number.parseInt(opt.like.form)];
    }

    if (Object.keys(opt.like).length === 0) {
        delete opt.like;
    }

    opt.offset = 0;
    opt.limit = Number.parseInt(ctx.params.limit) || 10;

    const response = await got
        .post(`${host}/User_API/Event/getAll`, {
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(opt),
        })
        .json();

    if (response.status !== true) {
        return;
    }
    const data = response.data;

    ctx.state.data = {
        title: 'CTFHub Calendar',
        link: 'https://www.ctfhub.com/#/calendar',
        description: '提供全网最全最新的 CTF 赛事信息，关注赛事定制自己专属的比赛日历吧。',
        item: data.items.map(function (item) {
            return {
                title: item.title,
                description: '',
                pubDate: new Date(item.start_time * 1000).toUTCString(),
                link: item.official_url,
            };
        }),
    };
};
