import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import { getData } from './utils';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

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
        description: art(path.join(__dirname, '../../templates/coronavirus/chinaTotal.art'), {
            localConfirmH5,
            localWzzAdd,
            confirmAdd,
            localConfirm,
            nowLocalWzz,
            highRiskAreaNum,
        }),
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
