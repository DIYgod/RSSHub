import CryptoJS from 'crypto-js';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const APP_SIGN_KEY = '4bTogwpz7RzNO2VTFtW7zcfRkAE97ox6ZSgcQi7FgYdqrHqKB7aGqEZ4o7yssa2aEXoV3bQwh12FFgVNlpyYk2Yjm9d2EZGeGu3';
const phoneBaseUrl = 'https://3g.dxy.cn';
const webBaseUrl = 'https://www.dxy.cn';

const generateNonce = (length = 8, type = 'alphabet') => {
    const characters = {
        alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
        number: '0123456789',
    };

    let result = '';
    const selectedCharacters = characters[type] || characters.alphabet;

    for (let i = 0; i < length; i++) {
        result += selectedCharacters.charAt(Math.floor(Math.random() * selectedCharacters.length));
    }

    return result;
};

const sign = (params) => {
    const searchParams = new URLSearchParams(params);
    searchParams.append('appSignKey', APP_SIGN_KEY);
    searchParams.sort();
    return CryptoJS.SHA1(searchParams.toString()).toString();
};

const getPost = (item, tryGet) =>
    tryGet(item.link, async () => {
        const postParams = {
            postId: item.postId,
            serverTimestamp: Date.now(),
            timestamp: Date.now(),
            noncestr: generateNonce(8, 'number'),
        };

        const { data: post } = await got('https://www.dxy.cn/bbs/newweb/post/detail', {
            searchParams: {
                ...postParams,
                sign: sign(postParams),
            },
        });
        if (post.code !== 'success') {
            throw new Error(post.message);
        }

        const $ = load(post.data.body, null, false);

        $('img').each((_, img) => {
            img = $(img);
            img.removeAttr('data-osrc');
            img.removeAttr('data-hsrc');
        });

        item.description = $.html();
        item.updated = parseDate(post.data.lastEditTime, 'x');

        return item;
    });

export { phoneBaseUrl, webBaseUrl, generateNonce, sign, getPost };
