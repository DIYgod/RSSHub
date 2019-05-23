const axios = require('@/utils/axios');

const getLiveUrlById = (liveId) => `https://houxu.app/lives/${liveId}`;

const getLinkDesc = (link) => (link.media === null ? link.description : link.media.name + '：<br />' + link.description);

const realtimeHandler = async () => {
    const res = await axios.get('https://houxu.app/api/1/lives/updated/');

    const out = res.data.results.map((el) => ({
        title: el.last.link.title,
        description: getLinkDesc(el.last.link),
        link: getLiveUrlById(el.id),
        guid: 'realtime-' + el.id + '-' + el.last.id,
        pubDate: new Date(el.last.create_at).toUTCString(),
    }));

    return {
        title: 'Live 实时 - 后续',
        description: 'Live 往事进展',
        link: 'https://houxu.app/lives/realtime',
        item: out,
    };
};

const newHandler = async () => {
    const res = await axios.get('https://houxu.app/api/1/records/index/');
    const out = res.data.results
        .filter((el) => el.type === 'live')
        .map((el) => ({
            title: el.object.title,
            description: el.object.summary,
            link: getLiveUrlById(el.id),
            guid: 'new-' + el.id + '-' + el.object.id,
            pubDate: new Date(el.object.create_at).toUTCString(),
        }));
    return {
        title: '最近 Live - 后续',
        description: 'Live 最新关注',
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
