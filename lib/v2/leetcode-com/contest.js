const got = require('@/utils/got');
const moment = require('moment');

module.exports = async (ctx) => {
    const rootUrl = 'https://leetcode.com';
    const currentUrl = `${rootUrl}/graphql`;
    const response = await got({
        method: 'post',
        url: currentUrl,
        json: {
            query: '{\n  brightTitle\n  currentTimestamp\n  allContests {\n    containsPremium\n    title\n    cardImg\n    titleSlug\n    description\n    startTime\n    duration\n    originStartTime\n    isVirtual\n    company {\n      watermark\n      __typename\n    }\n    __typename\n  }\n}\n',
        },
    });
    const allContests = response.data.data.allContests;

    const contestBaseUrl = 'https://leetcode.com/contest/';
    const items = allContests.slice(0, 10).map((contest) => {
        const beijingTime = moment
            .utc(contest.startTime * 1000)
            .utcOffset('+0800')
            .format('YYYY-MM-DD HH:mm:ss');
        const duration = contest.duration / 3600.0;
        return {
            title: contest.title + ` ( ${beijingTime}, ${duration} 小时 )`,
            description: `北京时间： ${beijingTime} ，时长： ${duration} 小时<br>` + contest.description,
            link: contestBaseUrl + contest.titleSlug,
        };
    });

    ctx.state.data = {
        title: `Leetcode.com 比赛列表`,
        link: currentUrl,
        item: items,
    };
};
