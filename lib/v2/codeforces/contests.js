const got = require('@/utils/got');
const path = require('path');
const { art } = require('@/utils/render');

function sec2str (secStr) {
	const sec = Math.abs(parseInt(secStr));
	const d = (Math.floor(sec / 86400) + ":" + (new Date(sec * 1000)).toISOString().substr(11, 8)).split(":");
	let str = `${d[1]} 小时, ${d[2]} 分钟, ${d[3]} 秒 `;
	if (d[0] !== 0) {
		str = `${d[0]} 天, ` + str;
	}
	return str;
}

const contestAPI = 'https://codeforces.com/api/contest.list';

module.exports = async (ctx) => {
    const contestsData = await got.get(contestAPI).json();
    const contests = contestsData.result;

    const items = contests
        .filter((contests) => contests.phase === 'BEFORE')
        .map((contest) => {
            const title = String(contest.name);
            const date = new Date(parseInt(contest.startTimeSeconds) * 1000);
            const options = { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' };
            const description = art(path.join(__dirname, 'templates/contest.art'), {
                title,
                startTime: date.toLocaleTimeString('zh-CN', options),
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
