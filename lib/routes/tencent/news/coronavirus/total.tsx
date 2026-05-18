import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';

import { getData } from './utils';

export const route: Route = {
    path: '/news/coronavirus/total',
    radar: [
        {
            source: ['new.qq.com/zt2020/page/feiyan.htm'],
        },
    ],
    name: 'Unknown',
    maintainers: ['CaoMeiYouRen'],
    handler,
    url: 'new.qq.com/zt2020/page/feiyan.htm',
};

async function handler() {
    const title = '腾讯新闻 - 新型冠状病毒肺炎疫情实时追踪';
    const link = 'https://news.qq.com/zt2020/page/feiyan.htm#/';
    const item = [];

    const chinaTotal = (await getData(['diseaseh5Shelf']))?.data?.diseaseh5Shelf?.chinaTotal || {};
    const { localConfirmH5, localWzzAdd, confirmAdd, localConfirm, nowLocalWzz, highRiskAreaNum, mtime } = chinaTotal;
    const pubDate = parseDate(mtime);
    const info = {
        title: '中国本土数据统计',
        description: renderToString(
            <>
                <p>本土确诊：</p>
                <p>{`+${localConfirmH5}`}</p>
                <br />
                <p>本土无症状：</p>
                <p>{`+${localWzzAdd}`}</p>
                <br />
                <p>确诊病例：</p>
                <p>{`+${confirmAdd}`}</p>
                <br />
                <p>现有本土确诊：</p>
                <p>{localConfirm}</p>
                <br />
                <p>现有本土无症状：</p>
                <p>{nowLocalWzz}</p>
                <br />
                <p>高风险地区：</p>
                <p>{highRiskAreaNum}</p>
                <br />
            </>
        ),
        pubDate,
        guid: `${link}total?pubDate=${pubDate.toISOString()}`,
    };
    item.push(info);

    return {
        title,
        link,
        item,
    };
}
