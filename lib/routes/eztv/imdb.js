const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const { imdb_id } = ctx.params;

    const response = await axios({
        method: 'get',
        url: `https://eztv.ag/api/get-torrents?imdb_id=${imdb_id}`,
        headers: {
            Referer: 'https://eztv.ag',
        },
    });

    const { torrents } = response.data;

    ctx.state.data = {
        title: `EZTV's Torrents of IMBD ID: ${imdb_id}`,
        link: 'https://eztv.ag',
        description: `EZTV's Torrents of IMBD ID: ${imdb_id}`,
        item: torrents.map((item) => ({
            title: item.title,
            description: item.magnet_url,
            pubDate: new Date(item.date_released_unix * 1000).toUTCString(),
            link: item.torrent_url,
        })),
    };
};
