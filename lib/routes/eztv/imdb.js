const dayjs = require('dayjs');

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

    let torrents = [];
    if (response.data.torrents_count !== 0) {
        torrents = response.data.torrents;
    }

    ctx.state.data = {
        title: `EZTV's Torrents of IMBD ID: ${imdb_id}`,
        link: 'https://eztv.it',
        description: `EZTV's Torrents of IMBD ID: ${imdb_id}`,
        allowEmpty: true,
        item: torrents.map((item) => ({
            title: item.title,
            description: `<img src='https:${item.large_screenshot}' />`,
            enclosure_url: item.magnet_url,
            enclosure_type: 'application/x-bittorrent',
            pubDate: dayjs.unix(item.date_released_unix).toDate(),
            link: item.torrent_url,
        })),
    };
};
