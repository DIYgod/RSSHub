import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const typeMap = {
        breaking: {
            title: '快讯',
            apiPath: '/flash',
        },
        hot: {
            title: '本周热榜',
            apiPath: '/information/hot',
        },
        index: {
            title: '首页资讯',
            apiPath: '/information/index',
        },
        video: {
            title: '视频',
            apiPath: '/movie/index',
        },
    };

    const { type = 'index' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 10;

    const link = `https://apii.mittrchina.com${typeMap[type].apiPath}`;
    const { data: response } =
        type === 'breaking'
            ? await got.post(link, {
                  form: {
                      page: 1,
                      size: limit,
                  },
              })
            : await got(link, {
                  searchParams: {
                      limit,
                  },
              });

    const articles = type === 'hot' ? response.data : response.data.items;

    const list = articles.map((article) => ({
        title: article.name || article.title,
        author: (article.authors || article.author || []).map((author) => author.username).join(', '),
        category: article.typeName,
        description:
            type === 'video'
                ? art(path.join(__dirname, 'templates/movie.art'), {
                      poster: article.img,
                      video: {
                          address: article.address,
                          type: article.address.split('.').pop(),
                      },
                  })
                : article.summary,
        pubDate: article.start_time ? parseDate(article.start_time, 'X') : undefined,
        id: article.id,
        link: `https://www.mittrchina.com/news/detail/${article.id}`,
    }));

    let items = list;
    if (type !== 'video') {
        items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link, async () => {
                    const {
                        data: { data: details },
                    } = await got(`https://apii.mittrchina.com/information/details?id=${item.id}`);

                    item.description = details.content;

                    if (!item.author) {
                        item.author = details.authors.map((a) => a.username).join(', ');
                    }
                    if (!item.pubDate) {
                        item.pubDate = parseDate(details.start_time, 'X');
                    }

                    if (details.cover) {
                        item.enclosure_url = details.cover;
                        item.enclosure_type = `image/${details.cover.split('.').pop()}`;
                    }

                    return item;
                })
            )
        );
    }

    ctx.set('data', {
        title: `MIT 科技评论 - ${typeMap[type].title}`,
        link: `https://www.mittrchina.com/${type}`,
        item: items,
    });
};
