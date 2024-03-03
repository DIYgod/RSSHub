// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import * as path from 'node:path';
import { art } from '@/utils/render';

const dayjs = require('dayjs');
dayjs.extend(require('dayjs/plugin/localizedFormat'));
dayjs.extend(require('dayjs/plugin/duration'));
dayjs.extend(require('dayjs/plugin/relativeTime'));
require('dayjs/locale/zh-cn');
dayjs.locale('zh-cn');

const sec2str = (sec) => dayjs.duration(Number.parseInt(sec), 'seconds').humanize();

const contestAPI = 'https://codeforces.com/api/contest.list';

export default async (ctx) => {
    const contestsData = await got.get(contestAPI).json();
    const contests = contestsData.result;

    const items = contests
        .filter((contests) => contests.phase === 'BEFORE')
        .map((contest) => {
            const title = String(contest.name);
            const date = dayjs.unix(Number.parseInt(contest.startTimeSeconds));
            const description = art(path.join(__dirname, 'templates/contest.art'), {
                title,
                startTime: date.format('LL LT'),
                durationTime: sec2str(contest.durationSeconds),
                // relativeTime: sec2str(contest.relativeTimeSeconds),
                type: contest.type,
            });

            return {
                title,
                description,
                link: 'https://codeforces.com/contests/' + contest.id,
            };
        });

    ctx.set('data', {
        title: 'Codeforces - Contests',
        link: 'https://codeforces.com/contests',
        item: items,
    });
};
