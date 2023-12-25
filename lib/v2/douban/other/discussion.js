/*
 * @Author: nightmare-mio wanglongwei2009@qq.com
 * @Date: 2023-11-20 23:36:12
 * @LastEditTime: 2023-11-22 20:11:24
 * @Description:
 */
const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const link = 'https://book.douban.com/subject';
    const { data: response } = await got(`${link}/${id}/discussion/`);
    const $ = cheerio.load(response);
    // 列表
    const list = $('#posts-table>tbody>tr')
        .toArray()
        .slice(1)
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.attr('title'),
                link: a.attr('href'),
                pubDate: parseDate(item.find('.time').text()),
                author: item.find('a').eq(1).text(),
            };
        });
    const title = $('#content>h1').text();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);
                // 评论
                const list = $('#comments>.comment-item').toArray();
                const replyContent = list
                    .map((item, index) => {
                        const post = $(item);
                        const content = post.find('.content>p').html();
                        const author = post.find('.author>a').text();
                        return `<p><div>#${index + 1}: <i>${author}</i></div><div>${content}</div></p>`;
                    })
                    .join('');
                item.description = `${$('#link-report>div').eq(1).html()}<div>${replyContent}</div>`;
                return item;
            })
        )
    );

    ctx.state.data = {
        title,
        link: `${link}/${id}/discussion`,
        item: items,
    };
};
