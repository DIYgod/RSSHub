const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'news';
    const language = ctx.params.language ?? 'en';

    const categories = {
        news: {
            title: 'News',
            titleCn: '资讯',
            link: `api/bulletin/findBlogsPage?lan=${language}&size=500`,
        },
        latest: {
            title: 'Latest',
            titleCn: '快讯',
            link: `api/bulletin/findNewsPages?lan=${language}&size=500`,
        },
        report: {
            title: 'Report',
            titleCn: '报告',
            link: 'api/v2/report/selectReportPageList',
        },
    };

    const rootUrl = 'https://tokeninsight.com';
    const currentUrl = `${rootUrl}/${categories[category].link}`;

    const response =
        category === 'report'
            ? await got({
                  method: 'post',
                  url: currentUrl,
                  form: {
                      languages: language,
                      markId: '',
                      pageSize: 500,
                  },
              })
            : await got({
                  method: 'get',
                  url: currentUrl,
              });

    const list = response.data.data.list.slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 50).map((item) => ({
        title: item.title,
        pubDate: parseDate(item.publishTime ?? item.updateDate),
        link: item.url ?? `${rootUrl}${language === 'cn' ? '/zh' : ''}/${category === 'news' ? 'blogs' : category}/${item.id}`,
        description: item.description ? `<img src="${item.coverImgBig ?? item.coverImg}"><p>${item.description}</p>` : `<p>${language === 'cn' ? item.content : item.contentEn}</p>`,
        category: item.tagList?.map((tag) => tag[`mark_${language}`]),
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                if (category !== 'latest' && /\d+$/.test(item.link)) {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = cheerio.load(detailResponse.data);

                    item.author = content('.author_info').text();
                    item.description = content('.detail_html_box').html();
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${language === 'en' ? categories[category].title : categories[category].titleCn} - TokenInsight`,
        link: currentUrl,
        item: items,
    };
};
