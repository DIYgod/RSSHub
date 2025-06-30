import { Route } from '@/types';
import got from '@/utils/got';
import CryptoJS from 'crypto-js';
import { parseDate } from '@/utils/parse-date';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import { MIXCLOUD_CONFIG, TYPE_CONFIG, TYPE_NAMES, getObjectFields } from './config';

export const route: Route = {
    path: '/:username/:type?',
    categories: ['multimedia'],
    example: '/mixcloud/dholbach/uploads',
    parameters: {
        username: 'Username, can be found in URL',
        type: 'Type, see below, uploads by default',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    radar: [
        {
            source: ['mixcloud.com/:username/:type?'],
        },
        {
            source: ['www.mixcloud.com/:username/:type?'],
        },
    ],
    name: 'User',
    maintainers: ['Misaka13514'],
    handler,
    description: `| Shows   | Reposts | Favorites | History | Stream |
| ------- | ------- | --------- | ------- | ------ |
| uploads | reposts | favorites | listens | stream |`,
};

async function callApi(objectType: string, objectFields: string, username: string, slug?: string) {
    const lookupKey = objectType + 'Lookup';
    const headers = MIXCLOUD_CONFIG.headers;

    const lookupParams = slug ? `, slug: "${slug}"` : '';
    const query = `{
    ${lookupKey}(lookup: {username: "${username}"${lookupParams}}) {
      ${objectFields}
    }
  }`;

    const response = await got({
        method: 'post',
        url: MIXCLOUD_CONFIG.graphqlURL,
        headers,
        json: { query },
    });

    return response.data.data[lookupKey];
}

// https://github.com/yt-dlp/yt-dlp/commits/master/yt_dlp/extractor/mixcloud.py
function decryptXorCipher(key: string, ciphertext: string): string {
    const decoded = CryptoJS.enc.Base64.parse(ciphertext).toString(CryptoJS.enc.Utf8);
    return [...decoded].map((ch, i) => String.fromCodePoint((ch.codePointAt(0) || 0) ^ (key.codePointAt(i % key.length) || 0))).join('');
}

function tryDecrypt(ciphertext: string | undefined): string {
    if (!ciphertext) {
        return '';
    }
    try {
        return decryptXorCipher(MIXCLOUD_CONFIG.decryptionKey, ciphertext);
    } catch {
        return ciphertext;
    }
}

function getCloudcast(node: any, type: string): any {
    if (type === 'playlist' || type === 'listens') {
        return node.cloudcast;
    }
    return node;
}

function getPlaylistTitle(displayName: string, type: string, playlistName?: string): string {
    if (type === 'playlist' && playlistName) {
        return `Mixcloud - ${displayName}'s Playlist: ${playlistName}`;
    }
    return `Mixcloud - ${displayName}'s ${TYPE_NAMES[type] || type}`;
}

function getPlaylistLink(username: string, type: string, playlistSlug?: string): string {
    const host = MIXCLOUD_CONFIG.host;
    if (type === 'playlist' && playlistSlug) {
        return `${host}/${username}/playlists/${playlistSlug}/`;
    }
    return `${host}/${username}/${type === 'uploads' ? '' : type + '/'}`;
}

export async function handler(ctx) {
    const username = ctx.req.param('username');
    const playlistSlug = ctx.req.param('playlist');
    const type = ctx.req.param('type') ?? (playlistSlug ? 'playlist' : 'uploads');

    if (!TYPE_CONFIG[type]) {
        throw new InvalidParameterError(`Invalid type: ${type}`);
    }

    const { objectType, objectFields } = getObjectFields(type);

    const data = await callApi(objectType, objectFields, username, playlistSlug);

    if (!data) {
        throw new Error(`${type === 'playlist' ? 'Playlist' : 'User'} not found`);
    }

    const isPlaylist = type === 'playlist';
    const displayName = isPlaylist ? username : data.displayName;
    const description = isPlaylist ? data.description : data.biog;
    const picture = data.picture;
    const image = picture && picture.urlRoot ? `${MIXCLOUD_CONFIG.imageBaseURL}${picture.urlRoot}` : '';

    const itemsData = data[TYPE_CONFIG[type]];
    const edges = itemsData?.edges || [];

    const items = edges
        .map((edge: any) => {
            const cloudcast = getCloudcast(edge.node, type);

            if (!cloudcast) {
                return null;
            }

            const streamInfo = cloudcast.streamInfo || {};
            const enclosureUrl = tryDecrypt(streamInfo.url);
            const tags = cloudcast.tags?.map((t: any) => t.tag?.name).filter(Boolean) || [];

            let richDescription = cloudcast.description?.replaceAll('\n', '<br>') || '';

            if (cloudcast.featuringArtistList && cloudcast.featuringArtistList.length > 0) {
                const artists = cloudcast.featuringArtistList.slice(0, 5).join(', ');
                richDescription += richDescription ? '<br><br>' : '';
                richDescription += `<strong>Featured Artists:</strong> ${artists}`;
                if (cloudcast.featuringArtistList.length > 5) {
                    richDescription += ` and ${cloudcast.featuringArtistList.length - 5} more...`;
                }
            }

            const stats: string[] = [];
            if (cloudcast.plays) {
                stats.push(`${cloudcast.plays} plays`);
            }
            if (cloudcast.favorites?.totalCount) {
                stats.push(`${cloudcast.favorites.totalCount} favorites`);
            }
            if (cloudcast.reposts?.totalCount) {
                stats.push(`${cloudcast.reposts.totalCount} reposts`);
            }
            if (cloudcast.comments?.totalCount) {
                stats.push(`${cloudcast.comments.totalCount} comments`);
            }

            if (stats.length > 0) {
                richDescription += richDescription ? '<br><br>' : '';
                richDescription += `<em>${stats.join(' • ')}</em>`;
            }

            return {
                title: cloudcast.name,
                author: cloudcast.owner?.displayName || username,
                description: richDescription,
                pubDate: parseDate(cloudcast.publishDate),
                guid: Buffer.from(cloudcast.id, 'base64').toString(),
                link: `${MIXCLOUD_CONFIG.host}/${cloudcast.owner?.username || username}/${cloudcast.slug}`,
                itunes_item_image: cloudcast.picture?.url || '',
                itunes_duration: cloudcast.audioLength,
                enclosure_url: enclosureUrl,
                enclosure_type: 'audio/x-m4a',
                itunes_author: cloudcast.owner?.displayName || username,
                category: tags,
                comments: cloudcast.comments?.totalCount || 0,
                upvotes: cloudcast.favorites?.totalCount || 0,
                media: enclosureUrl
                    ? {
                          content: {
                              url: enclosureUrl,
                              type: 'audio/x-m4a',
                              duration: cloudcast.audioLength,
                          },
                          thumbnail: cloudcast.picture?.url
                              ? {
                                    url: cloudcast.picture.url,
                                }
                              : undefined,
                      }
                    : undefined,
            };
        })
        .filter(Boolean);

    const title = getPlaylistTitle(displayName, type, data.name);
    const link = getPlaylistLink(username, type, playlistSlug);

    return {
        title,
        description: description?.replaceAll('\n', '<br>') || '',
        itunes_author: displayName,
        image,
        link,
        item: items,
    };
}
