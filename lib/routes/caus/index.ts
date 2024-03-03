// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';

const categories = {
    0: {
        title: '全部',
        link: 'home?id=0',
    },
    1: {
        title: '要闻',
        link: 'focus_news?id=1',
    },
    2: {
        title: '商业',
        link: 'business?id=2',
    },
    3: {
        title: '快讯',
        link: 'hours?id=3',
    },
    8: {
        title: '财富',
        link: 'fortune?id=8',
    },
    6: {
        title: '生活',
        link: 'life?id=6',
    },
};

export default async (ctx) => {
    const category = ctx.req.param('category') || '0';

    const isHome = category === '0';

    const rootUrl = 'https://www.caus.com';
    const apiRootUrl = 'https://api.caus.money';

    const currentUrl = `${rootUrl}/${categories[category].link}`;
    const searchUrl = `${apiRootUrl}/toronto/display/searchList`;
    const listUrl = `${apiRootUrl}/toronto/display/lanmuArticlelistNew`;

    const response = await got({
        method: 'post',
        url: isHome ? searchUrl : listUrl,
        json: isHome
            ? {
                  pageQ: {
                      pageSize: 10,
                      sortFiled: 'id',
                      sortType: 'DESC',
                  },
                  types: ['ARTICLE', 'VIDEO'],
              }
            : {
                  filterIds: [],
                  lanmuId: Number.parseInt(category),
              },
    });

    const list = (isHome ? response.data.data : response.data.data.articleList).map((item) => ({
        title: item.title,
        link: `${rootUrl}/detail/${item.contentId}`,
        contentId: item.contentId,
        pubDate: new Date(item.createTime),
        category: [...new Set([...item.lanmus.map((lanmu) => lanmu.name), ...item.tags.map((tag) => tag.name)])],
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: `${apiRootUrl}/toronto/display/contentWithRelate?contentId=${item.contentId}`,
                });

                item.description = detailResponse.data.data.content.content;

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `${categories[category].title} - 加美财经`,
        link: currentUrl,
        item: items,
    });
};
