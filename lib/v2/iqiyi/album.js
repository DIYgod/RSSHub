const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const { id } = ctx.params;

    const { data: response } = await got(`https://www.iq.com/album/${id}`);

    const $ = cheerio.load(response);
    const nextData = JSON.parse($('#__NEXT_DATA__').text());
    const { album } = nextData.props.initialState;

    const {
        data: { data: baseInfo },
    } = await got(`https://pcw-api.iqiyi.com/album/album/baseinfo/${album.videoAlbumInfo.albumId}`);

    if (Object.keys(album.cacheAlbumList).length === 0) {
        throw Error(`${baseInfo.name} is not available in this server region.`);
    }

    let pos = 1;
    let hasMore = false;
    let epgs = [];
    do {
        const {
            data: { data },
            // eslint-disable-next-line no-await-in-loop
        } = await got(`https://pcw-api.iq.com/api/v2/episodeListSource/${album.videoAlbumInfo.albumId}`, {
            searchParams: {
                platformId: 3,
                modeCode: 'intl',
                langCode: 'zh_cn',
                endOrder: album.videoAlbumInfo.maxOrder,
                startOrder: pos,
            },
        });
        epgs = [...epgs, ...data.epg];
        pos = data.pos;
        hasMore = data.hasMore;
    } while (hasMore);

    const items = epgs.map((item) => ({
        title: item.name,
        description: art(path.join(__dirname, 'templates/album.art'), {
            item,
        }),
        link: `https://www.iq.com/play/${item.playLocSuffix}`,
        pubDate: parseDate(item.initIssueTime),
    }));

    ctx.state.data = {
        title: baseInfo.name,
        description: baseInfo.description,
        image: album.videoAlbumInfo.albumFocus1024,
        link: `https://www.iq.com/album/${album.videoAlbumInfo.albumLocSuffix}`,
        item: items,
        allowEmpty: true,
    };
};
