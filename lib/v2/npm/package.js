const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const name = ctx.params.name;
    const packageDownloadLastMonthAPI = `https://api.npmjs.org/downloads/point/last-month/${name}`; // 按月统计
    const packageDownloadLastWeekAPI = `https://api.npmjs.org/downloads/point/last-week/${name}`; // 按周统计
    const packageDownloadLastDayAPI = `https://api.npmjs.org/downloads/point/last-day/${name}`; // 按天统计
    const packageVersionAPI = `https://registry.npmjs.org/${name}`; // 包基本信息

    const downloadCountLastMonthRes = await got(packageDownloadLastMonthAPI).json();
    const downloadCountLastWeekRes = await got(packageDownloadLastWeekAPI).json();
    const downloadCountLastDayRes = await got(packageDownloadLastDayAPI).json();
    const packageVersionRes = await got(packageVersionAPI).json();

    const packageVersion = packageVersionRes.time;
    const packageVersionList = [];
    for (const key in packageVersion) {
        packageVersionList.push({
            version: key,
            time: packageVersion[key],
        });
    }
    packageVersionList.reverse();

    ctx.state.data = {
        title: `${name} - npm`,
        link: `https://www.npmjs.com/package/${name}`,
        description: `${name} - npm`,
        item: [
            {
                title: `${name} - npm`,
                description: art(path.join(__dirname, 'templates/package.art'), {
                    packageDownloadCountLastMonth: downloadCountLastMonthRes.downloads,
                    packageDownloadCountLastWeek: downloadCountLastWeekRes.downloads,
                    packageDownloadCountLastDay: downloadCountLastDayRes.downloads,
                    packageVersion: packageVersionList,
                }),
                link: `https://www.npmjs.com/package/${name}`,
                guid: `https://www.npmjs.com/package/${name}${packageVersion.modified}`,
            },
        ],
    };
};
