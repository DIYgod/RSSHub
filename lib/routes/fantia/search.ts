import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';

export const route: Route = {
    path: '/search/:type?/:caty?/:period?/:order?/:rating?/:keyword?',
    categories: ['picture', 'popular'],
    view: ViewType.Pictures,
    example: '/fantia/search/posts/all/daily',
    parameters: {
        type: {
            description: 'Type, see the table below, `posts` by default',
            options: [
                { value: 'fanclubs', label: 'クリエイター' },
                { value: 'posts', label: '投稿' },
                { value: 'products', label: '商品' },
                { value: 'commissions', label: 'コミッション' },
            ],
            default: 'posts',
        },
        caty: {
            description: 'Category, see the table below, can also be found in search page URL, `すべてのクリエイター` by default',
            options: [
                { value: 'all', label: 'すべてのクリエイター' },
                { value: 'illust', label: 'イラスト' },
                { value: 'comic', label: '漫画' },
                { value: 'cosplay', label: 'コスプレ' },
                { value: 'youtuber', label: 'YouTuber・配信者' },
                { value: 'vtuber', label: 'Vtuber' },
                { value: 'voice', label: '音声作品・ASMR' },
                { value: 'voiceactor', label: '声優・歌い手' },
                { value: 'idol', label: 'アイドル' },
                { value: 'anime', label: 'アニメ・映像・写真' },
                { value: '3d', label: '3D' },
                { value: 'game', label: 'ゲーム制作' },
                { value: 'music', label: '音楽' },
                { value: 'novel', label: '小説' },
                { value: 'doll', label: 'ドール' },
                { value: 'art', label: 'アート・デザイン' },
                { value: 'program', label: 'プログラム' },
                { value: 'handmade', label: '創作・ハンドメイド' },
                { value: 'history', label: '歴史・評論・情報' },
                { value: 'railroad', label: '鉄道・旅行・ミリタリー' },
                { value: 'shop', label: 'ショップ' },
                { value: 'other', label: 'その他' },
            ],
            default: 'all',
        },
        period: {
            description: 'Ranking period, see the table below, empty by default',
            options: [
                { value: 'daily', label: 'デイリー' },
                { value: 'weekly', label: 'ウィークリー' },
                { value: 'monthly', label: 'マンスリー' },
                { value: 'all', label: '全期間' },
            ],
            default: '',
        },
        order: {
            description: 'Sorting, see the table below, `更新の新しい順` by default',
            options: [
                { value: 'updater', label: '更新の新しい順' },
                { value: 'update_old', label: '更新の古い順' },
                { value: 'newer', label: '投稿の新しい順' },
                { value: 'create_old', label: '投稿の古い順' },
                { value: 'popular', label: 'お気に入り数順' },
            ],
            default: 'updater',
        },
        rating: {
            description: 'Rating, see the table below, `すべて` by default',
            options: [
                { value: 'all', label: 'すべて' },
                { value: 'general', label: '一般のみ' },
                { value: 'adult', label: 'R18 のみ' },
            ],
            default: 'all',
        },
        keyword: 'Keyword, empty by default',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Search',
    maintainers: ['nczitzk'],
    handler,
    description: `Type

  | クリエイター | 投稿  | 商品     | コミッション |
  | ------------ | ----- | -------- | ------------ |
  | fanclubs     | posts | products | commissions  |

  Category

  | 分类                   | 分类名     |
  | ---------------------- | ---------- |
  | イラスト               | illust     |
  | 漫画                   | comic      |
  | コスプレ               | cosplay    |
  | YouTuber・配信者       | youtuber   |
  | Vtuber                 | vtuber     |
  | 音声作品・ASMR         | voice      |
  | 声優・歌い手           | voiceactor |
  | アイドル               | idol       |
  | アニメ・映像・写真     | anime      |
  | 3D                     | 3d         |
  | ゲーム制作             | game       |
  | 音楽                   | music      |
  | 小説                   | novel      |
  | ドール                 | doll       |
  | アート・デザイン       | art        |
  | プログラム             | program    |
  | 創作・ハンドメイド     | handmade   |
  | 歴史・評論・情報       | history    |
  | 鉄道・旅行・ミリタリー | railroad   |
  | ショップ               | shop       |
  | その他                 | other      |

  Ranking period

  | デイリー | ウィークリー | マンスリー | 全期間 |
  | -------- | ------------ | ---------- | ------ |
  | daily    | weekly       | monthly    | all    |

  Sorting

  | 更新の新しい順 | 更新の古い順 | 投稿の新しい順 | 投稿の古い順 | お気に入り数順 |
  | -------------- | ------------ | -------------- | ------------ | -------------- |
  | updater        | update\_old  | newer          | create\_old  | popular        |

  Rating

  | すべて | 一般のみ | R18 のみ |
  | ------ | -------- | -------- |
  | all    | general  | adult    |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') || 'posts';
    const caty = ctx.req.param('caty') || '';
    const order = ctx.req.param('order') || 'updater';
    const rating = ctx.req.param('rating') || 'all';
    const keyword = ctx.req.param('keyword') || '';
    const period = ctx.req.param('period') || '';

    const rootUrl = 'https://fantia.jp';
    const apiUrl = `${rootUrl}/api/v1/search/${type}?keyword=${keyword}&peroid=${period}&brand_type=0&category=${caty === 'all' ? '' : caty}&order=${order}${
        rating === 'all' ? '' : rating === 'general' ? '&rating=general' : '&adult=1'
    }&per_page=30`;
    const response = await got({
        method: 'get',
        url: apiUrl,
        headers: {
            Cookie: config.fantia.cookies ?? '',
        },
    });

    let items = {};

    switch (type) {
        case 'fanclubs':
            items = response.data.fanclubs.map((item) => ({
                title: item.fanclub_name_with_creator_name,
                link: `${rootUrl}/fanclubs/${item.id}`,
                description: `${item.icon ? `<img src="${item.icon.main}">` : ''}"><p>${item.title}</p>`,
            }));
            break;

        case 'posts':
            items = response.data.posts.map((item) => ({
                title: item.title,
                link: `${rootUrl}/posts/${item.id}`,
                pubDate: parseDate(item.posted_at),
                author: item.fanclub.fanclub_name_with_creator_name,
                description: `${item.comment ? `<p>${item.comment}</p>` : ''}<img src="${item.thumb ? item.thumb.main : item.thumb_micro}">`,
            }));
            break;

        case 'products':
            items = response.data.products.map((item) => ({
                title: item.name,
                link: `${rootUrl}/products/${item.id}`,
                author: item.fanclub.fanclub_name_with_creator_name,
                description: `${item.buyable_lowest_plan.description ? `<p>${item.buyable_lowest_plan.description}</p>` : ''}<img src="${item.thumb ? item.thumb.main : item.thumb_micro}">`,
            }));
            break;

        case 'commissions':
            items = response.data.commissions.map((item) => ({
                title: item.name,
                link: `${rootUrl}/commissions/${item.id}`,
                author: item.fanclub.fanclub_name_with_creator_name,
                description: `${item.buyable_lowest_plan.description ? `<p>${item.buyable_lowest_plan.description}</p>` : ''}<img src="${item.thumb ? item.thumb.main : item.thumb_micro}">`,
            }));
            break;
    }

    return {
        title: `Fantia - Search ${type}`,
        link: apiUrl.replace('api/v1/search/', ''),
        item: items,
    };
}
