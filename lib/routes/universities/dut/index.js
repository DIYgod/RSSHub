const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const subsiteDic = require('./subsite.js');
const webvpnLogin = require('./webvpn');
const parameters = require('@/config').value.universities_dut;
module.exports = async (ctx) => {
    let cookieJar;
    const subsiteMap = subsiteDic[ctx.params.subsite];
    const typeMap = subsiteMap.typeMap[ctx.params.type];
    const frontUrl = typeMap.url;
    const basePath = typeMap.basePath;
    // Use webvpn if needed.
    if (frontUrl.split('//')[1].split('.')[0] === 'webvpn') {
        if (parameters.username !== undefined && parameters.passwd !== undefined) {
            cookieJar = await webvpnLogin(parameters.username, parameters.passwd);
        }
    }
    const response = await got({
        method: 'get',
        url: frontUrl,
        cookieJar,
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $(subsiteMap.listSelector)
        .map((index, item) => {
            item = $(item);
            return {
                title: subsiteMap.titleMethod(item),
                // description,
                link: subsiteMap.linkMethod(item),
                pubDate: timezone(parseDate(subsiteMap.pubDateMethod(item)), +8),
            };
        })
        .get();

    const entries = await Promise.all(
        list.map(async (item) => {
            const { title, link, pubDate } = item;
            const entryUrl = link;

            const cache = await ctx.cache.tryGet(entryUrl, async () => {
                let description;
                try {
                    const response = await got({
                        method: 'get',
                        url: entryUrl,
                        prefixUrl: basePath,
                        cookieJar,
                    });
                    const $ = cheerio.load(response.data);
                    description = subsiteMap.descriptionMethod($);
                } catch (error) {
                    description = 'page broken!';
                }
                const entry = {
                    title,
                    link,
                    pubDate,
                    description,
                };
                return JSON.stringify(entry);
            });
            return Promise.resolve(JSON.parse(cache));
        })
    );

    ctx.state.data = {
        title: typeMap.title,
        link: frontUrl,
        item: entries,
    };
};
