const got = require('@/utils/got');
const path = require('path');
const { art } = require('@/utils/render');

const dayjs = require('dayjs');
dayjs.extend(require('dayjs/plugin/localizedFormat'));
dayjs.extend(require('dayjs/plugin/duration'));
dayjs.extend(require('dayjs/plugin/relativeTime'));
require('dayjs/locale/zh-cn');
dayjs.locale('zh-cn');

const sec2str = (sec) => dayjs.duration(parseInt(sec), 'seconds').humanize();

const contestAPI = 'https://codeforces.com/api/contest.list';

module.exports = async (ctx) => {
    const contestsData = await got.get(contestAPI).json();
    const contests = contestsData.result;

    const items = contests
        .filter((contests) => contests.phase === 'BEFORE')
        .map((contest) => {
            const title = String(contest.name);
            const date = dayjs.unix(parseInt(contest.startTimeSeconds));
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

    ctx.state.data = {
        title: 'Codeforces - Contests',
        link: 'https://codeforces.com/contests',
        item: items,
    };
};
