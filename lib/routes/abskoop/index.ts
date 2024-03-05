// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.ahhhhfs.com/wp-json/wp/v2/posts',
        searchParams: {
            per_page: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 10,
            _embed: '',
        },
    });
    const list = response.data.map((item) => ({
        title: item.title.rendered,
        link: item.link,
        pubDate: parseDate(item.date_gmt),
        updated: parseDate(item.modified_gmt),
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
                $detail('article.post-content img').each(function () {
                    $detail(this).replaceWith(`<img src=https:${$detail(this).attr('src')}>`);
                });
                item.description = $detail('article.post-content').html();
                return item;
            })
        )
    );

    ctx.set('data', {
        title: 'ahhhhfs-A姐分享',
        link: 'https://www.ahhhhfs.com',
        description:
            'A姐分享，分享各种网络云盘资源、BT种子、高清电影电视剧和羊毛福利，收集各种有趣实用的软件和APP的下载、安装、使用方法，发现一些稀奇古怪的的网站，折腾一些有趣实用的教程，关注谷歌苹果等互联网最新的资讯动态，探索新领域，发现新美好，分享小快乐。',
        item: items,
    });
};
