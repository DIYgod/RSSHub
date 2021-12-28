const got = require('@/utils/got');
const cheerio = require('cheerio');
const dayjs = require('dayjs');

module.exports = async (ctx) => {
    const user = ctx.params.user || '';
    const type = ctx.params.type || 'projects';

    const response = await got({
        method: 'get',
        url: `https://www.behance.net/${user}/${type}`, // 接口只获取12个项目
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
    });
    const data = response.data;
    const list = data.profile.activeSection.work.projects;
    const articledata = await Promise.all(
        list.map(async (item) => {
            if (type !== 'projects') {
                item = item.project;
            }
            const url = `${item.url}?ilo0=1`;
            const cache = await ctx.cache.get(url);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const response2 = await got({
                method: 'get',
                url,
            });
            const articleHtml = response2.data;
            const $2 = cheerio.load(articleHtml);

            const content = $2('div.project-styles').html();
            const single = {
                content,
            };
            ctx.cache.set(url, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: `${data.profile.owner.first_name} ${data.profile.owner.last_name}'s Work`,
        link: data.profile.owner.url,
        item: list.map((item, index) => {
            if (type !== 'projects') {
                item = item.project;
            }
            return {
                title: item.name,
                description: articledata[index].content,
                link: item.url,
                pubDate: dayjs.unix(item.published_on).format(),
            };
        }),
    };
};
