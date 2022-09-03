const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const getPageUrl = (tid, authorId, page = 1, hash = '') => `https://nga.178.com/read.php?tid=${tid}&page=${page}${authorId ? `&authorid=${authorId}` : ''}&rand=${Math.random() * 1000}#${hash}`;
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

    const deepReplace = (str, pattern, replace) => {
        // 对于可能存在嵌套的样式一路 replace 到最深处
        while (str.match(pattern)) {
            str = str.replace(pattern, replace);
        }
        return str;
    };

    const formatContent = (str) => {
        // 简单样式
        str = deepReplace(str, /\[(b|u|i|del|code|sub|sup)\](.+?)\[\/\1\]/g, '<$1>$2</$1>');
        str = str
            .replace(/\[dice\](.+?)\[\/dice\]/g, '<b>ROLL : $1</b>')
            .replace(/\[color=(.+?)\](.+?)\[\/color\]/g, '<span style="color:$1;">$2</span>')
            .replace(/\[font=(.+?)\](.+?)\[\/font\]/g, '<span style="font-family:$1;">$2</span>')
            .replace(/\[size=(.+?)\](.+?)\[\/size\]/g, '<span style="font-size:$1;">$2</span>')
            .replace(/\[align=(.+?)\](.+?)\[\/align\]/g, '<span style="text-align:$1;">$2</span>');
        // 图片
        str = str.replace(/\[img\](.+?)\[\/img\]/g, (m, src) => `<img src='${src[0] === '.' ? 'https://img.nga.178.com/attachments' + src.substr(1) : src}'></img>`);
        // 折叠
        str = deepReplace(str, /\[collapse(?:=(.+?))?\](.+?)\[\/collapse\]/g, '<details><summary>$1</summary>$2</details>');
        // 引用
        str = deepReplace(str, /\[quote\](.+?)\[\/quote\]/g, '<blockquote>$1</blockquote>')
            .replace(/\[@(.+?)\]/g, '<a href="https://nga.178.com/nuke.php?func=ucp&username=$1">@$1</a>')
            .replace(/\[uid=(\d+)\](.+?)\[\/uid\]/g, '<a href="https://nga.178.com/nuke.php?func=ucp&uid=$1">@$2</a>')
            .replace(/\[tid=(\d+)\](.+?)\[\/tid\]/g, '<a href="https://nga.178.com/read.php?tid=$1">$2</a>')
            .replace(/\[pid=(\d+),(\d+),(\d+)\](.+?)\[\/pid\]/g, (m, tid, pid, page, str) => {
                const url = `https://nga.178.com/read.php?tid=${tid}&page=${page}#pid${pid}Anchor`;
                return `<a href="${url}">${str}</a>`;
            });
        // 链接
        str = str.replace(/\[url=(.+?)\](.+?)\[\/url\]/g, '<a href="$1">$2</a>');
        // 分割线
        str = str.replace(/\[h\](.+?)\[\/h\]/g, '<h4 style="font-size:1.17em;font-weight:bold;border-bottom:1px solid #aaa;clear:both;margin:1.33em 0 0.2em 0;">$1</h4>');
        return str;
    };

    const tid = ctx.params.tid;
    const authorId = ctx.params.authorId || undefined;
    const pageId = await getLastPageId(tid, authorId);

    const $ = await getPage(tid, authorId, pageId);
    const title = $('title').text() || '';
    const posterMap = JSON.parse(
        $('script')
            .text()
            .match(/commonui\.userInfo\.setAll\((.*)\)$/m)[1]
    );
    const authorName = authorId ? posterMap[authorId].username : undefined;

    const items = $('#m_posts_c')
        .children()
        .filter('table')
        .map((ind, post_) => {
            const post = $(post_);
            const posterId = post
                .find('.posterinfo a')
                .first()
                .attr('href')
                .match(/&uid=(\d+)/)[1];
            const poster = authorName || posterMap[posterId].username;
            const content = post.find('.postcontent').first();
            const description = formatContent(content.html());
            const postId = content.attr('id');
            const link = getPageUrl(tid, authorId, pageId, postId);
            const pubDate = timezone(parseDate(post.find('.postInfo > span').first().text(), 'YYYY-MM-DD HH:mm'), +8);

            return {
                title: cheerio.load(description).text(),
                author: poster,
                link,
                description,
                pubDate,
                guid: postId,
            };
        });

    let rssTitle;
    if (authorName) {
        rssTitle = `NGA ${authorName} ${title}`;
    } else {
        rssTitle = `NGA ${title}`;
    }

    ctx.state.data = {
        title: rssTitle,
        link: getPageUrl(tid, authorId, pageId),
        item: items.get(),
    };
};
