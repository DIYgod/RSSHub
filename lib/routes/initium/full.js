const got = require('@/utils/got');
const config = require('@/config').value;
const cheerio = require('cheerio');
const resolve_url = require('url').resolve;

module.exports = async (ctx) => {
    // model是channel/tag/etc.，而type是latest/feature/quest-academy这些一级栏目/标签/作者名的slug名。如果是追踪的话，那就是model是follow，type是articles。
    const model = ctx.params.model || 'channel';
    const type = ctx.params.type || 'latest';
    const language = ctx.params.language || 'zh-hans';
    let listurl;
    let listlink;
    switch (model) {
        case 'author':
            listurl = `https://api.theinitium.com/api/v2/author/?language=${language}&slug=${type}`;
            listlink = `https://theinitium.com/author/${type}/`;
            break;
        case 'follow':
            listurl = `https://api.theinitium.com/api/v2/user/follows/${type}/?language=${language}`;
            listlink = `https://theinitium.com/follow/`;
            break;
        case 'channel':
            listurl = `https://api.theinitium.com/api/v2/channel/articles/?language=${language}&slug=${type}`;
            listlink = `https://theinitium.com/channel/${type}/`;
            break;
        case 'tags':
            listurl = `https://api.theinitium.com/api/v2/tag/articles/?language=${language}&slug=${type}`;
            listlink = `https://theinitium.com/tags/${type}/`;
            break;
    }

    const key = {
        email: config.initium.username,
        password: config.initium.password,
        iapReceipt: config.initium.iap_receipt,
    };
    const body = JSON.stringify(key);

    let token;
    const cache = await ctx.cache.get('INITIUM_TOKEN');
    if (cache) {
        token = cache;
    } else if (config.initium.bearertoken) {
        token = config.initium.bearertoken;
        ctx.cache.set('INITIUM_TOKEN', config.initium.bearertoken);
    } else if (key.email === undefined) {
        token = 'Basic YW5vbnltb3VzOkdpQ2VMRWp4bnFCY1ZwbnA2Y0xzVXZKaWV2dlJRY0FYTHY=';
    } else {
        const login = await got({
            method: 'post',
            url: `https://api.theinitium.com/api/v2/auth/login/?language=${language}`,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Connection: 'keep-alive',
                Authorization: 'Basic YW5vbnltb3VzOkdpQ2VMRWp4bnFCY1ZwbnA2Y0xzVXZKaWV2dlJRY0FYTHY=',
                Origin: `https://theinitium.com/`,
                Referer: `https://theinitium.com/`,
                'X-Client-Name': 'Web',
            },
            body: body,
        });

        /*
        const devices = login.data.access.devices;

        for (const key in devices) {
            const device = devices[key];
            if (device.status === 'logged_in' && !device.logout_at && device.platform === 'web') {
                token = 'Bearer ' + device.device_id;
                break;
            }
        }
        */
        token = 'Bearer ' + login.data.token;
        ctx.cache.set('INITIUM_TOKEN', token);
    }

    const headers = {
        Accept: '*/*',
        Connection: 'keep-alive',
        Authorization: token,
        'X-IAP-Receipt': key.iapReceipt || '',
    };

    const response = await got({
        method: 'get',
        url: listurl,
        headers: headers,
    });

    const name = response.data.name || (response.data[model] && response.data[model].name) || '追踪';
    // 从v1直升的channel和tags里面是digests，v2新增的author和follow出来都是results
    const articles = response.data.results ? response.data.results : response.data.digests;
    // 如果model=author，那就是avatar；否则都是cover，要么就没封面
    const image = response.data[model] && (response.data[model].cover || response.data[model].avatar);

    function fixDate(date) {
        // The date is mistakenly declared as UTC, but actually it's UTC+08:00
        return date.replace(/Z$/, '+08:00');
    }

    const getFullText = async (slug) => {
        let content = await ctx.cache.get(slug + language);
        if (content) {
            return content;
        }

        content = '';

        const response = await got({
            method: 'get',
            url: `https://api.theinitium.com/api/v2/article/detail/?language=${language}&slug=${slug}`,
            headers: headers,
        });

        const data = response.data;

        if (data.lead.length) {
            content += '<p>「' + data.lead + '」</p>';
        }
        if (data.byline.length) {
            content += '<p>' + data.byline + '</p>';
        }
        if (data.content) {
            content += data.content.replace('<figure class="advertisement"/><br/>', '').replace(/<br><br>-----------<br>.*$/g, '');
        } else if (data.type === 'html') {
            // 有时候编辑部会漏录入文章信息…………扶额。所以加这一个判断，如果确实是普通html文章，但又没有内容，说明是漏了，后面还要给guid手动加个标记，以便阅读器事后重抓。
            content += '内容为空，请稍后再来';
        } else if (data.type === 'web') {
            // 有时候文章并非普通html文章，而是带有互动内容等，表现为type为web，并且content里没有内容。我们也尽力抓点东西下来。
            // 或许可能还有其他未知情况，等碰到了再说吧。先这样留空也不碍事。
            const nonhtmlcontent = await got({
                method: 'get',
                url: data.web.url,
            });
            const webcontent = cheerio.load(nonhtmlcontent.body).html();
            content += webcontent;
        }
        if (data.paywall_enabled) {
            const google_bot_ua =
                'Mozilla / 5.0(Linux; Android 6.0.1; Nexus 5X Build / MMB29P) AppleWebKit / 537.36(KHTML, like Gecko) Chrome / 80.0.3987.92 Mobile Safari / 537.36(compatible; Googlebot / 2.1; +http://www.google.com/bot.html)';
            const accept_language = language + ';q=0.9';
            const pay_part = await got({
                method: 'get',
                url: `https://theinitium.com/article/${slug}`,
                headers: {
                    'user-agent': google_bot_ua,
                    'accept-language': accept_language,
                },
            });
            const $ = cheerio.load(pay_part.body);
            const pay_content = $('div.paywall').html();
            if (pay_content) {
                content += pay_content.replace('<meta itemprop="isAccessibleForFree" content="false">', '');
            }
        }

        ctx.cache.set(slug + language, content);

        return content;
    };

    const items = await Promise.all(
        articles
            .filter((a) => a.article)
            .slice(0, token === 'Basic YW5vbnltb3VzOkdpQ2VMRWp4bnFCY1ZwbnA2Y0xzVXZKaWV2dlJRY0FYTHY=' && key.iapReceipt === undefined ? 10 : articles.length)
            .map(async (item) => {
                const description = await getFullText(item.article.slug);
                return {
                    title: item.article.headline,
                    author: item.article.authors.length > 0 ? item.article.authors.map((x) => x.name).toString() : item.article.byline,
                    category: item.article.channels.filter((x) => !x.homepage).map((x) => x.name),
                    description,
                    link: resolve_url('https://theinitium.com', item.article.url),
                    pubDate: new Date(fixDate(item.article.date)),
                    updated: new Date(fixDate(item.article.updated)),
                    // 如果遇到编辑部漏录入情况，则给uuid做个手脚，以便阅读器到时重抓。
                    guid: description.endsWith('内容为空，请稍后再来') ? item.article.uuid + '-I-am-empty' : item.article.uuid,
                };
            })
    );

    ctx.state.data = {
        title: `端传媒 - ${name}`,
        link: listlink,
        item: items,
        image: image,
    };
};
