const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '877';
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 100;

    const hostUrl = 'https://vod.m2oplus.nmtv.cn';
    const apiRootUrl = 'https://mapi.m2oplus.nmtv.cn';
    const apiUrl = `${apiRootUrl}/api/v1/contents.php?offset=0&count=${limit}&column_id=${id}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const data = response.data;

    const items = data.map((item) => {
        const enclosure_url = `${hostUrl}/${item.target_path}${item.target_filename}`;
        const enclosure_type = `${item.type}/${enclosure_url.match(/\.(\w+)$/)[1]}`;

        return {
            title: item.title,
            link: item.content_url,
            author: item.column_name,
            pubDate: timezone(parseDate(item.publish_time), +8),
            description: art(path.join(__dirname, 'templates/description.art'), {
                type: item.type,
                image: item.index_pic,
                file: enclosure_url,
            }),
            enclosure_url,
            enclosure_type,
            itunes_duration: item.video.duration,
            itunes_item_image: item.index_pic,
        };
    });

    const author = data[0].column_name;
    const imageUrl = data[0].column_info.indexpic;

    ctx.state.data = {
        title: `内蒙古广播电视台 - ${author}`,
        link: items[0].link.split(/\/\d{4}-\d{2}-\d{2}\//)[0],
        item: items,
        image: `${imageUrl.host}${imageUrl.filepath}${imageUrl.filename}`,
        itunes_author: author,
    };
};
