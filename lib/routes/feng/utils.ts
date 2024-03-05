// @ts-nocheck
import cache from '@/utils/cache';
const CryptoJS = require('crypto-js');
import got from '@/utils/got';
import { config } from '@/config';
const apiUrl = 'https://api.wfdata.club';
const baseUrl = 'https://www.feng.com';
const KEY = '2b7e151628aed2a6';

// https://juejin.cn/post/6844904066468806664
const getXRequestId = (apiUrl) => {
    const path = new URL(apiUrl).pathname; // split search params
    const plainText = CryptoJS.enc.Utf8.parse('url=' + path + '$time=' + Date.now() + '000000');
    const iv = CryptoJS.enc.Utf8.parse(KEY);
    const encrypted = CryptoJS.AES.encrypt(plainText, iv, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    }).toString();
    return encrypted;
};

const getCategory = (topicId) => {
    const url = `${apiUrl}/v1/topic/category`;
    return cache.tryGet(
        url,
        async () => {
            const response = await got(url, {
                headers: {
                    Referer: `${baseUrl}/forum/${topicId}`,
                    'X-Request-Id': getXRequestId(url),
                },
            });
            return response.data;
        },
        config.cache.routeExpire,
        false
    );
};

const getForumMeta = async (topicId) => {
    const categoryData = await getCategory(topicId);
    return Object.values(categoryData.data.dataList).find((item) => item.dataList.find((i) => i.topicId === topicId));
};

const getThreads = (topicId, type) => {
    const url = `${apiUrl}/v1/topic/${topicId}/thread?topicId=${topicId}&type=${type}&pageCount=50&order=${type === 'newest' ? 'replyTime' : 'postTime'}&page=1`;
    return cache.tryGet(
        url,
        async () => {
            const response = await got(url, {
                headers: {
                    Referer: `${baseUrl}/forum/${topicId}`,
                    'X-Request-Id': getXRequestId(url),
                },
            });
            return response.data;
        },
        config.cache.routeExpire,
        false
    );
};

const getThread = (tid, topicId) => {
    const url = `${apiUrl}/v1/thread/${tid}`;
    return cache.tryGet(url, async () => {
        const response = await got(url, {
            headers: {
                Referer: `${baseUrl}/forum/${topicId}`,
                'X-Request-Id': getXRequestId(url),
            },
        });
        return response.data;
    });
};

module.exports = {
    baseUrl,
    getForumMeta,
    getThreads,
    getThread,
};
