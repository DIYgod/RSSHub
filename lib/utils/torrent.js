const stringSimilarity = require('string-similarity');
const Parser = require('rss-parser');
const TorrentSearchApi = require('torrent-search-api');
const TorrentProvider = require('torrent-search-api/lib/TorrentProvider');

const logger = require('@/utils/logger');

TorrentSearchApi.overrideConfig('Eztv', {
    baseUrl: 'https://eztv.re',
});
TorrentSearchApi.overrideConfig('Limetorrents', {
    baseUrl: 'https://limetorrents.buzz',
});
TorrentSearchApi.overrideConfig('ThePirateBay', {
    baseUrl: 'https://www.pirateproxy-bay.com',
});
TorrentSearchApi.overrideConfig('Torrentz2', {
    baseUrl: 'https://torrentz2eu.org',
});

class HDHome extends TorrentProvider {
    constructor() {
        super({
            name: 'HDHome',
            baseUrl: 'https://hdhome.org',
            searchUrl: `/torrentrss.php?rows=20&search={query}&linktype=dl&passkey=`,
            passkey: '',
            categories: {
                All: '',
                Movies: '',
                TV: '',
                Music: '',
            },
        });
        this.parser = new Parser();
    }

    getUrl(category, query) {
        const url = super.getUrl(category, query);
        return `${url}${this.passkey}`;
    }

    search(query, category) {
        const url = this.getUrl(category, query);
        if (url === null) {
            return Promise.resolve([]);
        }
        return this.parser.parseURL(url).then((feed) =>
            feed.items.map((t) => ({
                provider: this.name,
                title: t.title,
                time: t.pubDate,
                seeds: 1000,
                peers: 1000,
                size: t.enclosure.length,
                link: t.enclosure.url,
                magnet: t.enclosure.url,
                desc: t.content,
            }))
        );
    }
}

TorrentSearchApi.loadProvider(HDHome);

const allProviders = ['HDHome', 'Rarbg', '1337x', 'Yts', 'Eztv'];
for (const provider of allProviders) {
    TorrentSearchApi.enableProvider(provider);
}

function normalize(title) {
    return title
        .replace(/[\W_]+/g, ' ')
        .trim()
        .toLowerCase();
}

function containsAll(title, keyword) {
    const index = title.indexOf(keyword);
    if (index < 0) {
        return false;
    }
    const nextIndex = index + keyword.length;
    if (nextIndex < title.length) {
        return title[nextIndex] === ' ';
    }
    return true;
}

function convertSize(size) {
    const sizeParts = size.split(/[ ,]+/);
    let scale = 1;
    if (sizeParts.length > 1) {
        switch (sizeParts[1].toUpperCase()) {
            case 'KB':
                scale = 1024;
                break;
            case 'MB':
                scale = 1024 * 1024;
                break;
            case 'GB':
                scale = 1024 * 1024 * 1024;
                break;
            default:
                break;
        }
    }
    return parseFloat(sizeParts[0]) * scale;
}

module.exports = {
    allProviders,
    get: async (providers, params, keywords, category, minSeeds, minRating) => {
        for (const provider of providers) {
            if (TorrentSearchApi.isProviderActive(provider)) {
                TorrentSearchApi.enableProvider(provider);
            }
            TorrentSearchApi.overrideConfig(provider, params);
        }

        const keyword = keywords[0];
        const normalizeKeyword = normalize(keyword);
        let torrents;
        try {
            torrents = await TorrentSearchApi.search(providers, keywords.join(' '), category);
        } catch (e) {
            // expect a status code error, but we don't mind catching all errors here
            // logger.debug(e);
            return {};
        }
        if (torrents && torrents.length > 0) {
            let bestRating = 0;
            let bestSize = 0;
            let bestTorrent = torrents[0];
            for (const torrent of torrents) {
                if (torrent.seeds < minSeeds) {
                    continue;
                }
                const normalizeTitle = normalize(torrent.title);
                const rating = containsAll(normalizeTitle, normalizeKeyword) ? 1 : stringSimilarity.compareTwoStrings(normalizeKeyword, normalizeTitle);
                const size = convertSize(torrent.size);
                if (rating > bestRating || (rating === bestRating && size > bestSize)) {
                    bestRating = rating;
                    bestSize = size;
                    bestTorrent = torrent;
                }
            }
            logger.debug('matched torrent', {
                providers,
                keywords,
                bestRating,
                bestTorrent,
            });
            if (bestRating >= minRating) {
                return {
                    enclosure_url: await TorrentSearchApi.getMagnet(bestTorrent),
                    enclosure_type: 'application/x-bittorrent',
                };
            }
        }
        return {};
    },
};
