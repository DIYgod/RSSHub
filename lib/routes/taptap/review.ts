import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRootUrl, appDetail, X_UA } from './utils';

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

async function handler(ctx) {
    const is_intl = ctx.req.url.indexOf('/intl/') === 0;
    const id = ctx.req.param('id');
    const order = ctx.req.param('order') ?? 'default';
    const lang = ctx.req.param('lang') ?? (is_intl ? 'en_US' : 'zh_CN');

    const app_detail = await appDetail(id, lang, is_intl);
    const app_img = app_detail.app.icon.original_url;
    const app_name = app_detail.app.title;

    const items = is_intl ? await fetchIntlItems(ctx.params) : await fetchMainlandItems(ctx.params);

    const ret = {
        title: `TapTap 评价 ${app_name} - ${(is_intl ? intlSortMap : sortMap)[order][lang]}排序`,
        link: `${getRootUrl(is_intl)}/app/${id}/review?${makeSortParam(is_intl, order)}`,
        image: app_img,
        item: items,
    };

    ctx.set('json', ret);
    return ret;
}

export const route: Route = {
    path: ['/review/:id/:order?/:lang?', '/intl/review/:id/:order?/:lang?'],
    categories: ['game'],
    example: '/taptap/review/142793/hot',
    parameters: { id: '游戏 ID，游戏主页 URL 中获取', order: '排序方式，空为默认排序，可选如下', lang: '语言，`zh-CN`或`zh-TW`，默认为`zh-CN`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['taptap.com/app/:id/review', 'taptap.com/app/:id'],
            target: '/review/:id',
        },
    ],
    name: '游戏评价',
    maintainers: ['hoilc', 'TonyRL'],
    handler,
    description: `#### 排序方式

  | 最相关  | 最新 |
  | ------- | ---- |
  | default | new  |

  #### 语言代码

  | English (US) | 繁體中文 | 한국어 | 日本語 |
  | ------------ | -------- | ------ | ------ |
  | en\_US       | zh\_TW   | ko\_KR | ja\_JP |`,
    description: `| 最新   | 最热 | 游戏时长 | 默认排序 |
  | ------ | ---- | -------- | -------- |
  | update | hot  | spent    | default  |`,
};
