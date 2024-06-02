import { Route } from '@/types';
import got from '@/utils/got';
import { DataItem } from '@/types';

export const route: Route = {
    path: '/imdb/:imdbid?',
    categories: [''],
    example: '/imdb/tt0903747',
    parameters: { imdbid: 'IMBD ID 在IMDb官网地址上可以找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: true,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'EZTV',
    maintainers: ['whitecodes'],
    handler,
    url: 'eztvx.to/',
    description: `EZTV's Torrents of IMBD ID`,
};

async function handler(ctx) {

    // 默认给到imdb排名第一的电视剧
    const imdbId = ctx.req.param('imdbid') ?? '0903747';
    const rootUrl = 'https://eztvx.to';
    const currentUrl = `${rootUrl}/get-torrents?imdb_id=${imdbId}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const responesdata = JSON.parse(response.data);
    const torrents: Torrent[] = responesdata.torrents;

    const items: DataItem[] = torrents.map(convertTorrentToDataItem);

    return {
        title: `${imdbId} torrents`,
        link: `${rootUrl}/get-torrents?imdb_id=${imdbId}`,
        item: items,
    };

}


function convertTorrentToDataItem(torrent: Torrent): DataItem {
    return {
        title: torrent.title,
        description: `Season ${torrent.season}, Episode ${torrent.episode}`,
        pubDate: new Date(torrent.date_released_unix * 1000),
        link: torrent.torrent_url,
        author: [{ name: torrent.imdb_id }],
        guid: torrent.hash,
        id: torrent.hash,
        content: {
            html: `<a href="${torrent.torrent_url}">Download Torrent</a>`,
            text: torrent.filename
        },
        image: torrent.large_screenshot,
        enclosure_url: torrent.torrent_url,
        enclosure_length: parseInt(torrent.size_bytes, 10),
        itunes_duration: torrent.seeds,  // This is just an example mapping
        itunes_item_image: torrent.large_screenshot,
        media: {
            magnet: {
                url: torrent.magnet_url,
                type: "application/x-bittorrent"
            }
        },
        _extra: {
            links: [
                {
                    url: torrent.torrent_url,
                    type: "torrent",
                    content_html: `<a href="${torrent.torrent_url}">Download Torrent</a>`
                }
            ]
        }
    };
}

interface Torrent {
    id: number;
    hash: string;
    filename: string;
    torrent_url: string;
    magnet_url: string;
    title: string;
    imdb_id: string;
    season: string;
    episode: string;
    small_screenshot: string;
    large_screenshot: string;
    seeds: number;
    peers: number;
    date_released_unix: number;
    size_bytes: string;
}