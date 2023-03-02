const got = require('@/utils/got');
const CryptoJS = require('crypto-js');
const { parseDate } = require('@/utils/parse-date');
const { queries } = require('./queries');

module.exports = async (ctx) => {
    const host = 'https://www.mixcloud.com';
    const imageBaseURL = 'https://thumbnailer.mixcloud.com/unsafe/480x480/';
    const headers = {
        Referer: host,
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    };

    const type = ctx.params.type ?? 'uploads';
    if (!['stream', 'uploads', 'favorites', 'listens'].includes(type)) {
        throw Error(`Invalid type: ${type}`);
    }
    const username = ctx.params.username;

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
                    username: ctx.params.username,
                },
            },
        },
        uploads: {
            query: queries.uploads.query,
            variables: {
                lookup: {
                    username: ctx.params.username,
                },
                orderBy: 'LATEST',
                audioTypes: ['SHOW'],
            },
        },
        favorites: {
            query: queries.favorites.query,
            variables: {
                lookup: {
                    username: ctx.params.username,
                },
            },
        },
        listens: {
            query: queries.listens.query,
            variables: {
                lookup: {
                    username: ctx.params.username,
                },
            },
        },
        profile: {
            query: queries.profile.query,
            variables: {
                lookup: {
                    username: ctx.params.username,
                },
            },
        },
    };

    const profile = (
        await got({
            method: 'post',
            url: `${host}/graphql`,
            json: payloads.profile,
            headers,
        })
    ).data.data;

    const biog = profile.user.biog;
    const image = `${imageBaseURL}${profile.user.picture.urlRoot}`;

    const data = (
        await got({
            method: 'post',
            url: `${host}/graphql`,
            json: payloads[type],
            headers,
        })
    ).data.data;

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
            description: item.description.replace(/\n/g, '<br>'),
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

    ctx.state.data = {
        title: `Mixcloud - ${data.user.displayName}'s ${config[type].name}`,
        description: biog.replace(/\n/g, '<br>'),
        itunes_author: data.user.displayName,
        image,
        link: `${host}/${username}/${type}/`,
        item: items,
    };
};
