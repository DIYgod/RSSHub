const path = require('path');
const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.abskoop.com/page/1/',
    });

    const $list = cheerio.load(response.data);
    const list = $list('.rizhuti_v2-widget-lastpost .scroll article')
        .map(function () {
            const link = $list(this).find('.entry-wrapper .entry-header a');
            return {
                title: link.attr('title'),
                link: link.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.reverse().map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({ method: 'get', url: item.link });
                const $detail = cheerio.load(detailResponse.data);
                $detail('article .entry-content').find('#related_posts').remove();
                $detail('article .entry-content').find('#jp-relatedposts').remove();
                $detail('article .entry-content').find('.post-note').remove();
                $detail('article .entry-content').find('.entry-tags').remove();
                $detail('article .entry-content').find('.entry-share').remove();
                $detail('article .entry-content a').each(function () {
                    if ($detail(this).find('img').length > 0) {
                        $detail(this).replaceWith(`<img src=${$detail(this).attr('href')}>`);
                    }
                });
                const desc = [];
                $detail('article .entry-content > *').each(function () {
                    desc.push($detail(this).html());
                });
                item.description = art(path.join(__dirname, 'templates/description.art'), { desc });
                item.pubDate = parseDate($detail('meta[property="article:published_time"]').attr('content'));
                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'ahhhhfs-A姐分享',
        link: 'https://www.abskoop.com',
        description:
            'A姐分享，分享各种网络云盘资源、BT种子、高清电影电视剧和羊毛福利，收集各种有趣实用的软件和APP的下载、安装、使用方法，发现一些稀奇古怪的的网站，折腾一些有趣实用的教程，关注谷歌苹果等互联网最新的资讯动态，探索新领域，发现新美好，分享小快乐。',
        item: items,
    };
};
