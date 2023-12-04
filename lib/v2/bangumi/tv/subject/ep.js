const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const { getLocalName } = require('./utils');

module.exports = async (subjectID, showOriginalName) => {
    const url = `https://api.bgm.tv/subject/${subjectID}?responseGroup=large`;
    const { data: epsInfo } = await got(url);
    const activeEps = [];

    epsInfo.eps.forEach((e) => {
        if (e.status === 'Air') {
            activeEps.push(e);
        }
    });

    return {
        title: getLocalName(epsInfo, showOriginalName),
        link: `https://bgm.tv/subject/${subjectID}`,
        description: epsInfo.summary,
        item: activeEps.map((e) => ({
            title: `ep.${e.sort} ${getLocalName(e, showOriginalName)}`,
            description: art(path.resolve(__dirname, '../../templates/tv/ep.art'), {
                e,
                epsInfo,
            }),
            pubDate: parseDate(e.airdate),
            link: e.url.replace('http:', 'https:'),
        })),
    };
};
