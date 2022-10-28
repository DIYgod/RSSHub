const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const types = {
    0: '动态',
    7: '书评',
    12: '视频',
};

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '';
    const type = ctx.params.type ? parseInt(ctx.params.type) : 0;
    const count = ctx.query.limit ? parseInt(ctx.query.limit) : 100;

    const rootUrl = 'https://m.igetget.com';
    const currentUrl = `${rootUrl}/native/mine/account#/user/detail?enId=${id}`;
    const apiUrl = `${rootUrl}/native/api/homePage/topicNote`;
    const infoUrl = `${rootUrl}/native/api/homePage/userInfo`;

    const detailResponse = await got({
        method: 'post',
        url: infoUrl,
        json: {
            hazy: id,
        },
    });

    const data = detailResponse.data;

    const author = data.c.nickname;
    const image = data.c.avatar;
    const description = `${data.c.v_info}: ${data.c.slogan}`;

    const response = await got({
        method: 'post',
        url: apiUrl,
        json: {
            uid: null,
            max_id_str: '0',
            count,
            max_createtime: 0,
            is_only_repost: 0,
            load_chain: true,
            load_tag: 1,
            source: 0,
            note_type: type,
            only_origin: false,
            with_highlight: true,
            hazy: id,
        },
    });

    const items = response.data.c.list.map((item) => ({
        author,
        title: item.content || item.note || item.extra.title,
        link: item.share_url,
        pubDate: parseDate(item.create_time * 1000),
        description: art(path.join(__dirname, 'templates/user.art'), {
            rootUrl,
            name: item.origin_notes_owner.name,
            vinfo: item.origin_notes_owner.Vinfo,
            content: item.content,
            note: item.note,
            extra: item.extra,
            video: item.video.video_cover,
        }),
    }));

    ctx.state.data = {
        title: `${author}的得到主页 - ${types[type]}`,
        link: currentUrl,
        item: items,
        image,
        description,
        allowEmpty: true,
    };
};
