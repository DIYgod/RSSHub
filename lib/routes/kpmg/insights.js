const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'https://home.kpmg/cn/zh/home/insights.html';

    const response = await got({
        method: 'post',
        url: `https://home.kpmg/esearch/cn-zh`,
        headers: {
            Referer: link,
        },
        json: {
            query: '',
            filters: {
                all: [
                    {
                        kpmg_tab_type: ['Insights'],
                    },
                ],
            },
            result_fields: {
                kpmg_title: {
                    raw: {},
                },
                kpmg_article_date_time: {
                    raw: {},
                },
                kpmg_url: {
                    raw: {},
                },
            },
            page: {
                size: 20,
                current: 1,
            },
            sort: {
                kpmg_filter_date: 'desc',
            },
        },
    });

    const list = response.data.results.map((item) => ({
        title: item.kpmg_title.raw,
        link: item.kpmg_url.raw,
        pubDate: item.kpmg_article_date_time.raw,
    }));

    const item = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got.get(item.link);
                const $ = cheerio.load(response.data);

                if ($('a.component-link')) {
                    const link = $('a.component-link').attr('href');
                    const size = $('a.component-link .downloadSize').text();
                    $('a.component-link').replaceWith(
                        `<p>
                                <img src="https://home.kpmg/etc/designs/kpmgpublic/images/pdf-icon-lg.png" />
                                <a href='${link}'>点击下载 PDF ${size}</a>
                            </p>`
                    );
                }

                item.description = $('.module-touch-columncontrol').html() || $('.display-full-width').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '毕马威洞察',
        link,
        description: '欢迎浏览毕马威中国网站的知识库。在这里，你可以找到毕马威中国各类定期出版的通讯及各通讯过往的期号。',
        item,
    };
};
