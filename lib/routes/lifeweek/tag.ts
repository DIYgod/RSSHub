// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
const getRssItem = require('./utils');
const rootApiUrl = 'https://www.lifeweek.com.cn/api/userWebFollow/getFollowTagContentList?type=4&sort=2&tagId';
const rootUrl = 'https://www.lifeweek.com.cn/articleList';
const articleRootUrl = 'https://www.lifeweek.com.cn/article';

export default async (ctx) => {
    const tag = ctx.req.param('id');
    const url = `${rootApiUrl}=${tag}`;
    const { data } = await got(url);
    const result = data.model.articleResponseList;
    const items = await Promise.all(
        result.map((item) => {
            const articleLink = `${articleRootUrl}/${item.id}`;
            return cache.tryGet(articleLink, () => getRssItem(item, articleLink));
        })
    );

    ctx.set('data', {
        title: data.model.tagName,
        link: `${rootUrl}/${tag}`,
        item: items,
    });
};
