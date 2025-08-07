import { Route, ViewType } from '@/types';
import { parseRelativeDate } from '@/utils/parse-date';
import got from '@/utils/got';

export const route: Route = {
    path: '/report/:industry?',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/moodysmismicrosite/report/企业&金融机构',
    parameters: {
        industry: {
            description: '可选参数，默认为全部行业。行业选择，支持使用&连接多个。',
            options: [
                { value: '0', label: '企业' },
                { value: '1', label: '金融机构' },
                { value: '2', label: '主权' },
                { value: '3', label: '地方政府及城投公司' },
                { value: '4', label: '宏观经济' },
                { value: '5', label: '结构融资' },
                { value: '6', label: '基础设施及项目融资' },
                { value: '7', label: 'ESG' },
                { value: '8', label: '其他' },
            ],
            default: '全部',
        },
    },
    radar: [
        {
            source: ['www.moodysmismicrosite.com/report'],
        },
    ],
    name: 'industry',
    description: `
| ID | Description |
| ---   | ---   |
| 0 | 企业 |
| 1 | 金融机构 |
| 2 | 主权 |
| 3 | 地方政府及城投公司 |
| 4 | 宏观经济 |
| 5 | 结构融资 |
| 6 | 基础设施项目融资 |
| 7 | ESG |
| 8 | 其他 |
    `,
    maintainers: ['Cedaric'],
    handler,
};

async function handler(ctx) {
    const industryMap: Record<number, string> = {
        0: '企业',
        1: '金融机构',
        2: '主权',
        3: '地方政府及城投公司',
        4: '宏观经济',
        5: '结构融资',
        6: '基础设施项目融资',
        7: 'ESG',
        8: '其他',
    };

    const reversedIndustry = Object.fromEntries(Object.entries(industryMap).map(([k, v]) => [v, k]));

    const industry = ctx.req.param('industry') || '行业';

    const industryId = industry
        .split('&')
        .map((name) => reversedIndustry[name.trim()])
        .filter((key) => key !== undefined)
        .join(',');

    const responseData = await got(`https://www.moodysmismicrosite.com/micro/v2/report/list?page_num=1&page_size=25&keyword=&industry_ids=${industryId}`);

    const items = responseData?.data?.data?.list || [];

    return {
        title: `穆迪评级(${industry})`,
        link: 'https://www.moodysmismicrosite.com/report',
        allowEmpty: true,
        item: items.map((x) => ({
            title: x.title,
            pubDate: parseRelativeDate(x.release_time),
            link: `https://www.moodysmismicrosite.com/details/${x.id}`,
            description: x.content_profile,
            category: x.classification,
            guid: x.id,
        })),
    };
}
