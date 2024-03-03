// @ts-nocheck
import got from '@/utils/got';
const CryptoJS = require('crypto-js');
import { parseDate } from '@/utils/parse-date';
const { queries } = require('./queries');

export default async (ctx) => {
    const host = 'https://www.mixcloud.com';
    const imageBaseURL = 'https://thumbnailer.mixcloud.com/unsafe/480x480/';
    const graphqlURL = 'https://app.mixcloud.com/graphql';
    const headers = {
        Referer: host,
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    };

    const type = ctx.req.param('type') ?? 'uploads';
    if (!['stream', 'uploads', 'favorites', 'listens'].includes(type)) {
        throw new Error(`Invalid type: ${type}`);
    }
    const username = ctx.req.param('username');

    const config = {
        stream: { name: 'Stream', node: 'stream' },
        uploads: { name: 'Shows', node: 'uploads' },
        favorites: { name: 'Favorites', node: 'favorites' },
        listens: { name: 'History', node: 'listeningHistory' },
    };
    const payloads = {
        stream: {
            query: queries.stream.query,
            variables: {
                lookup: {
                    username: ctx.req.param('username'),
                },
            },
        },
        uploads: {
            query: queries.uploads.query,
            variables: {
                lookup: {
                    username: ctx.req.param('username'),
                },
                orderBy: 'LATEST',
            },
        },
        favorites: {
            query: queries.favorites.query,
            variables: {
                lookup: {
                    username: ctx.req.param('username'),
                },
            },
        },
        listens: {
            query: queries.listens.query,
            variables: {
                lookup: {
                    username: ctx.req.param('username'),
                },
            },
        },
    };

    const data = (
        await got({
            method: 'post',
            url: graphqlURL,
            json: payloads[type],
            headers,
        })
    ).data.data;

    const biog = data.user.biog;
    const image = `${imageBaseURL}${data.user.picture.urlRoot}`;

    // https://github.com/ytdl-org/youtube-dl/blob/f1487d4fca40fd37d735753e24a7bae53a1b1513/youtube_dl/extractor/mixcloud.py#L72-L79
    const decryptionKey = 'IFYOUWANTTHEARTISTSTOGETPAIDDONOTDOWNLOADFROMMIXCLOUD';
    const decryptXorCipher = (key, cipherText) => {
        const cipher = CryptoJS.enc.Base64.parse(cipherText);
        const decrypted = cipher.toString(CryptoJS.enc.Utf8);
        let result = '';
        for (let i = 0; i < decrypted.length; i++) {
            result += String.fromCharCode(decrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return result;
    };

    const items = data.user[config[type].node].edges.map((edge) => {
        const item = type === 'listens' ? edge.node.cloudcast : edge.node;
        return {
            title: item.name,
            author: item.owner.displayName,
            description: item.description.replaceAll('\n', '<br>'),
            pubDate: parseDate(item.publishDate),
            guid: Buffer.from(item.id, 'base64').toString('utf8'),
            link: `${host}/${username}/${item.slug}`,
            itunes_item_image: `${imageBaseURL}${item.picture.urlRoot}`,
            itunes_duration: item.audioLength,
            enclosure_url: decryptXorCipher(decryptionKey, item.streamInfo.url),
            enclosure_type: 'audio/x-m4a',
            upvotes: item.favorites.totalCount,
        };
    });

    ctx.set('data', {
        title: `Mixcloud - ${data.user.displayName}'s ${config[type].name}`,
        description: biog.replaceAll('\n', '<br>'),
        itunes_author: data.user.displayName,
        image,
        link: `${host}/${username}/${type}/`,
        item: items,
    });
};
