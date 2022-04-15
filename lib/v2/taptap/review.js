const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { rootUrl, X_UA } = require('./utils');

const sortMap = {
    default: {
        zh_CN: '预设',
        zh_TW: '預設',
    },
    new: {
        zh_CN: '最新',
        zh_TW: '最新',
    },
    hot: {
        zh_CN: '热门',
        zh_TW: '熱門',
    },
    spent: {
        zh_CN: '游戏时长',
        zh_TW: '遊戲時長',
    },
};

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const order = ctx.params.order ?? 'default';
    const lang = ctx.params.lang ?? 'zh_CN';

    let url = `${rootUrl}/webapiv2/review/v2/by-app?app_id=${id}&limit=10`;
    let sortParam;
    if (order === 'new' || order === 'hot' || order === 'spent') {
        sortParam = `sort=${order}`;
        url += `&${sortParam}`;
    }
    url += `&${X_UA(lang)}`;

    const reviews_list_response = await got(url);
    const reviews_list = reviews_list_response.data;

    const app_img = reviews_list.data.list[0].moment.app.icon.url;
    const app_name = reviews_list.data.list[0].moment.app.title;

    const items = reviews_list.data.list.map((review) => {
        const author = review.moment.author.user.name;
        const score = review.moment.extended_entities.reviews[0].score;
        return {
            title: `${author} - ${score}星`,
            author,
            description: review.moment.extended_entities.reviews[0].contents.text,
            link: `${rootUrl}/review/${review.moment.extended_entities.reviews[0].id}`,
            pubDate: parseDate(review.moment.extended_entities.reviews[0].created_time * 1000),
        };
    });

    ctx.state.data = {
        title: `TapTap 评价 ${app_name} - ${sortMap[order][lang]}排序`,
        link: `${rootUrl}/app/${id}/review${sortParam ? `?${sortParam}` : ''}`,
        image: app_img,
        item: items,
    };

    ctx.state.json = {
        title: `TapTap 评价 ${app_name} - ${sortMap[order][lang]}排序`,
        link: `${rootUrl}/app/${id}/review${sortParam ? `?${sortParam}` : ''}`,
        image: app_img,
        item: items,
        reviews_list,
    };
};
