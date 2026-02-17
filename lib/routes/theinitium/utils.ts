import { load } from 'cheerio';
import type { Context } from 'hono';
import { FetchError } from 'ofetch';

import { config } from '@/config';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const TOKEN = 'Basic YW5vbnltb3VzOkdpQ2VMRWp4bnFCY1ZwbnA2Y0xzVXZKaWV2dlJRY0FYTHY=';

export const processFeed = async (model: string, ctx: Context) => {
    // model是channel/tag/etc.，而type是latest/feature/quest-academy这些一级栏目/标签/作者名的slug名。如果是追踪的话，那就是model是follow，type是articles。
    const type = ctx.req.param('type') ?? 'latest';
    const language = ctx.req.param('language') ?? 'zh-hans';
    let listUrl;
    let listLink;
    switch (model) {
        case 'author':
            listUrl = `https://api.theinitium.com/api/v2/author/?language=${language}&slug=${type}`;
            listLink = `https://theinitium.com/author/${type}/`;
            break;
        case 'follow':
            listUrl = `https://api.theinitium.com/api/v2/user/follows/${type}/?language=${language}`;
            listLink = `https://theinitium.com/follow/`;
            break;
        case 'channel':
            listUrl = `https://api.theinitium.com/api/v2/channel/articles/?language=${language}&slug=${type}`;
            listLink = `https://theinitium.com/channel/${type}/`;
            break;
        case 'tags':
            listUrl = `https://api.theinitium.com/api/v2/tag/articles/?language=${language}&slug=${type}`;
            listLink = `https://theinitium.com/tags/${type}/`;
            break;
        default:
            throw new InvalidParameterError('wrong model');
    }

    const key = {
        email: config.initium.username,
        password: config.initium.password,
    };
    const body = JSON.stringify(key);

    let token;
    const cacheIn = await cache.get('initium:token');
    if (cacheIn) {
        token = cacheIn;
    } else if (config.initium.bearertoken) {
        token = config.initium.bearertoken;
        cache.set('initium:token', config.initium.bearertoken);
    } else if (key.email === undefined) {
        token = TOKEN;
    } else {
        const login = await got.post(`https://api.theinitium.com/api/v2/auth/login/?language=${language}`, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Connection: 'keep-alive',
                Authorization: TOKEN,
            },
            body,
        });

        token = 'token ' + login.data.token;
        cache.set('initium:token', token);
    }

    const headers = {
        Accept: '*/*',
        Connection: 'keep-alive',
        Authorization: token,
    };

    let response;
    try {
        response = await got(listUrl, {
            headers,
        });
    } catch (error) {
        if (error instanceof FetchError && error.statusCode === 401) {
            // 401 说明 token 过期了，将它删掉
            await cache.set('initium:token', '');
        }
        throw error;
    }

    const name = response.data.name || (response.data[model] && response.data[model].name) || '追踪';
    // 从v1直升的channel和tags里面是digests，v2新增的author和follow出来都是results
    const articles = response.data.results ?? response.data.digests;
    // 如果model=author，那就是avatar；否则都是cover，要么就没封面
    const image = response.data[model] && (response.data[model].cover || response.data[model].avatar);

    const getFullText = (slug) =>
        cache.tryGet(`theinitium:${slug}:${language}`, async () => {
            let content = '';
            const { data } = await got(`https://api.theinitium.com/api/v2/article/detail/?language=${language}&slug=${slug}`, {
                headers,
            });

            if (data.lead.length) {
                content += '<p>「' + data.lead + '」</p>';
            }
            if (data.byline.length) {
                content += '<p>' + data.byline + '</p>';
            }
            if (data.content) {
                content += data.content.replace('<figure class="advertisement"/><br/>', '').replaceAll(/(?:<br>){2}-{11}<br>.*$/g, '');
            } else if (data.type === 'html') {
                // 有时候编辑部会漏录入文章信息…………扶额。所以加这一个判断，如果确实是普通html文章，但又没有内容，说明是漏了，后面还要给guid手动加个标记，以便阅读器事后重抓。
                content += '内容为空，请稍后再来';
            } else if (data.type === 'web') {
                // 有时候文章并非普通html文章，而是带有互动内容等，表现为type为web，并且content里没有内容。我们也尽力抓点东西下来。
                // 或许可能还有其他未知情况，等碰到了再说吧。先这样留空也不碍事。
                const nonhtmlcontent = await got(data.web.url);
                const webcontent = load(nonhtmlcontent.body).html();
                content += webcontent;
            }
            if (data.paywall_enabled) {
                const google_bot_ua =
                    'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.92 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
                const accept_language = language + ';q=0.9';
                const pay_part = await got(`https://theinitium.com/article/${slug}/`, {
                    headers: {
                        'user-agent': google_bot_ua,
                        'accept-language': accept_language,
                    },
                });
                const $ = load(pay_part.body);
                const pay_content = $('div.paywall').html();
                if (pay_content) {
                    content += pay_content.replace('<meta itemprop="isAccessibleForFree" content="false">', '');
                }
            }
            return content;
        });

    const items = await Promise.all(
        articles
            .filter((a) => a.article)
            .slice(0, token === TOKEN ? 25 : articles.length)
            .map(async (item) => {
                item.article.date = parseDate(item.article.date);
                item.article.updated = parseDate(item.article.updated);
                const description = await getFullText(item.article.slug);
                return {
                    title: item.article.headline,
                    author: item.article.authors.length > 0 ? item.article.authors.map((x) => x.name).toString() : item.article.byline,
                    category: item.article.channels.filter((x) => !x.homepage).map((x) => x.name),
                    description,
                    link: new URL(item.article.url, 'https://theinitium.com').href,
                    pubDate: item.article.date,
                    updated: item.article.updated,
                    // 如果遇到编辑部漏录入情况，则给uuid做个手脚，以便阅读器到时重抓。
                    guid: description.endsWith('内容为空，请稍后再来') ? item.article.uuid + '-I-am-empty' : item.article.uuid,
                };
            })
    );

    return {
        title: `端传媒 - ${name}`,
        link: listLink,
        icon: 'https://theinitium.com/misc/about/logo192.png',
        item: items,
        image,
    };
};
