const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const categories = {
    社会: '0003',
    娱乐: '0002',
    国际: '0011',
    军事: '0005',
    养生: '0019',
    汽车: '0012',
    体育: '0006',
    财经: '0004',
    游戏: '0007',
    科技: '0008',
    国内: '0010',
    宠物: '0028',
    情感: '0024',
    人文: '0018',
    教育: '0013',
};

module.exports = async (ctx) => {
    const category = ctx.params.category || '推荐';

    const rootUrl = 'https://mini.eastday.com';
    const currentUrl = `${rootUrl}/ns/api/index/${category === '推荐' ? 'trust/trust' : `typenews/${categories[category]}-1`}.json`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const responseNext =
        category === '推荐'
            ? undefined
            : await got({
                  method: 'get',
                  url: currentUrl.replace(/-1\.json/, '-2.json'),
              });

    const list = JSON.parse(response.data.match(/\((.*)\)/)[1] + (responseNext === undefined ? '' : responseNext.data.match(/\((.*)\)/)[1]))
        .slice(0, 30)
        .map((item) => ({
            title: item.topic,
            link: `${rootUrl}${item.url}`,
            pubDate: timezone(parseDate(item.show_date), +8),
        }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                const pageNumber = parseInt(detailResponse.data.match(/var page_num = '(\d+)'/)[1]);

                item.description = content('#J-contain_detail_cnt').html();

                if (pageNumber > 1) {
                    const links = [];

                    for (let i = 2; i <= pageNumber; i++) {
                        links.push(item.link.replace(/\.html/, `-${i}.html`));
                    }

                    links.forEach(
                        async (link) =>
                            await ctx.cache.tryGet(link, async () => {
                                const pageResponse = await got({
                                    method: 'get',
                                    url: link,
                                });
                                const subContent = cheerio.load(pageResponse.data);

                                subContent('img').each(function () {
                                    subContent(this).attr('src', subContent(this).attr('data-url'));
                                });

                                item.description += subContent('#J-contain_detail_cnt').html();
                            })
                    );
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${category} - 东方资讯`,
        link: rootUrl,
        item: items,
    };
};
