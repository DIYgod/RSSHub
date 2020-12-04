const got = require('@/utils/got');

const getLiveUrlById = (liveId) => `https://houxu.app/lives/${liveId}`;

const realtimeHandler = async () => {
    const res = await got.get('https://houxu.app/api/1/lives/updated/');

    const out = res.data.results.map((el) => ({
        title: el.last.link.title,
        description: el.last.link.description,
        author: el.last.link.media ? el.last.link.media.name : null,
        link: getLiveUrlById(el.id),
        guid: 'realtime-' + el.id + '-' + el.last.id,
        pubDate: new Date(el.news_update_at).toUTCString(),
    }));

    return {
        title: '往事进展 - 后续',
        description: 'Live 往事进展',
        link: 'https://houxu.app/lives/realtime',
        item: out,
    };
};

const newHandler = async () => {
    const res = await got.get('https://houxu.app/api/1/records/index/');
    const out = res.data.results
        .filter((el) => el.type === 'live')
        .map((el) => ({
            title: el.object.title,
            description: el.object.summary,
            link: getLiveUrlById(el.object.id),
            guid: 'new-' + el.object.id,
            pubDate: new Date(el.publish_at).toUTCString(),
        }));
    return {
        title: '最新添加 - 后续',
        description: 'Live 最新添加',
        link: 'https://houxu.app/lives/new',
        item: out,
    };
};

module.exports = async (ctx) => {
    const { type } = ctx.params;

    switch (type) {
        case 'realtime':
            ctx.state.data = await realtimeHandler();
            break;
        case 'new':
            ctx.state.data = await newHandler();
            break;
        default:
            ctx.throw(404, 'Unknown lives type');
            return;
    }
};
