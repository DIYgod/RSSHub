const axios = require('../../utils/axios');
const config = require('../../config');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'https://eztv.ag/api/get-torrents?limit=200&page=1',
        headers: {
            'User-Agent': config.ua,
            Referer: 'https://eztv.ag',
        },
    });

    const { torrents } = response.data;

    ctx.state.data = {
        title: `EZTV's Recent Torrents`,
        link: `https://eztv.ag/api/get-torrents?limit=200&page=1`,
        description: `EZTV's Recent Torrents`,
        item: torrents.map((item) => ({
            title: item.title,
            description: item.magnet_url,
            pubDate: new Date(item.date_released_unix * 1000).toUTCString(),
            link: item.torrent_url,
        })),
    };
};
