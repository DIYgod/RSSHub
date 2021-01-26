const got = require('got');

module.exports = async (ctx) => {
    const modpackEntry = ctx.params.modpackEntry;
    const ftbLink = `https://www.feed-the-beast.com/modpack/${modpackEntry}/`;
    const { id } = await got({
        url: `https://api.sunekaer.com/modpack/${modpackEntry}`,
        headers: {
            Referer: ftbLink,
        },
    }).json();
    const data = await got({
        url: `https://api.modpacks.ch/public/modpack/${id}`,
        headers: {
            Referer: ftbLink,
        },
    }).json();

    ctx.state.data = {
        title: `${data.name} 模组包更新`,
        link: ftbLink,
        description: data.description,
        item: data.versions.map((item) => ({
            title: item.name,
            description: item.name,
            pubDate: new Date(item.updated * 1000).toUTCString(),
            link: ftbLink,
            guid: `${id}-${item.id}`,
        })),
    };
};
