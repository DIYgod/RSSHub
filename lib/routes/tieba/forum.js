const cheerio = require('cheerio');
const qs = require('querystring');
const got = require('@/utils/got');

function isNormalTime(time) {
    return /^(\d{2}):(\d{2})$/.test(time);
}

function isNormalDate(time) {
    return /^(\d{1,2})-(\d{1,2})$/.test(time);
}

function isDate(time) {
    return /^(\d{4})-(\d{1,2})-(\d{1,2})$/.test(time);
}

function getPubDate(time) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    if (isNormalTime(time)) {
        return new Date(`${year}-${month}-${date} ${time}`);
    }
    if (isNormalDate(time)) {
        return new Date(`${year}-${time}`) > now ? new Date(`${year - 1}-${time}`) : new Date(`${year}-${time}`);
    }
    if (isDate(time)) {
        return new Date(time);
    }
    return now;
}

module.exports = async (ctx) => {
    const { kw, cid } = ctx.params;

    // PC端：https://tieba.baidu.com/f?kw=${encodeURIComponent(kw)}
    // 移动端接口：https://tieba.baidu.com/mo/q/m?kw=${encodeURIComponent(kw)}&lp=5024&forum_recommend=1&lm=0&cid=0&has_url_param=1&pn=0&is_ajax=1
    const params = { kw: encodeURIComponent(kw) };
    ctx._matchedRoute.includes('good') && (params.tab = 'good');
    cid && (params.cid = cid);
    const { data } = await got({
        method: 'get',
        url: `https://tieba.baidu.com/f?${qs.stringify(params)}`,
        headers: {
            Referer: 'https://tieba.baidu.com/',
        },
    });

    const threadListHTML = cheerio
        .load(data)('code[id="pagelet_html_frs-list/pagelet/thread_list"]')
        .html()
        .replace(/<!--|-->/g, '');

    const $ = cheerio.load(threadListHTML);
    const list = $('#thread_list > .j_thread_list[data-field]');

    ctx.state.data = {
        title: `${kw}吧`,
        link: `https://tieba.baidu.com/f?kw=${encodeURIComponent(kw)}`,
        item:
            list &&
            list
                .map((index, element) => {
                    const item = $(element);
                    const { id, author_name } = item.data('field');
                    const time = item.find('.threadlist_reply_date').text().trim(); // prettier-ignore
                    const title = item.find('a.j_th_tit').text().trim(); // prettier-ignore
                    const details = item.find('.threadlist_abs').text().trim(); // prettier-ignore
                    const medias = item
                        .find('.threadlist_media img')
                        .map((index, element) => {
                            const item = $(element);
                            return `<img src="${item.attr('bpic')}">`; // prettier-ignore
                        })
                        .get()
                        .join('');

                    return {
                        title,
                        description: `<p>${details}</p><p>${medias}</p><p>作者：${author_name}</p>`,
                        pubDate: getPubDate(time).toUTCString(),
                        link: `https://tieba.baidu.com/p/${id}`,
                    };
                })
                .get(),
    };
};
