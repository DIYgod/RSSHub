import got from '@/utils/got';

export default async (ctx) => {
    const baseUrl = 'https://zhujia.zhuwang.cc/';
    const now = new Date();
    const date = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    const response = await got(`${baseUrl}/api/chartData`, {
        searchParams: {
            areaId: -1,
        },
    });

    const names = {
        pigprice: '生猪(外三元)',
        pig_in: '生猪(内三元)',
        pig_local: '生猪(土杂猪)',
    };

    const priceItems = Object.entries(names).map(([key, name], i) => {
        const items = response.data[key];
        const today = items.at(-1);
        const yesterday = items.at(-2);
        const change = (today - yesterday).toFixed(2);
        let description = `较昨日价格, 每公斤上涨${change}元`;
        if (yesterday > today) {
            description = `较昨日价格, 下跌${-change}元`;
        }
        if (yesterday === today) {
            description = '较昨日价格持平';
        }

        return {
            title: `${date} ${name} ${today}元/公斤. ${description}`,
            description,
            link: `https://xt.yangzhu.vip/manage/datamap/ptype/${i + 1}/areano/-1.html`,
            guid: `${date} ${name}`,
        };
    });

    ctx.set('data', {
        title: `全国今日生猪价格`,
        desription: '中国养猪网猪价频道是中国猪价权威平台,提供每日猪评,猪价和行情分析,并且预测猪价和分析每天的猪价排行。',
        link: baseUrl,
        item: priceItems,
    });
};
