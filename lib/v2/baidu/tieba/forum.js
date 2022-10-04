const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const { kw, cid } = ctx.params;

    // PC端：https://tieba.baidu.com/f?kw=${encodeURIComponent(kw)}
    // 移动端接口：https://tieba.baidu.com/mo/q/m?kw=${encodeURIComponent(kw)}&lp=5024&forum_recommend=1&lm=0&cid=0&has_url_param=1&pn=0&is_ajax=1
    const params = { kw: encodeURIComponent(kw) };
    ctx._matchedRoute.includes('good') && (params.tab = 'good');
    cid && (params.cid = cid);
    const { data } = await got(`https://tieba.baidu.com/f`, {
        headers: {
            Referer: 'https://tieba.baidu.com/',
        },
        searchParams: params,
    });

    const threadListHTML = cheerio
        .load(data)('code[id="pagelet_html_frs-list/pagelet/thread_list"]')
        .contents()
        .filter((e) => e.nodeType === '8');

    const $ = cheerio.load(threadListHTML.prevObject[0].data);
    const list = $('#thread_list > .j_thread_list[data-field]')
        .toArray()
        .map((element) => {
            const item = $(element);
            const { id, author_name } = item.data('field');
            const time = item.find('.threadlist_reply_date').text().trim();
            const title = item.find('a.j_th_tit').text().trim();
            const details = item.find('.threadlist_abs').text().trim();
            const medias = item
                .find('.threadlist_media img')
                .toArray()
                .map((element) => {
                    const item = $(element);
                    return `<img src="${item.attr('bpic')}">`;
                })
                .join('');

            return {
                title,
                description: art(path.join(__dirname, '../templates/forum.art'), {
                    details,
                    medias,
                    author_name,
                }),
                pubDate: timezone(parseDate(time, ['HH:mm', 'M-D']), +8),
                link: `https://tieba.baidu.com/p/${id}`,
            };
        });

    ctx.state.data = {
        title: `${kw}吧`,
        description: cheerio.load(data)('meta[name="description"]').attr('content'),
        link: `https://tieba.baidu.com/f?kw=${encodeURIComponent(kw)}`,
        item: list,
    };
};
