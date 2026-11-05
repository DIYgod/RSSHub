import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/',
    categories: ['multimedia'],
    example: '/abskoop',
    radar: [
        {
            source: ['ahhhhfs.com/'],
            target: '',
        },
    ],
    name: '存档列表',
    maintainers: ['zhenhappy'],
    handler,
    url: 'ahhhhfs.com/',
    features: {
        nsfw: true,
    },
};

async function handler(ctx) {
    const requestedLimit = getRouteLimit(ctx, 10);
    const limit = Math.min(Math.max(requestedLimit, 1), 100);
    const response = await got({
        method: 'get',
        url: 'https://www.ahhhhfs.com/wp-json/wp/v2/posts',
        searchParams: {
            per_page: limit,
            _embed: '',
        },
    });
    const list = response.data.map((item) => ({
        title: item.title.rendered,
        link: item.link,
        pubDate: parseDate(`${item.date_gmt}Z`),
        updated: parseDate(`${item.modified_gmt}Z`),
        author: item._embedded.author[0].name,
        category: [...new Set(item._embedded['wp:term'].flatMap((i) => i.map((j) => j.name)))],
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({ method: 'get', url: item.link });
                const $detail = load(detailResponse.data);
                $detail('article.post-content').find('.lwptoc').remove();
                $detail('article.post-content').find('#related_posts').remove();
                $detail('article.post-content').find('.entry-copyright').remove();
                $detail('article.post-content').find('noscript').remove();
                $detail('article.post-content img').each((_, el) => {
                    const image = $detail(el);
                    const src = image.attr('data-lazy-src') || image.attr('src');
                    if (src) {
                        image.attr('src', new URL(src, item.link).href);
                    }
                    image.removeAttr('data-lazy-src data-lazy-srcset data-lazy-sizes');
                });
                item.description = $detail('article.post-content').html();
                return item;
            })
        )
    );

    return {
        title: 'ahhhhfs-A姐分享',
        link: 'https://www.ahhhhfs.com',
        description:
            'A姐分享，分享各种网络云盘资源、BT种子、高清电影电视剧和羊毛福利，收集各种有趣实用的软件和APP的下载、安装、使用方法，发现一些稀奇古怪的的网站，折腾一些有趣实用的教程，关注谷歌苹果等互联网最新的资讯动态，探索新领域，发现新美好，分享小快乐。',
        item: items,
    };
}
