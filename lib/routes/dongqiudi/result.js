const got = require('@/utils/got');
const { JSDOM } = require('jsdom');

module.exports = async (ctx) => {
    const team = ctx.params.team;
    const link = `https://www.dongqiudi.com/team/${team}.html`;

    const response = await got.get(link);
    const dom = new JSDOM(response.data, {
        runScripts: 'dangerously',
    });
    const data = dom.window.__NUXT__.data[0];
    const resultData = data.teamScheduleData.filter((data) => data.fs_A && data.fs_B);

    const teamName = data.teamDetail.base_info.team_name;

    const out = resultData.map((result) => ({
        title: `${result.match_title} ${result.team_A_name} ${result.fs_A}-${result.fs_B} ${result.team_B_name}`,
        guid: result.match_id,
        link: result.scheme.replace('dongqiudi:///game/', 'https://www.dongqiudi.com/liveDetail/'),
        pubDate: result.start_time,
    }));

    ctx.state.data = {
        title: `${teamName} 比赛结果`,
        link,
        item: out.slice(out.length - 10, out.length),
    };
};
