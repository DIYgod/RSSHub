import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { getCategoryBrief, parseList, ProcessFeed } from './utils';

export const route: Route = {
    path: '/trending/:category/:type',
    categories: ['programming'],
    example: '/juejin/trending/ios/monthly',
    parameters: {
        category: {
            description: '分类名',
            options: [
                {
                    value: 'android',
                    label: 'Android',
                },
                {
                    value: 'frontend',
                    label: '前端',
                },
                {
                    value: 'ios',
                    label: 'iOS',
                },
                {
                    value: 'backend',
                    label: '后端',
                },
                {
                    value: 'design',
                    label: '设计',
                },
                {
                    value: 'product',
                    label: '产品',
                },
                {
                    value: 'freebie',
                    label: '工具资源',
                },
                {
                    value: 'article',
                    label: '阅读',
                },
                {
                    value: 'ai',
                    label: '人工智能',
                },
                {
                    value: 'devops',
                    label: '运维',
                },
                {
                    value: 'all',
                    label: '全部',
                },
            ],
            default: 'all',
        },
        type: {
            description: '类型',
            options: [
                {
                    value: 'weekly',
                    label: '本周最热',
                },
                {
                    value: 'monthly',
                    label: '本月最热',
                },
                {
                    value: 'historical',
                    label: '历史最热',
                },
            ],
            default: 'weekly',
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '热门',
    maintainers: ['moaix'],
    handler,
};

async function handler(ctx) {
    const { category, type } = ctx.req.param();

    let id = '';
    let name = '';
    let url = 'recommended';
    const idResponse = await getCategoryBrief();
    const cat = idResponse.find((item) => item.category_url === category);
    if (cat) {
        id = cat.category_id;
        name = cat.category_name;
        url = cat.category_url;
    }

    const params = {
        monthly: {
            period: 'month',
            title: '本月',
            link: 'monthly_hottest',
            sort_type: 30,
        },
        weekly: {
            period: 'week',
            title: '本周',
            link: 'weekly_hottest',
            url: 'get_entry_by_period',
            sort_type: 7,
        },
        historical: {
            period: '',
            title: '历史',
            link: 'hottest',
            sort_type: 0,
        },
    };

    const p = params[type];

    const title = `掘金${name}${p.title}最热`;
    const link = `https://juejin.im/${url}?sort=${p.link}`;

    let getUrl = 'https://api.juejin.cn/recommend_api/v1/article/recommend_all_feed';
    const getJson = {
        cursor: '0',
        id_type: 2,
        limit: 20,
        sort_type: p.sort_type,
    };

    if (url !== 'recommended') {
        getUrl = 'https://api.juejin.cn/recommend_api/v1/article/recommend_cate_feed';
        getJson.cate_id = id;
    }

    const trendingResponse = await ofetch(getUrl, {
        method: 'POST',
        body: getJson,
    });
    let entrylist = trendingResponse.data;

    if (category === 'all' || category === 'devops' || category === 'product' || category === 'design') {
        entrylist = trendingResponse.data.filter((item) => item.item_type === 2).map((item) => item.item_info);
    }
    const list = parseList(entrylist);

    const resultItems = await ProcessFeed(list);

    return {
        title,
        link,
        item: resultItems,
    };
}
