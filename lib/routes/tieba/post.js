const cheerio = require('cheerio');
const got = require('@/utils/got');

/**
 * 获取最新的帖子回复（倒序查看）
 *
 * @param {*} id 帖子ID
 * @param {number} [lz=0] 是否只看楼主（0: 查看全部, 1: 只看楼主）
 * @param {number} [pn=7e6] 帖子最大页码（默认假设为 7e6，如果超出假设则根据返回的最大页码再请求一次，否则可以节省一次请求）
 * 这个默认值我测试下来 7e6 是比较接近最大值了，因为当我输入 8e6 就会返回第一页的数据而不是最后一页了
 * @returns
 */
async function getPost(id, lz = 0, pn = 7e6) {
    const { data } = await got({
        method: 'get',
        url: `https://tieba.baidu.com/p/${id}?see_lz=${lz}&pn=${pn}&ajax=1`,
        headers: {
            Referer: 'https://tieba.baidu.com/',
        },
    });
    const $ = cheerio.load(data);
    const max = Number.parseInt($('[max-page]').attr('max-page'));
    if (max > pn) {
        return getPost(id, max);
    }
    return data;
}

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const lz = ctx._matchedRoute.includes('lz') ? 1 : 0;
    const html = await getPost(id, lz);
    const $ = cheerio.load(html);
    const title = $('.core_title_txt').attr('title');
    // .substr(3);
    const list = $('.p_postlist > [data-field]:not(:has(".ad_bottom_view"))');

    ctx.state.data = {
        title: lz ? `【只看楼主】${title}` : title,
        link: `https://tieba.baidu.com/p/${id}?see_lz=${lz}`,
        description: `${title}的最新回复`,
        item:
            list &&
            list
                .map((index, element) => {
                    const item = $(element);
                    const { author, content } = item.data('field');
                    const [from, num, time] = item
                        .find('.post-tail-wrap > .tail-info')
                        .map((index, element) => $(element).text())
                        .get();
                    return {
                        title: `${author.user_name}回复了帖子《${title}》`,
                        description: `
                            <p>${content.content}</p><br>
                            作者：${author.user_name}<br>
                            楼层：${num}<br>
                            ${from}
                        `, // prettier-ignore
                        pubDate: new Date(time),
                        link: `https://tieba.baidu.com/p/${id}?pid=${content.post_id}#${content.post_id}`,
                    };
                })
                .get(),
    };
};
