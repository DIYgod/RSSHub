import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/artistBrandlist/:grp_no/:grp_no2?',
    categories: ['shopping'],
    example: 'ktown4u/artistBrandlist/234590/1723449',
    parameters: { grp_no: 'artist id (Get in url)', grp_no2: 'product category id (Get in url), empty for all categories' },
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
            source: [],
            target: '/artistBrandlist/:grp_no/:grp_no2',
        },
    ],
    name: 'Get the products on sale',
    maintainers: ['JamesWDGu'],
    handler: async (ctx) => {
        const { grp_no, grp_no2 = '' } = ctx.req.param();
        const data = await ofetch(`https://cn.ktown4u.com/selectArtistBrandList?cateGrpNo=${grp_no2}&currentPage=1&goodsSearch=newgoods&grpNo=${grp_no}&searchType=ARTIST`, {
            method: 'POST',
            headers: {
                accept: 'application/json, text/plain, */*',
                'accept-language': 'en,zh-CN;q=0.9,zh;q=0.8',
            },
            parseResponse: JSON.parse,
        });
        const items = data.map((item) => ({
            title: item.GOODS_NM,
            url: item.IMG_PATH,
            link: `https://cn.ktown4u.com/iteminfo?goods_no=${item.GOODS_NO}`,
            description: desc(item),
            pubDate: parseDate(item.RELEASE_DT),
        }));

        return {
            title: `${String(rssTitle(data))}`,
            link: `https://cn.ktown4u.com/artistBrandlist?grp_no=${grp_no}&grp_no2=${grp_no2}`,
            item: items,
        };
    },
};

const rssTitle = (data) => `ktown4u ${data[0].GRP_NM}`;

const desc = (item) => {
    const saleState = item.SALE_YN === 'N' ? '【售罄】' : '';
    let price = `${item.CURR_F_CD}${item.DISP_PRICE}`;
    if (item.DISP_PRICE !== item.DISP_DC_PRICE) {
        price = `${item.CURR_F_CD}${item.DISP_DC_PRICE} / 原价：${price}`;
    }
    return `${saleState} ${price} <br> <img src=${item.IMG_PATH}> <br> ${item.GOODS_NM}`;
};
