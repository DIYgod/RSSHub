const path = require('path');
const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://nsfw.abskoop.com/articles-archive/',
    });

    const $list = cheerio.load(response.data);
    const list = $list('article li')
        .slice(0, 20)
        .map(function () {
            return {
                link: $list(this).find('a').attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({ method: 'get', url: item.link });
                const $detail = cheerio.load(detailResponse.data);
                $detail('article .entry-content').find('.lwptoc').remove();
                $detail('article .entry-content').find('#related_posts').remove();
                $detail('article .entry-content').find('#jp-relatedposts').remove();
                $detail('article .entry-content img').each(function () {
                    $detail(this).replaceWith(`<img src=https:${$detail(this).attr('data-lazy-src')}>`);
                });
                const desc = [];
                $detail('article .entry-content > p').each(function () {
                    desc.push($detail(this).html());
                });
                item.title = $detail('article h1.entry-title').text();
                item.description = art(path.join(__dirname, 'templates/description.art'), { desc });
                item.pubDate = parseDate($detail('meta[property="article:published_time"]').attr('content'));
                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'ahhhhfs-A姐分享NSFW',
        link: 'https://nsfw.ahhhhfs.com',
        description:
            'A姐分享NSFW，分享各种网络云盘资源、BT种子、磁力链接、高清电影电视剧和羊毛福利，收集各种有趣实用的软件和APP的下载、安装、使用方法，发现一些稀奇古怪的的网站，折腾一些有趣实用的教程，关注谷歌苹果等互联网最新的资讯动态，探索新领域，发现新美好，分享小快乐。',
        item: items,
    };
};
