const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const getPageUrl = (tid, authorId, page = 1, hash = '') => `https://nga.178.com/read.php?tid=${tid}&page=${page}&authorid=${authorId}&rand=${Math.random() * 1000}#${hash}`;
    const getPage = async (tid, authorId, pageId = 1) => {
        const link = getPageUrl(tid, authorId, pageId);
        const timestamp = Math.floor(Date.now() / 1000);
        let cookieString = `guestJs=${timestamp};`;
        if (config.nga.uid && config.nga.cid) {
            cookieString = `ngaPassportUid=${config.nga.uid}; ngaPassportCid=${config.nga.cid};`;
        }
        const response = await got(link, {
            responseType: 'buffer',
            headers: {
                Cookie: cookieString,
            },
        });

        const htmlString = iconv.decode(response.data, 'gbk');
        return cheerio.load(htmlString);
    };

    const getLastPageId = async (tid, authorId) => {
        const $ = await getPage(tid, authorId);
        const nav = $('#pagebtop');
        const match = nav.html().match(/\{0:'\/read\.php\?tid=(\d+).*?',1:(\d+),.*?\}/);
        return match ? match[2] : 1;
    };

    const eraseTag = (str) => str.replace(/\[(\w+)\].+?\[\/\1\]/g, '');
    const eraseQuote = (str) => str.replace(/\[quote\](.+?)\[\/quote\]/, (m, b) => b).replace(/\[b\].*?\[uid=\d+\](.+?)\[\/uid\].+?\[\/b\]/, (m, user) => `@${user} `);
    const pipeImg = (str) => str.replace(/\[img\](.+?)\[\/img\]/g, (m, src) => `<img src='${src[0] === '.' ? 'https://img.nga.178.com/attachments' + src.substr(1) : src}'></img>`);

    const tid = ctx.params.tid;
    const authorId = ctx.params.authorId;
    const pageId = await getLastPageId(tid, authorId);

    const $ = await getPage(tid, authorId, pageId);
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
            const link = getPageUrl(tid, authorId, pageId, postId);
            const pubDate = timezone(parseDate(post.find('.postInfo > span').first().text(), 'YYYY-MM-DD HH:mm'), +8);

            return {
                title,
                link,
                description,
                pubDate,
                guid: postId,
            };
        });

    ctx.state.data = {
        title: authorId ? `nga-${title}-${authorId}` : `nga-${title}`,
        link: getPageUrl(tid, authorId, pageId),
        item: items.get(),
    };
};
