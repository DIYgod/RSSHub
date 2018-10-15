const axios = require('../../../utils/axios');
const DateTime = require('luxon').DateTime;

module.exports = async (subjectID) => {
    const url = `https://api.bgm.tv/subject/${subjectID}/ep`;
    const epsInfo = (await axios.get(url)).data;
    const activeEps = [];

    epsInfo.eps.forEach((e) => {
        if (e.status !== 'NA') {
            activeEps.push(e);
        }
    });

    return {
        title: `${epsInfo.name_cn}的Bangumi章节`,
        link: `https://bgm.tv/subject/${subjectID}`,
        item: activeEps.map((e) => ({
            title: e.name_cn,
            description: e.desc,
            pubDate: DateTime.fromFormat(e.airdate, 'yyyy-L-dd'),
            guid: e.id,
            link: e.url,
        })),
    };
};
