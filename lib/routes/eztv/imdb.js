const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { imdb_id } = ctx.params;

    const response = await got({
        method: 'get',
        url: `https://eztv.it/api/get-torrents?imdb_id=${imdb_id}`,
        headers: {
            Referer: 'https://eztv.it',
        },
    });

    const { torrents } = response.data;

    ctx.state.data = {
        title: `EZTV's Torrents of IMBD ID: ${imdb_id}`,
        link: 'https://eztv.it',
        description: `EZTV's Torrents of IMBD ID: ${imdb_id}`,
        item: torrents.map((item) => ({
            title: item.title,
            description: `<img src="https:${item.large_screenshot}" />`,
            enclosure_url: item.magnet_url,
            enclosure_type: 'application/x-bittorrent',
            pubDate: new Date(item.date_released_unix * 1000).toUTCString(),
            link: item.torrent_url,
        })),
    };
};
