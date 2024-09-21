import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { art } from '@/utils/render';
import path from 'node:path';

const urlRoot = 'https://tongqu.sjtu.edu.cn';

export const route: Route = {
    path: '/tongqu/:type?',
    categories: ['university'],
    example: '/sjtu/tongqu/lecture',
    parameters: { type: '类型，默认为全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '同去网最新活动',
    maintainers: ['SeanChao'],
    handler,
    description: `| 全部 | 最新   | 招新        | 讲座    | 户外      | 招聘 | 游学       | 比赛         | 公益           | 主题党日 | 学生事务       | 广告 | 其他   |
  | ---- | ------ | ----------- | ------- | --------- | ---- | ---------- | ------------ | -------------- | -------- | -------------- | ---- | ------ |
  | all  | newest | recruitment | lecture | outdoords | jobs | studyTours | competitions | publicWarefare | partyDay | studentAffairs | ads  | others |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') || 'all';
    const config = {
        all: 0,
        newest: -1,
        recruitment: 9,
        lecture: 2,
        outdoors: 10,
        jobs: 4,
        studyTours: 5,
        competitions: 7,
        publicWarefare: 11,
        partyDay: 13,
        studentAffairs: 14,
        ads: 12,
        others: 8,
    };

    // requests API
    const link = `${urlRoot}/api/act/type?type=${config[type]}&status=0&offset=0&offset=0&number=10&order=act.create_time&desc=true`;
    const response = await got(link);
    const data = response.data;

    // parses data
    const activities = data.result.acts;
    const feeds = activities.map((e) => ({
        title: e.name,
        link: new URL(`/act/${e.actid}`, urlRoot).href,
        category: e.typename,
        description: art(path.join(__dirname, '../templates/activity.art'), { e }),
    }));

    return {
        title: '同去网活动',
        link,
        item: feeds,
    };
}
