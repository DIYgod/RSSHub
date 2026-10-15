import { load } from 'cheerio';
import CryptoJS from 'crypto-js';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import type { PostData } from './types';

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

const getPost = async (item) => {
    const content = await cache.tryGet(`dxy:post:content:${item.postId}`, async () => {
        const postParams = {
            postId: item.postId,
            serverTimestamp: Date.now(),
            timestamp: Date.now(),
            noncestr: generateNonce(8, 'number'),
        };

        const post = await ofetch<PostData>(`${phoneBaseUrl}/bbsapi/bbs/post/detail`, {
            query: {
                ...postParams,
                sign: sign(postParams),
            },
        });
        if (post.code !== 'success') {
            throw new Error(post.message);
        }

        const $ = load(post.data.body, null, false);

        $('img').each((_, img) => {
            const $img = $(img);
            const hsrc = $img.attr('data-hsrc');
            const osrc = $img.attr('data-osrc');
            if (hsrc) {
                $img.attr('src', hsrc);
                $img.removeAttr('data-hsrc');
            }
            if (!osrc) {
                return;
            }

            $img.attr('src', osrc);
            $img.removeAttr('data-osrc');
        });

        $('img[data-video-source]').each((_, img) => {
            const $img = $(img);
            const videoUrl = $img.attr('data-video-source');
            if (!videoUrl) {
                return;
            }
            const video = $('<video controls></video>').attr('src', videoUrl);
            const poster = $img.attr('data-bgimg') ?? $img.attr('src');
            if (poster) {
                video.attr('poster', poster);
            }
            $img.replaceWith(video);
        });

        return {
            description: $.html(),
            pubDate: parseDate(post.data.createTime, 'x'),
            updated: post.data.lastEditTime ? parseDate(post.data.lastEditTime, 'x') : undefined,
            category: post.data.tagInfos.map((tag) => tag.tagName),
        };
    });
    return { ...item, ...content, category: [...new Set([...item.category, ...content.category])] };
};

export { generateNonce, getPost, phoneBaseUrl, sign, webBaseUrl };
