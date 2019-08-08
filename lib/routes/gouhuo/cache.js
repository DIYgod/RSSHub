const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = {
    _getProfile: async (ctx) => {
        const key = 'gouhuo-profile';
        let profile = await ctx.cache.get(key);
        if (!profile) {
            const response = await got({
                method: 'get',
                url: `https://gouhuo.qq.com/`,
                headers: {
                    Referer: `https://gouhuo.qq.com/`,
                },
            });
            const body = response.data;
            const $ = cheerio.load(body);

            // eslint-disable-next-line no-eval
            const obj = eval(body.match(/(?<=<script>\s*window\.__NUXT__=)[\s\S]*?(?=<\/script>)/g)[0]);
            const tabNameMapping = {};
            for (const item of obj.data[0].tabList) {
                tabNameMapping[item.tab_id] = item.tab_name;
            }
            const title = $('title')
                .text()
                .split('-')[0]
                .trim();
            const description = $('title')
                .text()
                .split('-')[1]
                .trim();

            profile = JSON.stringify({
                title: title,
                description: description,
                tabNameMapping: tabNameMapping,
            });

            ctx.cache.set(key, profile);
        }
        return JSON.parse(profile);
    },
    getTabName: async (self, ctx, tabId) => {
        const mapping = (await self._getProfile(ctx)).tabNameMapping;
        return mapping[tabId];
    },
    getTitle: async (self, ctx) => (await self._getProfile(ctx)).title,
    getDescription: async (self, ctx) => (await self._getProfile(ctx)).description,
};
