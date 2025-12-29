import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';

import { getData } from './utils';

export const route: Route = {
    path: '/news/coronavirus/data/:province?/:city?',
    name: 'Unknown',
    maintainers: ['CaoMeiYouRen'],
    handler,
};

async function handler(ctx) {
    const province = ctx.req.param('province') || '';
    const city = ctx.req.param('city') || '';

    const link = 'https://news.qq.com/zt2020/page/feiyan.htm#/';
    const item = [];

    const diseaseh5Shelf = (await getData(['diseaseh5Shelf']))?.data?.diseaseh5Shelf || {};
    const { lastUpdateTime, areaTree } = diseaseh5Shelf;
    const nationalData = areaTree?.[0];
    const provinceList = nationalData?.children;

    let todayConfirm = 0;
    let totalNowConfirm = 0;
    let totalConfirm = 0;
    let totalDead = 0;
    let coronavirusData = {};
    let placeName = '';

    if (!province || province === '中国' || province === '全国') {
        // 没有传参则取全国
        coronavirusData = nationalData;
        placeName = '中国';
    } else {
        // 分省份获取
        coronavirusData = provinceList?.find((e) => e.name === province);
        placeName = province;
        if (city) {
            // 继续获取 区县 数据
            coronavirusData = coronavirusData?.children?.find((e) => e.name === city);
            if (coronavirusData) {
                placeName = `${province}-${city}`;
            }
        }
    }
    if (!coronavirusData) {
        throw new InvalidParameterError(`未找到 ${placeName} 的疫情数据，请检查输入的省市名称是否正确`);
    }
    todayConfirm = coronavirusData.today?.confirm;
    totalNowConfirm = coronavirusData.total?.nowConfirm;
    totalConfirm = coronavirusData.total?.confirm;
    totalDead = coronavirusData.total?.dead;
    const pubDate = parseDate(coronavirusData.total?.mtime || lastUpdateTime);

    const title = `${placeName} - 腾讯新闻 - 新型冠状病毒肺炎疫情实时追踪`;

    const info = {
        title: `${placeName} - 疫情数据`,
        description: renderToString(
            <>
                <p>新增确诊：</p>
                <p>{`+${todayConfirm}`}</p>
                <br />
                <p>现有确诊：</p>
                <p>{totalNowConfirm}</p>
                <br />
                <p>累计确诊：</p>
                <p>{totalConfirm}</p>
                <br />
                <p>累计死亡：</p>
                <p>{totalDead}</p>
                <br />
            </>
        ),
        pubDate,
        guid: `${link}${placeName}?pubDate=${pubDate.toISOString()}`,
    };

    item.push(info);

    return {
        title,
        link,
        item,
    };
}
