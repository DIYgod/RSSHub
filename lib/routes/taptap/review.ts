// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
const { getRootUrl, appDetail, X_UA } = require('./utils');

const sortMap = {
    default: {
        en_US: 'Default',
        zh_CN: '预设',
        zh_TW: '預設',
    },
    new: {
        en_US: 'Latest',
        zh_CN: '最新',
        zh_TW: '最新',
    },
    hot: {
        en_US: 'Popular',
        zh_CN: '热门',
        zh_TW: '熱門',
    },
    spent: {
        en_US: 'Play Time',
        zh_CN: '游戏时长',
        zh_TW: '遊戲時長',
    },
};

const intlSortMap = {
    default: {
        en_US: 'Most Relevant',
        zh_TW: '最相關',
        ja_JP: '関連性が高い',
        ko_KR: '관련도순',
    },
    new: {
        en_US: 'Most Recent',
        zh_TW: '最新',
        ja_JP: '最も最近',
        ko_KR: '최근순',
    },
};

const makeSortParam = (isIntl, order) => {
    if (isIntl) {
        if (order === 'new') {
            return `sort=${order}`;
        }
    } else {
        if (order === 'new' || order === 'hot' || order === 'spent') {
            return `sort=${order}`;
        }
    }
    return '';
};

const fetchMainlandItems = async (params) => {
    const id = params.id;
    const order = params.order ?? 'default';
    const lang = params.lang ?? 'zh_CN';

    let url = `${getRootUrl(false)}/webapiv2/review/v2/by-app?app_id=${id}&limit=10`;
    url += `&${makeSortParam(false, order)}`;
    url += `&${X_UA(lang)}`;

    const reviews_list_response = await got(url);
    const reviews_list = reviews_list_response.data.data.list;

    return reviews_list.map((review) => {
        const author = review.moment.author.user.name;
        const score = review.moment.extended_entities.reviews[0].score;
        return {
            title: `${author} - ${score}星`,
            author,
            description: review.moment.extended_entities.reviews[0].contents.text,
            link: `${getRootUrl(false)}/review/${review.moment.extended_entities.reviews[0].id}`,
            pubDate: parseDate(review.moment.extended_entities.reviews[0].created_time * 1000),
        };
    });
};

const fetchIntlItems = async (params) => {
    const id = params.id;
    const order = params.order ?? 'default';
    const lang = params.lang ?? 'en_US';

    let url = `${getRootUrl(true)}/webapiv2/feeds/v1/app-ratings?app_id=${id}&limit=10`;
    url += `&${makeSortParam(true, order)}`;
    url += `&${X_UA(lang)}`;

    const reviews_list_response = await got(url);
    const reviews_list = reviews_list_response.data.data.list;

    return reviews_list.map((review) => {
        const author = review.post.user.name;
        const score = review.post.list_fields.app_ratings[id].score;
        return {
            title: `${author} - ${score}星`,
            author,
            description: review.post.list_fields.summary || review.post.list_fields.title,
            link: `${getRootUrl(true)}/post/${review.post.id_str}`,
            pubDate: parseDate(review.post.published_time * 1000),
        };
    });
};

export default async (ctx) => {
    const is_intl = ctx.req.url.indexOf('/intl/') === 0;
    const id = ctx.req.param('id');
    const order = ctx.req.param('order') ?? 'default';
    const lang = ctx.req.param('lang') ?? (is_intl ? 'en_US' : 'zh_CN');

    const app_detail = await appDetail(id, lang, is_intl);
    const app_img = app_detail.app.icon.original_url;
    const app_name = app_detail.app.title;

    const items = is_intl ? await fetchIntlItems(ctx.params) : await fetchMainlandItems(ctx.params);

    ctx.set('data', {
        title: `TapTap 评价 ${app_name} - ${(is_intl ? intlSortMap : sortMap)[order][lang]}排序`,
        link: `${getRootUrl(is_intl)}/app/${id}/review?${makeSortParam(is_intl, order)}`,
        image: app_img,
        item: items,
    });

    ctx.set('json', {
        title: `TapTap 评价 ${app_name} - ${(is_intl ? intlSortMap : sortMap)[order][lang]}排序`,
        link: `${getRootUrl(is_intl)}/app/${id}/review?${makeSortParam(is_intl, order)}`,
        image: app_img,
        item: items,
    });
};
