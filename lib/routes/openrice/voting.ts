import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
const baseUrl = 'https://www.openrice.com';

export const route: Route = {
    path: '/:lang/hongkong/voting/top/:categoryKey',
    maintainers: ['after9'],
    handler,
    categories: ['shopping'],
    example: '/openrice/zh/hongkong/voting/top/chinese',
    parameters: { lang: '语言，缺省为 zh', categoryKey: '类别，缺省为 chinese' },
    name: 'OpenRice 開飯熱店 - 年度餐廳投票',
    description: `
  lang: 语言，见下方列表
  | 简体 | 繁體 | EN |
  | ----- | ------ | ----- |
  | zh-cn | zh | en |

  categoryKey: 部分类别，见下方列表 (更多的类别可以在页面的link中对照获取)
  | 中菜館 | 上海菜 | 粵菜 | 川菜 | 港式 | 粥粉麵店 | 廚師發辦 | 韓國菜 | 泰國菜 | 越南菜 |
  | -------- | -------- | -------- |  -------- | -------- | -------- | -------- | -------- | -------- | -------- |
  | chinese | shanghainese | guangdong | sichuan | hkstyle | congee_noodles | omakase | korean | thai | vietnamese |
  `,
};

async function handler(ctx) {
    const lang = ctx.req.param('lang') ?? 'zh';
    const categoryKey = ctx.req.param('categoryKey') ?? 'chinese';

    const apiPath = '/api/v2/voting/search/poi';
    const urlPath = `/${lang}/hongkong/voting/top`;
    let title: string, description: string;
    switch (lang) {
        case 'zh-cn':
            title = 'OpenRice 开饭热店';
            description = 'OpenRice用戶可以在網站或手機應用程式，點擊餐廳頁面中「投票」按鈕，即可完成投票。參加投票的用戶有機會參加大抽獎，贏取豐富獎品。';
            break;
        case 'en':
            title = 'OpenRice Best Restaurant';
            description =
                'OpenRice users can vote by clicking the &quot;Vote&quot; button on the restaurant page on the website or mobile app. Voters will have the opportunity to participate in the grand lottery and win grand prizes.';
            break;
        case 'zh':
        default:
            title = 'OpenRice 開飯熱店';
            description = 'OpenRice用戶可以在網站或手機應用程式，點擊餐廳頁面中「投票」按鈕，即可完成投票。參加投票的用戶有機會參加大抽獎，贏取豐富獎品。';
    }
    const response = await ofetch(baseUrl + apiPath, {
        headers: {
            accept: 'application/json',
        },
        query: {
            uiLang: lang,
            uiCity: 'hongkong',
            categoryKey,
            shortlistIndexLt: 20,
            startAt: 0,
            regionId: 0,
            rows: 20,
            needTag: true,
            _isPrivate: true,
        },
    });

    const data = response.paginationResult.results;

    const resultList = data.map((item) => {
        const title = item.name ?? '';
        const link = `${baseUrl}/${lang}/hongkong/r-${item.name}-r${item.poiId}`;
        const description = `${item.district.name}-${item.categories.map((category) => category.name).join('-')}`;
        return {
            title,
            description,
            link,
        };
    });

    return {
        title,
        link: baseUrl + urlPath,
        description,
        item: resultList,
    };
}
