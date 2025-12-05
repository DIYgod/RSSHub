import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/golden',
    categories: ['program-update'],
    example: '/mi/golden',
    name: '小米应用商店金米奖',
    maintainers: ['nczitzk'],
    handler,
};

async function handler() {
    const link = 'https://app.market.xiaomi.com/apm/subject/169449?os=1.1.1&sdk=19';
    const response = await got({
        method: 'get',
        url: link,
    });

    const list = response.data.listApp.map((item) => ({
        title: `第${item.subjectGroup.split('期')[0].replace('第', '')}期 ${item.displayName} [${item.level1CategoryName} - ${item.level2CategoryName}]`,
        link: `http://app.mi.com/details?id=${item.packageName}`,
        description: item.briefShow,
    }));

    return {
        title: `金米奖 - 小米应用商店`,
        link,
        item: list,
        description: response.data.description,
    };
}
