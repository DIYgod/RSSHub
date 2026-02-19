import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    url: 'denonbu.jp',
    path: '/news/:area?',
    categories: ['anime'],
    example: '/denonbu/news/azabu',
    parameters: {
        area: 'The id of the area or category; values are as follows.',
    },
    description: `**Area**
| ID            | Group name/Area name                             |
| ------------- | ------------------------------------------------ |
| akiba         | 外神田文芸高校                                   |
| harajuku      | 神宮前参道學園                                   |
| azabu         | 港白金女学院                                     |
| shibuya       | 帝音国際学院                                     |
| kabuki        | 真新宿GR学園                                     |
| deep-okubo    | Bellemule（深大久保DJ＆ダンスアカデミー）        |
| deep-okubo-k  | 輝きノスタルジア（深大久保DJ＆ダンスアカデミー） |
| shinsaibashi  | OKINI☆PARTY'S（心斎橋演芸高校）                  |
| ikebukuro     | 池袋電音部（池袋空乗院高校）                     |
| neotokyo      | 東京電脳（東京電脳学園）                         |
| neonakano     | 中野電脳（中野電脳学園）                         |
| shimokitazawa | Ma'Scar'Piece（北沢音箱高校）                    |

**Category**
Working category IDs include \`news\` (the default), \`event\`, \`goods\`, \`comic\`, \`movie\`, \`music\` or \`livearchives\`.

`,
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
            source: ['denonbu.jp/news'],
            target: '/news',
        },
        {
            source: ['denonbu.jp/event'],
            target: '/news/event',
        },
        {
            source: ['denonbu.jp/goods'],
            target: '/news/goods',
        },
        {
            source: ['denonbu.jp/comic'],
            target: '/news/comic',
        },
        {
            source: ['denonbu.jp/movie'],
            target: '/news/movie',
        },
        {
            source: ['denonbu.jp/music'],
            target: '/news/music',
        },
        {
            source: ['denonbu.jp/livearchives'],
            target: '/news/livearchives',
        },

        {
            source: ['denonbu.jp/area/:area'],
            target: '/news/:area',
        },
    ],
    name: '新闻',
    maintainers: ['outloudvi'],
    handler,
};

const AREA_NAMES = {
    akiba: '外神田文芸高校',
    harajuku: '神宮前参道學園',
    azabu: '港白金女学院',
    shibuya: '帝音国際学院',
    kabuki: '真新宿GR学園',
    'deep-okubo': 'Bellemule（深大久保DJ＆ダンスアカデミー）',
    'deep-okubo-k': '輝きノスタルジア（深大久保DJ＆ダンスアカデミー）',
    shinsaibashi: "OKINI☆PARTY'S（心斎橋演芸高校）",
    ikebukuro: '池袋電音部（池袋空乗院高校）',
    neotokyo: '東京電脳（東京電脳学園）',
    neonakano: '中野電脳（中野電脳学園）',
    shimokitazawa: "Ma'Scar'Piece（北沢音箱高校）",

    news: '新闻',
    event: '活动',
    goods: '商品',
    comic: '漫画',
    movie: '影片',
    music: '音乐',
    livearchives: 'Live留档',
};

const BASE_URL = 'https://denonbu.jp/backend-api/v1.0.0/';
const COMMON_HEADERS = {
    'X-API-KEY': 'FVpHcMLqyf7v2EubqiLxznC9gVMqBDFFMt4zvkS2',
};
const PRIMARY_CATEGORIES = new Set(['news', 'event', 'goods', 'comic', 'movie', 'music', 'livearchives']);
const CACHE_TOKEN_KEY = 'denonbu-news';

async function getToken(): Promise<string> {
    const cacheToken = await cache.get(CACHE_TOKEN_KEY, false);
    if (cacheToken) {
        return cacheToken;
    }

    const payload = await ofetch(String(new URL('auths/token/get', BASE_URL)), {
        headers: COMMON_HEADERS,
    }).then((x) => x.payload);
    const { token, expires } = payload;
    if (!token) {
        throw new Error('Failed to get token');
    }
    cache.set(CACHE_TOKEN_KEY, token, expires ? expires - Number(Date.now()) / 1000 - 1 : 3600);
    return token;
}

function buildLink(body: any): string | null {
    switch (body.source_type) {
        case 'main':
        case 'deep-okubo':
        case 'shinsaibashi':
        case 'neotokyo': {
            const { sid, uid } = body;
            if (sid && uid) {
                return `https://denonbu.jp/detail/${sid}/${uid}`;
            }
            return null;
        }
        case 'tw': {
            const {
                account: { account_id },
                uid,
            } = body;
            if (account_id && uid) {
                return `https://twitter.com/${account_id}/status/${uid}`;
            }
            return null;
        }
        default:
            return null;
    }
}

async function handler(ctx: Context): Promise<Data> {
    const { area: _area } = ctx.req.param();
    const area = _area ?? 'news';
    const token = await getToken();
    const data = await ofetch(String(new URL(`contents/search/${area}?limit=20&offset=0`, BASE_URL)), {
        headers: {
            ...COMMON_HEADERS,
            Authorization: `Bearer ${token}`,
        },
    }).then((x) => x.payload.items);

    const items = data.map((item) => {
        const { title, body, post_date, category, media } = item;
        const link = buildLink(item);
        const result: DataItem = {
            title: title ?? body.split('\n')[0],
            description: body,
            pubDate: timezone(parseDate(post_date), +9),
            category: category.map((x) => x.name),
        };

        if (media?.[0]) {
            const firstMedia = media[0];
            const imageUrl = typeof firstMedia === 'string' ? firstMedia : firstMedia?.url;
            if (typeof imageUrl === 'string') {
                result.image = imageUrl;
            }
        }
        if (link) {
            result.link = link;
        }

        return result;
    });

    return {
        title: `電音部新闻 - ${AREA_NAMES[area] ?? area}`,
        link: PRIMARY_CATEGORIES.has(area) ? `https://denonbu.jp/${area}` : `https://denonbu.jp/area/${area}`,
        item: items,
        language: 'ja',
    };
}
