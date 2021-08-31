const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const subsiteDic = require('./subsite.js');
const wengine_vpn_ticket = require('@/config').value.universities_dut.wengine_vpn_ticket;
module.exports = async (ctx) => {
    const subsiteMap = subsiteDic[ctx.params.subsite];
    const typeMap = subsiteMap.typeMap[ctx.params.type];
    const frontUrl = typeMap.url;
    const basePath = typeMap.basePath;
    // Use webvpn if needed. Can be found in cookies after login webvpn system.
    const headers = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:83.0) Gecko/20100101 Firefox/83.0',
        Cookie: 'wengine_vpn_ticket=' + wengine_vpn_ticket + '; show_vpn=0; refresh=1',
    };
    const response = await got({
        method: 'get',
        url: frontUrl,
        headers: headers,
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
                        headers: headers,
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
