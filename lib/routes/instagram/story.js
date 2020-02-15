const got = require('@/utils/got');

module.exports = async (ctx) => {
    const username = ctx.params.username;

    const response = (
        await got({
            method: 'get',
            url: `https://api.storiesig.com/stories/${username}`,
            headers: {
                Referer: `https://storiesig.com/?username=${username}`,
            },
        })
    ).data;

    const items = response.items.map((item) => {
        const image = item.image_versions2 && item.image_versions2.candidates[0].url;
        const video = item.video_versions && item.video_versions[0].url;

        const description = item.video_versions ? `<video src="${video}" width="100%" controls="controls" poster="${image}">Your RSS reader does not support video playback.</video>` : `<img src="${image}" rel="no-referrer">`;
        const pubDate = new Date(item.taken_at * 1000).toUTCString();

        return {
            title: `[快拍/Stories]${item.caption || ''} ${pubDate}`,
            description,
            pubDate,
            link: `https://www.instagram.com/stories/${username}/${item.id}`,
        };
    });

    ctx.state.data = {
        title: `${response.user.full_name}'s stories on Instagram`,
        link: `https://www.instagram.com/stories/${username}/`,
        item: items,
    };
};
