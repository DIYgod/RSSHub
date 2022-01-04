const got = require('@/utils/got');
const path = require('path');
const { art } = require('@/utils/render');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const contestAPI = 'https://codeforces.com/api/contest.list';

module.exports = async (ctx) => {
    const contestsData = await got.get(contestAPI).json();
    const contests = contestsData.result;

    const items = contests
        .filter((contests) => contests.phase === 'BEFORE')
        .map((contest) => {
            const title = String(contest.name);
            const description = art(path.join(__dirname, 'templates/contest.art'), {
                title,
                startTime: timezone(parseDate(contest.startTimeSeconds * 1000), +0),
                durationTime: contest.durationSeconds / 60,
                relativeTime: Math.floor(contest.relativeTimeSeconds / 60),
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
