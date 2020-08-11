const got = require('@/utils/got');
const config = require('@/config').value;
const cheerio = require('cheerio');
const resolve_url = require('url').resolve;

module.exports = async (ctx) => {
    const type = ctx.params.type || 'feature';
    const language = ctx.params.language || 'zh-hans';

    const key = {
        email: config.initium.username,
        password: config.initium.password,
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
            url: `https://api.theinitium.com/api/v1/auth/login/?language=${language}`,
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

    const response = await got({
        method: 'get',
        url: `https://api.theinitium.com/api/v1/channel/articles/?language=${language}&slug=${type}`,
        headers: {
            'X-Client-Name': 'Web',
            Accept: '*/*',
            Connection: 'keep-alive',
            Authorization: token,
            Origin: `https://theinitium.com/`,
            Referer: `https://theinitium.com/`,
        },
    });

    const name = response.data.name;
    const articles = response.data.digests;

    const getFullText = async (slug) => {
        let content = await ctx.cache.get(slug + language);
        if (content) {
            return content;
        }

        content = '';

        const response = await got({
            method: 'get',
            url: `https://api.theinitium.com/api/v1/article/detail/?language=${language}&slug=${slug}`,
            headers: {
                'X-Client-Name': 'web',
                Accept: '*/*',
                Connection: 'keep-alive',
                Authorization: token,
                Origin: `https://theinitium.com/`,
                Referer: `https://theinitium.com/`,
            },
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
        articles.slice(0, 10).map(async (item) => ({
            title: item.article.headline,
            description: await getFullText(item.article.slug),
            link: resolve_url('https://theinitium.com', item.article.url),
            pubDate: item.article.date,
        }))
    );

    ctx.state.data = {
        title: `端传媒 - ${name}`,
        link: `https://theinitium.com`,
        item: items,
    };
};
