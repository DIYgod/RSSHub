const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '1';

    const rootUrl = 'https://www.sctv.com';
    const apiRootUrl = 'https://kscgc.sctv-tf.com';
    const apiUrl = `${apiRootUrl}//sctv/lookback/${id}/index.json`;
    const listUrl = `${apiRootUrl}//sctv/lookback/index/lookbackList.json`;
    const currentUrl = `${rootUrl}/column/detail?programmeIndex=/sctv/lookback/${id}/index.json`;

    let response = await got({
        method: 'get',
        url: apiUrl,
    });

    const programmeUrl = `${apiRootUrl}/${response.data.data.programmeUrl}`;

    response = await got({
        method: 'get',
        url: programmeUrl,
    });

    const items = response.data.data.programmeList.map((item) => ({
        title: item.programmeTitle,
        link: item.programmeUrl,
        pubDate: timezone(parseDate(item.pubTime), +8),
        description: art(path.join(__dirname, 'templates/description.art'), {
            cover: item.programmeImage,
            video: item.programmeUrl,
        }),
    }));

    response = await got({
        method: 'get',
        url: listUrl,
    });

    let name, cover;
    for (const p of response.data.data.programme_official) {
        if (p.programmeId === id) {
            name = p.programmeName;
            cover = p.programmeCover;
            break;
        }
    }

    ctx.state.data = {
        title: `四川广播电视台 - ${name}`,
        link: currentUrl,
        item: items,
        image: cover,
    };
};
