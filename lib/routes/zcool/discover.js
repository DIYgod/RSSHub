const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');
const locations = require('./locations');

module.exports = async (ctx) => {
    let cate = ctx.params.cate || '0';
    let subCate = ctx.params.subCate || '0';

    const queryMatch = cate.match(/cate=(\d+)&subCate=(\d+)/);

    if (queryMatch !== null && queryMatch.length === 3) {
        cate = queryMatch[1];
        subCate = queryMatch[2];
    }

    const hasVideo = ctx.params.hasVideo || '0';
    const city = ctx.params.city || '';
    const college = ctx.params.college || '0';
    const recommendLevel = ctx.params.recommendLevel || '1';
    const sort = ctx.params.sort || '0';

    const rootUrl = `https://www.zcool.com.cn`;
    const cateUrl = `${rootUrl}/common/category?cate=${cate}`;
    const currentUrl = `${rootUrl}/discover?cate=${cate}&subCate=${subCate}`;
    const apiUrl = `${rootUrl}/discover.json?cate=${cate}&subCate=${subCate}&hasVideo=${hasVideo}&city=${city === '' ? '0' : locations[city].toString()}&college=${college}&recommendLevel=${recommendLevel}&sort=${sort}&limit=20`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const list = response.data.data.data.map((item) => ({
        title: item.object.title,
        link: item.object.pageUrl,
        pubDate: date(item.object.publishTime),
        author: item.object.creatorObj.username,
    }));

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    item.description = '';

                    content('.video-content-wrap').remove();

                    const videoMatch = detailResponse.data.match(/source: '(https:\/\/video.zcool.cn\/.*\.mp4\?auth_key=.*)',/g);

                    for (const video of videoMatch) {
                        item.description += `<video src="${video.split("'")[1]}" controls="controls"></video>`;
                    }

                    item.description += content('.work-center-con').html();

                    return item;
                })
        )
    );

    const cateResponse = await got({
        method: 'get',
        url: cateUrl,
    });

    const subCateName =
        subCate === '0'
            ? '全部'
            : cateResponse.data.data.subCateList.filter(function () {
                  return this.id === subCate;
              })[0].name;

    ctx.state.data = {
        title: `发现 - ${cateResponse.data.data.name}${subCate === '0' ? '' : ` - ${subCateName}`} - 站酷（ZCOOL）`,
        link: currentUrl,
        item: items,
    };
};
