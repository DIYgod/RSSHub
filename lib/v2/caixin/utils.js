const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const config = require('@/config').value;

const parseAppDate = async (item, ctx) => {
    const link_group = item.link.match(/(\d+).html/);
    if (link_group) {
        try {
            const article_id = link_group[1];
            const uid = await ctx.cache.get('caixin:uid');
            const code = await ctx.cache.get('caixin:code');
            let app_data = await got('https://api.crawlbase.com/?token=0_O-OyFBP3xEJ8P9RY4XLA&url=' + encodeURIComponent(`https://gateway.caixin.com/api/app-api/auth/validate?uid=${uid}&code=${code}&unit=1&articleId=${article_id}&deviceType=5`));
            app_data = JSON.parse(app_data.body);
            item.pay = app_data?.data?.info?.errorCode === 0;
            item.title = app_data.data.articleProperties.share.title;
            let content = "";
            let summary = app_data.data.articleProperties.share.summary;
            summary = summary.replace(/【.*】/g, "").replace(/http.*/g, "");
            content += `<p>${summary}</p>`;
            if (app_data.data.articleProperties.picture) {
                content += `<img src="${app_data.data.articleProperties.picture.url || app_data.data.articleProperties.picture.defaultPicture}" style="max-width: 100%;"/>`;
                content += `<p>${app_data.data.articleProperties.picture.summary}</p>`;
            }
            content += app_data.data.articleProperties.content;
            content = content.replace(/\n/g, '');
            item.description = content;
            if (app_data.data.articleProperties.audio) {
                item.itunes_item_image = app_data.data.articleProperties.audio.audioImageUrl;
                item.enclosure_url = app_data.data.articleProperties.audio.manAudioUrl;
                item.enclosure_type = 'audio/mpeg';
            }
        } catch (error) {
            // do nothing
        }
    }
}

const parseArticle = (item, ctx) => {
    if (new URL(item.link).hostname.match(/\.blog\.caixin\.com$/)) {
        return parseBlogArticle(item, ctx.cache.tryGet);
    } else {
        return ctx.cache.tryGet(item.link, async () => {
            if (config.caixin.login_url) {
                let item_pay = await ctx.cache.get(item.link + "#pay");
                if (item_pay) {
                    item = item_pay;
                } else {
                    await parseAppDate(item, ctx);
                    if (item.pay) await ctx.cache.set(item.link + "#pay", item, 604800);
                }
            }

            if (!item.description) {
                try {
                    const { data: response } = await got(item.link);

                    const $ = cheerio.load(response);

                    item.description = art(path.join(__dirname, 'templates/article.art'), {
                        item,
                        $,
                    });

                    if (item.audio) {
                        item.itunes_item_image = item.audio_image_url;
                        item.enclosure_url = item.audio;
                        item.enclosure_type = 'audio/mpeg';
                    }
                } catch (error) {
                    // do nothing
                }

            }

            return item;
        });
    }
};

const caixinLogin = async (ctx) => {
    if (!config.caixin.login_url) return;
    const uid = await ctx.cache.get('caixin:uid');
    const code = await ctx.cache.get('caixin:code');
    let app_data = undefined;
    if (uid && code) {
        app_data = await got('https://api.crawlbase.com/?token=0_O-OyFBP3xEJ8P9RY4XLA&url=' + encodeURIComponent(`https://gateway.caixin.com/api/app-api/auth/validate?uid=${uid}&code=${code}&unit=1&articleId=102031706&deviceType=5`));
        app_data = JSON.parse(app_data.body);
    }
    if (!app_data || app_data?.data?.info?.errorCode != 0) {
        const login_data = await got('https://api.crawlbase.com/?token=0_O-OyFBP3xEJ8P9RY4XLA&url=' + encodeURIComponent(config.caixin.login_url));
        await ctx.cache.set('caixin:uid', login_data?.data?.data?.uid);
        await ctx.cache.set('caixin:code', login_data?.data?.data?.code);
        console.log("caixin login", login_data.data);
    }
}

const parseBlogArticle = (item, tryGet) =>
    tryGet(item.link, async () => {
        const response = await got(item.link);
        const $ = cheerio.load(response.data);
        const article = $('#the_content').removeAttr('style');
        article.find('img').removeAttr('style');
        article
            .find('p')
            // Non-breaking space U+00A0, `&nbsp;` in html
            // element.children[0].data === $(element, article).text()
            .filter((_, element) => element.children[0].data === String.fromCharCode(160))
            .remove();

        item.description = article.html();

        return item;
    });

module.exports = {
    parseAppDate,
    parseArticle,
    parseBlogArticle,
    caixinLogin
};
