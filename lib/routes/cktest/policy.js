const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = '1005';

    const rootUrl = `http://mall.ckcest.cn/mall/listContent.ilf?dbId=${id}&text=&express=&secondSearchExpress=&order=3&page=1&limit=10`;
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const list = response.data.results.datas.map((item) => ({
        link: item.detail_url,
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                const dateArray = content('meta[name="firstpublishedtime"]').attr('content').split('-');
                const time = dateArray.pop();

                item.pubDate = `${dateArray.join('-')} ${time}`;
                item.title = content('title').text().split('_')[0];
                item.description = content('.wrap').html() || content('.policyLibraryOverview_content').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '产业政策 - 中国工程科技知识中心',
        link: rootUrl,
        item: items,
    };
};
