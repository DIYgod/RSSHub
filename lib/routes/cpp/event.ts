import type { Context } from 'hono';
import { Route } from '@/types';
import got from '@/utils/got';
import InvalidParameterError from '@/errors/types/invalid-parameter';

const siteUrl = 'https://cp.allcpp.cn/event/search';
const apiUrl = 'https://www.allcpp.cn/allcpp/event/eventMainListV2.do';
const cityListApiUrl = 'https://www.allcpp.cn/api/event/cityList.do';

export const route: Route = {
    path: '/event/:city?',
    name: '近期会展',
    url: 'cp.allcpp.cn/event/search',
    maintainers: ['matcosteam'],
    handler,
    example: '/cpp/event/310100',
    parameters: {
        city: {
            description: `地区行政区划代码，留空订阅全部地区。例如上海为 \`310100\`。代码可在 [活动页面](https://cp.allcpp.cn/event/search) 选择地区后从 URL 的 \`city\` 参数取得。`,
        },
    },
    categories: ['anime'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
};

async function handler(ctx: Context) {
    const city = ctx.req.param('city');
    let cityName: string | undefined;
    let provinceName: string | undefined;

    if (city) {
        const { data: cityData } = await got(cityListApiUrl);
        const cityCode = Number(city);
        const province = cityData.result.find((item) => item.code === cityCode || item.cityList.some((item) => item.code === cityCode));

        if (!province) {
            throw new InvalidParameterError('Invalid city code');
        }

        provinceName = province.name;
        cityName = province.cityList.find((item) => item.code === cityCode)?.name;
    }

    const { data } = await got(apiUrl, {
        searchParams: {
            time: 0,
            sort: 2,
            day: 30,
            pageNo: 1,
            pageSize: 30,
            ...(city ? { city, isOnline: 0 } : {}),
        },
    });

    const list = city ? data.result.list.filter((item) => item.provName === provinceName && (cityName === '全部' || item.cityName === cityName)) : data.result.list;
    const link = city ? `${siteUrl}?city=${city}&isOnline=0&day=30&pageCurrent=1&sort=2` : `${siteUrl}?day=30&pageCurrent=1&sort=2`;

    return {
        title: `CPP 无差别同人站 - 近期会展${city ? ` - ${provinceName}${cityName === '全部' ? '' : ` - ${cityName}`}` : ''}`,
        link,
        item: list.map((item) => {
            const location = [item.provName, item.cityName, item.areaName, item.enterAddress].filter(Boolean).join(' - ');
            const startTime = new Date(item.enterTime);
            const endTime = new Date(item.endTime);
            const eventTime =
                item.enterTime === item.endTime
                    ? startTime.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })
                    : `${startTime.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })} 至 ${endTime.toLocaleString('zh-CN', {
                          timeZone: 'Asia/Shanghai',
                          hour12: false,
                      })}`;

            return {
                title: item.name,
                link: `https://www.allcpp.cn/allcpp/event/event.do?event=${item.id}`,
                pubDate: startTime,
                category: [item.type, ...item.tag.split('|')].filter(Boolean),
                description: [`<p>活动类型：${item.type}</p>`, `<p>活动时间：${eventTime}</p>`, location && `<p>活动地点：${location}</p>`, item.tag && `<p>标签：${item.tag}</p>`].filter(Boolean).join(''),
            };
        }),
    };
}
