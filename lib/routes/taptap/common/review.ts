import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { appDetail, getRootUrl, X_UA } from '../utils';

/*
const sortMap = {
    default: {
        en_US: 'Default',
        zh_CN: '预设',
        zh_TW: '預設',
    },
    recent: {
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
    helpful: {
        en_US: 'Most Helpful',
        zh_TW: '最有幫助',
        ja_JP: '最も役立つ',
        ko_KR: '가장 도움이 된',
    },
    recent: {
        en_US: 'Most Recent',
        zh_TW: '最新',
        ja_JP: '最も最近',
        ko_KR: '최근순',
    },
};
*/

const makeSortParam = (isIntl: boolean, order: string) => {
    if (isIntl) {
        if (order === 'helpful' || order === 'recent') {
            return `type=${order}`;
        }
        return 'type=helpful';
    } else {
        if (order === 'new' || order === 'hot') {
            return `sort=${order}`;
        }
        return 'sort=hot';
    }
};

const fetchMainlandItems = async (params) => {
    const id = params.id;
    const order = params.order ?? 'hot';
    const lang = params.lang ?? 'zh_CN';

    let url = `${getRootUrl(false)}/webapiv2/review/v2/list-by-app?app_id=${id}&limit=10`;
    url += `&${makeSortParam(false, order)}`;
    url += `&${X_UA(lang)}`;

    const reviewListResponse = await ofetch(url);

    return reviewListResponse.data.list.map((review) => {
        const author = review.moment.author.user.name;
        const score = review.moment.review.score;
        return {
            title: `${author} - ${score}星`,
            author,
            description: review.moment.review.contents.text + (review.moment.review.contents.images ? review.moment.review.contents.images.map((img) => `<img src="${img.original_url}">`).join('') : ''),
            link: `${getRootUrl(false)}/review/${review.moment.review.id}`,
            pubDate: parseDate(review.moment.publish_time, 'X'),
        };
    });
};

const fetchIntlItems = async (params) => {
    const id = params.id;
    const order = params.order ?? 'helpful';
    const lang = params.lang ?? 'en_US';

    let url = `${getRootUrl(true)}/webapiv2/feeds/v3/by-app?app_id=${id}&limit=10`;
    url += `&${makeSortParam(true, order)}`;
    url += `&${X_UA(lang)}`;

    const reviewListResponse = await ofetch(url);

    return reviewListResponse.data.list.map((review) => {
        const author = review.post.user.name;
        const score = review.post.list_fields.app_ratings[id].score;
        return {
            title: `${author} - ${'★'.repeat(score)}`,
            author,
            description: review.post.list_fields.summary || review.post.list_fields.title,
            link: `${getRootUrl(true)}/post/${review.post.id_str}`,
            pubDate: parseDate(review.post.published_time, 'X'),
        };
    });
};

export async function handler(ctx) {
    const requestPath = ctx.req.path.replace('/taptap', '');
    const isIntl = requestPath.startsWith('/intl/');
    const id = ctx.req.param('id');
    const order = ctx.req.param('order') ?? 'default';
    const lang = ctx.req.param('lang') ?? (isIntl ? 'en_US' : 'zh_CN');

    const detail = await appDetail(id, lang, isIntl);
    const appImg = detail.app.icon.original_url;
    const appName = detail.app.title;

    const items = isIntl ? await fetchIntlItems({ id, order, lang }) : await fetchMainlandItems({ id, order, lang });

    return {
        title: `TapTap 评价 ${appName}`,
        link: `${getRootUrl(isIntl)}/app/${id}/review?${makeSortParam(isIntl, order)}`,
        image: appImg,
        item: items,
    };
}
