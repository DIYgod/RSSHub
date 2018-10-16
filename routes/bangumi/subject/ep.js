const axios = require('../../../utils/axios');
const DateTime = require('luxon').DateTime;

module.exports = async (subjectID) => {
    const url = `https://api.bgm.tv/subject/${subjectID}?responseGroup=large`;
    const epsInfo = (await axios.get(url)).data;
    const activeEps = [];

    epsInfo.eps.forEach((e) => {
        if (e.status === 'Air') {
            activeEps.push(e);
        }
    });

    return {
        title: `${epsInfo.name_cn}`,
        link: `https://bgm.tv/subject/${subjectID}`,
        description: epsInfo.summary,
        item: activeEps.reverse().map((e) => ({
            title: `ep.${e.sort} ${e.name_cn}`,
            description: `<img src="${epsInfo.images.common}" alt="ep.${e.sort} ${e.name_cn}"><p>${e.desc.replace(/\n+/g, '<br>')}</p>`,
            pubDate: DateTime.fromFormat(e.airdate, 'yyyy-L-dd'),
            guid: e.id,
            link: e.url,
        })),
    };
};
