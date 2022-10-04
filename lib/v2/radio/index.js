const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const rootUrl = 'http://www.radio.cn';
    const currentUrl = `${rootUrl}/pc-portal/sanji/detail.html?columnId=${id}`;

    const apiRootUrl = 'http://tacc.radio.cn';
    const apiUrl = `${apiRootUrl}/pcpages/odchannelpages?od_id=${id}&start=1&rows=50`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    if (/^\(.*\)$/.test(response.data)) {
        response.data = JSON.parse(response.data)[0];
    }

    const data = response.data.data;

    const items = data.program.map((item) => ({
        guid: item.id,
        title: item.name,
        link: item.streams[0].url,
        description: `${item.description}${art(path.join(__dirname, 'templates/description.art'), {
            streams: item.streams,
        })}`,
        pubDate: parseDate(item.onlinetime),
        enclosure_url: item.streams[0].url,
        enclosure_type: 'audio/x-m4a',
        itunes_duration: item.duration,
        itunes_item_image: data.odchannel.imageUrl[0].url,
    }));

    ctx.state.data = {
        title: `云听 - ${data.odchannel.name}`,
        link: currentUrl,
        item: items,
        image: data.odchannel.imageUrl[0].url,
        itunes_author: data.odchannel.commissioningEditorName || data.odchannel.editorName || data.odchannel.source || 'radio.cn',
        description: data.odchannel.description || data.odchannel.sub_title || '',
    };
};
