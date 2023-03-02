const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const baseUrl = 'https://www.pixiv.net';

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const url = `${baseUrl}/users/${id}/novels`;
    const { data: allData } = await got(`${baseUrl}/ajax/user/${id}/profile/all`, {
        headers: {
            referer: url,
        },
    });

    const novels = Object.keys(allData.body.novels);
    const searchParams = new URLSearchParams();
    novels.forEach((novel) => {
        searchParams.append('ids[]', novel);
    });

    const { data } = await got(`${baseUrl}/ajax/user/${id}/profile/novels`, {
        headers: {
            referer: url,
        },
        searchParams,
    });

    const items = Object.values(data.body.works).map((item) => ({
        title: item.seriesTitle || item.title,
        description: item.description || item.title,
        link: `${baseUrl}/novel/series/${item.id}`,
        author: item.userName,
        pubDate: parseDate(item.createDate),
        updated: parseDate(item.updateDate),
        category: item.tags,
    }));

    ctx.state.data = {
        title: data.body.extraData.meta.title,
        description: data.body.extraData.meta.ogp.description,
        image: Object.values(data.body.works)[0].profileImageUrl,
        link: url,
        item: items,
    };
};
