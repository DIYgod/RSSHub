import { type Route, ViewType } from '@/types';
import { handler as cfhHandler } from './cfh';
import { handler as gubaHandler } from './guba';
import { handler as trplHandler } from './trpl';

export const route: Route = {
    path: '/gerenzhongxin/gather/:uid',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/eastmoney/gerenzhongxin/gather/2922094262312522',
    parameters: { uid: '用户id,即用户主页网址末尾的数字' },
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
            source: ['guba.eastmoney.com'],
        },
        {
            source: ['caifuhao.eastmoney.com'],
        },
        {
            source: ['i.eastmoney.com/:uid'],
            target: '/gerenzhongxin/gather/:uid',
        },
    ],
    name: '个人中心所有活动',
    maintainers: ['AwesomeDog'],
    handler,
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');

    const subCtx = {
        req: {
            param: (key: string) => (key === 'uid' ? uid : ''),
        },
    };
    const [cfhResult, gubaResult, trplResult] = await Promise.allSettled([cfhHandler(subCtx), gubaHandler(subCtx), trplHandler(subCtx)]);

    const allItems: any[] = [];

    if (cfhResult.status === 'fulfilled') {
        allItems.push(...cfhResult.value.item);
    }
    if (gubaResult.status === 'fulfilled') {
        allItems.push(...gubaResult.value.item);
    }
    if (trplResult.status === 'fulfilled') {
        allItems.push(...trplResult.value.item);
    }

    allItems.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

    const nickname = allItems[0]?.author || '用户';

    return {
        title: `${nickname} 的东财所有活动`,
        link: `https://i.eastmoney.com/${uid}`,
        image: `https://avator.eastmoney.com/qface/${uid}/360`,
        item: allItems,
    };
}
