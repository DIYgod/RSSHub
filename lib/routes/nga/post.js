const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const getPageUrl = (tid, page = 1, hash = '') => `https://nga.178.com/read.php?tid=${tid}&page=${page}&rand=${Math.random() * 1000}#${hash}`;
    const getPage = async (tid, pageId = 1) => {
        const link = getPageUrl(tid, pageId);
        const timestamp = Math.floor(Date.now() / 1000);
        const response = await axios({
            method: 'get',
            url: link,
            responseType: 'arraybuffer',
            headers: {
                Cookie: `guestJs=${timestamp};`,
            },
        });

        const htmlString = iconv.decode(response.data, 'gbk');
        return cheerio.load(htmlString);
    };

    const getLastPageId = async (tid) => {
        const $ = await getPage(tid);
        const nav = $('#pagebtop');
        const match = nav.html().match(/\{0:'\/read.php\?tid=(\d+)',1:(\d+).*?\}/);
        return match ? match[2] : 1;
    };

    const eraseTag = (str) => str.replace(/\[(\w+)\].+?\[\/\1\]/g, '');
    const eraseQuote = (str) => str.replace(/\[quote\](.+?)\[\/quote\]/, (m, b) => b).replace(/\[b\].*?\[uid=\d+\](.+?)\[\/uid\].+?\[\/b\]/, (m, user) => `@${user} `);
    const pipeImg = (str) => str.replace(/\[img\](.+?)\[\/img\]/g, (m, src) => `<img src='${src[0] === '.' ? 'https://img.nga.178.com/attachments' + src.substr(1) : src}'></img>`);

    const tid = ctx.params.tid;
    const pageId = await getLastPageId(tid);

    const $ = await getPage(tid, pageId);
    const title = $('title').text() || '';

    const items = $('#m_posts_c')
        .children()
        .filter('table')
        .map((ind, post_) => {
            const post = $(post_);
            const content = post.find('.postcontent').first();
            const title = eraseTag(content.text());
            const description = eraseTag(pipeImg(eraseQuote(content.html() || '')));
            const postId = content.attr('id');
            const link = getPageUrl(tid, pageId, postId);
            const pubDate = new Date(
                post
                    .find('.postInfo > span')
                    .first()
                    .text()
            ).toUTCString();

            return {
                title,
                link,
                description,
                pubDate,
                guid: postId,
            };
        });

    ctx.state.data = {
        title: `nga-${title}`,
        link: getPageUrl(tid, pageId),
        item: items.get(),
    };
};
