// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import * as path from 'node:path';
import got from '@/utils/got';
import { load } from 'cheerio';
import logger from '@/utils/logger';
import { config } from '@/config';
import puppeteer from '@/utils/puppeteer';

const templates = {
    desc: path.join(__dirname, 'templates/desc.art'),
    cover: path.join(__dirname, 'templates/cover.art'),
    embed: path.join(__dirname, 'templates/embed.art'),
    iframe: path.join(__dirname, 'templates/iframe.art'),
};

const resolveUrl = (url, tls = true, forceResolve = false) => {
    if (!url) {
        return '';
    }
    if (url.startsWith('//')) {
        return (tls ? 'https:' : 'http:') + url;
    }
    if (forceResolve && !/^https?:\/\//.test(url)) {
        return (tls ? 'https://' : 'http://') + url;
    }
    return url;
};

const proxyVideo = (url, proxy) => {
    if (!(url && proxy)) {
        return url + '';
    }
    if (proxy.includes('?')) {
        if (!proxy.endsWith('=')) {
            proxy += '=';
        }
        return proxy + encodeURIComponent(url);
    } else {
        if (!proxy.endsWith('/')) {
            proxy += '/';
        }
        return proxy + url;
    }
};

const getOriginAvatar = (url) =>
    resolveUrl(url)
        .replace(/^(.*\.douyinpic\.com\/).*(\/aweme-avatar\/)([^?]*)(\?.*)?$/, '$1origin$2$3')
        .replaceAll(/~\w+_\d+x\d+/g, '');

const extractRenderData = (html) => {
    if (!html) {
        throw new Error('Empty html. The request may be filtered by WAF.');
    }

    const $ = load(html);
    const renderData = JSON.parse(decodeURIComponent($('script#RENDER_DATA').html()));
    if (!renderData) {
        const title = $('title').text();
        if (title.includes('验证')) {
            throw new Error(title);
        } else if ($('#captcha_container').length > 0) {
            throw new Error('Captcha required.');
        }
        throw new Error('Failed to get render data.');
    } else if (renderData.isSpider) {
        throw new Error('The request was considered to be from a spider.');
    } else {
        return renderData;
    }
};

const gotGet = async (url, ua) => {
    const response = await got(url, {
        headers: {
            'User-Agent': ua, // magic!
        },
    });
    return extractRenderData(response.data);
};

const puppeteerGet = async (pageUrl) => {
    const browser = await puppeteer();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });
    await page.goto(pageUrl, {
        waitUntil: 'domcontentloaded',
    });
    const html = await page.evaluate(() => document.documentElement.innerHTML);
    await browser.close();
    return extractRenderData(html);
};

const universalGet = async (url, route) => {
    const cacheKey = `douyin:utils:universalGet:gotFirst:${route}`;
    const gotFirst = await cache.tryGet(
        cacheKey,
        () => '1',
        config.cache.contentExpire,
        false // no refresh now
    );

    const ua = route === 'live' ? 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' : 'curl/7.86.0';

    let data;
    if (gotFirst === '1') {
        try {
            data = await gotGet(url, ua);
            cache.set(cacheKey, '1', config.cache.contentExpire); // refresh if success
        } catch (error) {
            logger.warn('Failed to get data with got, trying puppeteer: ' + error.message);
            data = await puppeteerGet(url);
            cache.set(cacheKey, '0', config.cache.contentExpire); // only set if success
        }
    } else {
        try {
            data = await puppeteerGet(url);
            cache.set(cacheKey, '0', config.cache.contentExpire); // refresh if success
        } catch (error) {
            logger.warn('Failed to get data with puppeteer, trying got: ' + error.message);
            data = await gotGet(url, ua);
            cache.set(cacheKey, '1', config.cache.contentExpire); // only set if success
        }
    }
    return data;
};

module.exports = {
    templates,
    resolveUrl,
    proxyVideo,
    getOriginAvatar,
    universalGet,
};
