const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const categories = {
    latest: {
        main: {
            id: 10,
            slug: 10,
            title: '最新',
        },
        'zh-tw': {
            id: 395,
            slug: 395,
            title: '最新',
        },
    },
    news: {
        main: {
            id: 11,
            slug: 11,
            title: '新闻',
        },
        'zh-tw': {
            id: 396,
            slug: 396,
            title: '資訊',
        },
    },
    notice: {
        main: {
            id: 12,
            slug: 12,
            title: '公告',
        },
        'zh-tw': {
            id: 397,
            slug: 397,
            title: '公告',
        },
    },
    activity: {
        main: {
            id: 258,
            slug: 258,
            title: '活动',
        },
        'zh-tw': {
            id: 398,
            slug: 398,
            title: '活動',
        },
    },
};

const rootUrls = {
    main: 'https://ys.mihoyo.com',
    'zh-tw': 'https://genshin.hoyoverse.com',
};

const apiRootUrls = {
    main: 'https://content-static.mihoyo.com',
    'zh-tw': 'https://api-os-takumi-static.hoyoverse.com',
};

const currentUrls = {
    main: '/main/news',
    'zh-tw': '/zh-tw/news',
};

const apiUrls = {
    main: '/content/ysCn/getContentList',
    'zh-tw': '/content_v2_user/app/a1b1f9d3315447cc/getContentList',
};

module.exports = async (ctx) => {
    const location = ctx.params.location ?? 'main';
    const category = ctx.params.category ?? 'latest';
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 50;

    const params = {
        main: `pageNum=1&channelId=${categories[category][location].id}&pageSize=${limit}`,
        'zh-tw': `iPage=1&sLangKey=zh-tw&iChanId=${categories[category][location].id}&iPageSize=${limit}`,
    };

    const rootUrl = rootUrls[location];
    const apiRootUrl = apiRootUrls[location];
    const apiUrl = `${apiRootUrl}${apiUrls[location]}?${params[location]}`;
    const currentUrl = `${rootUrl}${currentUrls[location]}/${categories[category][location].slug}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const data = response.data.data.list;

    let banner = '';

    let items =
        location === 'main'
            ? data.map((item) => {
                  banner = item.ext.filter((e) => e.arrtName === 'banner');

                  return {
                      author: item.author,
                      title: item.title.trim(),
                      pubDate: timezone(parseDate(item.start_time), +8),
                      link: `${rootUrl}/main/news/detail/${item.contentId}`,
                      image: banner.value ? banner.value[0].url : undefined,
                  };
              })
            : data.map((item) => {
                  banner = item.sExt ? JSON.parse(item.sExt).banner : undefined;

                  return {
                      author: item.sAuthor,
                      title: item.sTitle.split('｜')[0],
                      pubDate: timezone(parseDate(item.dtCreateTime), +8),
                      link: `${rootUrl}/zh-tw/news/detail/${item.contentId}`,
                      description: art(path.join(__dirname, '../templates/ys.art'), {
                          image: banner ? banner[0].url : undefined,
                          description: item.sContent,
                      }),
                  };
              });

    if (location === 'main') {
        items = await Promise.all(
            items.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    try {
                        item.description = art(path.join(__dirname, '../templates/ys.art'), {
                            image: item.image,
                            description: JSON.parse(detailResponse.data.match(/,content:(".*?"),ext:/)[1].trim()),
                        });
                    } catch (e) {
                        // no-empty
                    }

                    delete item.image;

                    return item;
                })
            )
        );
    }

    ctx.state.data = {
        title: `原神 - ${categories[category][location].title}`,
        link: currentUrl,
        item: items,
    };
};
