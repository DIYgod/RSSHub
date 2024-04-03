import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:city/:pollution?',
    categories: ['other'],
    example: '/aqicn/beijing/pm25',
    parameters: {
        city: '城市拼音或地区 ID，详见[aqicn.org](http://aqicn.org/city/)',
        pollution: '可选择显示更详细的空气污染成分',
    },
    radar: [
        {
            source: ['aqicn.org'],
        },
    ],
    name: '实时 AQI',
    maintainers: ['ladeng07'],
    handler,
    url: 'aqicn.org',
    descriptions: `
|   参数   | 污染成分 |
| -------- | -------- |
|   pm25   |  PM2.5   |
|   pm10   |  PM10    |
|   o3     |  O3      |
|   no2    |  NO2     |
|   so2    |  SO2     |
|   co     |  CO      |

举例: [https://rsshub.app/aqicn/beijing/pm25,pm10](https://rsshub.app/aqicn/beijing/pm25,pm10)

1. 显示单个污染成分，例如「pm25」, [https://rsshub.app/aqicn/beijing/pm25](https://rsshub.app/aqicn/beijing/pm25)
2. 逗号分隔显示多个污染成分，例如「pm25,pm10」，[https://rsshub.app/aqicn/beijing/pm25,pm10](https://rsshub.app/aqicn/beijing/pm25,pm10)
3. 城市子站 ID 获取方法：右键显示网页源代码，搜索 "idx" （带双冒号），后面的 ID 就是子站的 ID，如你给的链接 ID 是 4258，RSS 地址就是 [https://rsshub.app/aqicn/4258](https://rsshub.app/aqicn/4258)
`,
};

async function handler(ctx) {
    const city = ctx.req.param('city');
    const pollution = ctx.req.param('pollution') || [];
    const pollutionType = {
        so2: 'so2',
        no2: 'no2',
        co: 'co',
        o3: 'O3',
        pm25: 'PM2.5',
        pm10: 'PM10',
    };
    const area = Number.isNaN(Number(city)) ? city : `@${city}`;

    const response = await got({
        method: 'get',
        url: `http://aqicn.org/aqicn/json/android/${area}/json`,
    });
    const data = response.data;
    const pollutionDetailed =
        pollution.length === 0
            ? ''
            : pollution
                  .split(',')
                  .map((item) => {
                      const pollutionValue = typeof data.historic[pollutionType[item]] === 'object' ? data.historic[pollutionType[item]][Object.keys(data.historic[pollutionType[item]])[0]] : data.historic[pollutionType[item]][0];
                      return `${pollutionType[item].toUpperCase()}:<b>${pollutionValue}</b><br>`;
                  })
                  .join('');

    return {
        title: `${data.namena}AQI`,
        link: `https://aqicn.org/city/${data.ids.path}`,
        description: `${data.namena}AQI-aqicn.org`,
        item: [
            {
                title: `${data.namena}实时空气质量(AQI)${data.utimecn}`,
                description: `${data.infocn}<br>风力:<b>${data.cwind[0]}</b>级<br>AQI:<b>${data.aqi}</b><br>${pollutionDetailed}<img src="${data.wgt}">`,
                pubDate: parseDate(data.time * 1000),
                guid: `${data.time}-${city}-${pollution}`,
                link: `https://aqicn.org/city/${data.ids.path}`,
            },
        ],
    };
}
