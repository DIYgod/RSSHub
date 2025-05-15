import got from '@/utils/got';
import CryptoJS from 'crypto-js';

const apiHost = 'https://api.creative-comic.tw';
const device = 'web_desktop';
const DEFAULT_TOKEN = 'freeforccc2020reading';

const getBook = (bookId, uuid) =>
    got(`${apiHost}/book/${bookId}/info`, {
        headers: {
            device,
            uuid,
        },
    });

const getChapter = (id, uuid) =>
    got(`${apiHost}/book/chapter/${id}`, {
        headers: {
            device,
            uuid,
        },
    });

const getChapters = (bookId, uuid) =>
    got(`${apiHost}/book/${bookId}/chapter`, {
        headers: {
            device,
            uuid,
        },
    });

const getImgEncrypted = async (pageId, quality) => {
    const { data: res } = await got(`https://storage.googleapis.com/ccc-www/fs/chapter_content/encrypt/${pageId}/${quality}`, {
        headers: {
            device,
        },
        responseType: 'buffer',
    });
    return Buffer.from(res).toString('base64');
};

const getImgKey = (pageId, uuid) =>
    got(`${apiHost}/book/chapter/image/${pageId}`, {
        headers: {
            device,
            uuid,
        },
    });

const getUuid = (tryGet) =>
    tryGet('creative-comic:uuid', async () => {
        const { data } = await got(`${apiHost}/guest`, {
            headers: {
                device,
            },
        });
        return data.data;
    });

const decrypt = (encrypted, secrets) =>
    CryptoJS.AES.decrypt(encrypted, CryptoJS.enc.Hex.parse(secrets.key), {
        iv: CryptoJS.enc.Hex.parse(secrets.iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    }).toString(CryptoJS.enc.Utf8);

const token2Key = (token) => {
    const t = CryptoJS.SHA512(token).toString();
    return {
        key: t.slice(0, 64),
        iv: t.slice(30, 62), // t.substr(30, 32)
    };
};

const getRealKey = (imgKey, token = DEFAULT_TOKEN) => {
    const secrets = token2Key(token);
    const key = decrypt(imgKey, secrets);
    const realKey = key.split(':');
    return {
        key: realKey[0],
        iv: realKey[1],
    };
};

export { apiHost, getBook, getChapter, getChapters, getImgEncrypted, getImgKey, getUuid, decrypt, token2Key, getRealKey };
