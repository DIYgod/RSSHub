const got = require('@/utils/got');
const path = require('path');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');

module.exports = async (ctx) => {
    const { lang } = ctx.params;
    const siteLink = 'https://bgmlist.com/api/v1/bangumi/site';
    const sites = await ctx.cache.tryGet(siteLink, async () => (await got(siteLink)).data);
    const { data } = await got('https://bgmlist.com/api/v1/bangumi/onair');

    ctx.state.data = {
        title: '番组放送 开播提醒',
        link: 'https://bgmlist.com/',
        item: data.items.map((item) => {
            item.sites.push({ site: 'dmhy', id: item.titleTranslate['zh-Hans']?.[0] ?? item.title });
            return {
                title: item.titleTranslate[lang]?.[0] ?? item.title,
                link: item.officialSite,
                description: art(
                    path.join(__dirname, 'templates/description.art'),
                    item.sites.map((site) => ({
                        title: sites[site.site].title,
                        url: sites[site.site].urlTemplate.replaceAll('{{id}}', site.id),
                        begin: site.begin,
                    }))
                ),
                pubDate: parseDate(item.begin),
                guid: item.id,
            };
        }),
    };
};
