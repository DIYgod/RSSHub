const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const user = ctx.params.user ?? '';
    const type = ctx.params.type ?? 'projects';

    const response = await got({
        method: 'get',
        url: `https://www.behance.net/${user}/${type}`, // 接口只获取12个项目
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
    });
    const data = response.data;
    let list;
    if (type === 'projects') {
        list = data.profile.activeSection.work.projects.slice(0, 12);
    }
    if (type === 'appreciated') {
        list = data.profile.activeSection.appreciations.appreciations.slice(0, 12);
    }
    const articledata = await Promise.all(
        list.map(async (item) => {
            if (type === 'appreciated') {
                item = item.project;
            }
            const url = `${item.url}?ilo0=1`;
            const description = await ctx.cache.tryGet(url, async () => {
                const response2 = await got({
                    method: 'get',
                    url,
                });
                const articleHtml = response2.data;
                const $2 = cheerio.load(articleHtml);
                $2('.ImageElement-root-kir').remove();
                $2('.embed-dimensions').remove();
                $2('script.js-lightbox-slide-content').each((_, elem) => {
                    elem = $2(elem);
                    elem.replaceWith(elem.html());
                });
                const content = $2('div.project-styles').html();
                const single = {
                    content,
                };
                return single;
            });
            return description;
        })
    );
    ctx.state.data = {
        title: `${data.profile.owner.first_name} ${data.profile.owner.last_name}'s ${type}`,
        link: data.profile.owner.url,
        item: list.map((item, index) => {
            if (type === 'appreciated') {
                item = item.project;
            }
            return {
                title: item.name,
                description: articledata[index].content,
                link: item.url,
                pubDate: parseDate(item.published_on * 1000),
            };
        }),
    };
};
