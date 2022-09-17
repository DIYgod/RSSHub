const got = require('@/utils/got');
const cheerio = require('cheerio');
const { finishArticleItem } = require('@/utils/wechat-mp');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const mpName = ctx.params.mpName ?? '';
    let searchQueryType = ctx.params.searchQueryType ?? '0';
    if (searchQueryType !== '0' && searchQueryType !== '1' && searchQueryType !== '2') {
        searchQueryType = '0';
    }
    searchQueryType = +searchQueryType; // 将字符串转换为数字

    const channelUrl = `https://t.me/s/${id}`;
    const searchQuery = mpName && searchQueryType ? (searchQueryType === 2 ? `?q=%23${mpName}` : `?q=${mpName}`) : '';
    const { data } = await got.get(`${channelUrl}${searchQuery}`);
    const $ = cheerio.load(data);
    const list = $('.tgme_widget_message_wrap').slice(-20);

    const out = await Promise.all(
        list
            .map(async (index, item) => {
                item = $(item);

                if (searchQuery) {
                    // 删除关键字高亮 <mark class="highlight">
                    const highlightMarks = item.find('mark.highlight').get();
                    highlightMarks.forEach((mark) => {
                        mark = $(mark);
                        const markInnerHtml = mark.html();
                        mark.replaceWith(markInnerHtml);
                    });
                    if (highlightMarks) {
                        item = $(item.html()); // 删除关键字高亮后，相邻的裸文本节点不会被自动合并，重新生成 cheerio 对象以确保后续流程正常运行
                    }
                }

                // [ div.tgme_widget_message_text 格式简略说明 ]
                // 若频道只订阅一个公众号：
                // 第 1 个元素: <a href="${用于 link priview 的预览图 url}"><i><b>🔗</b></i></a>
                // 第 2 个元素: <a href="${文章 url}">${文章标题}</a>
                // (余下是文章简介，一般是裸文本，这里用不到)
                //
                // 若频道订阅多于一个公众号：
                // 第 1 个元素: <i><b>${emoji(标注消息来源于什么 slave，这里是表示微信的💬)}</b></i>
                // 第 2 个元素: <i><b>${emoji(标注对话类型，这里是表示私聊的👤)</b></i>
                // 裸文本: (半角空格)${公众号名}(半角冒号)
                // 第 3 个元素: <br />
                // 第 4 个元素: <a href="${用于 link priview 的预览图 url}"><i><b>🔗</b></i></a>
                // 第 5 个元素: <a href="${文章 url}">${文章标题}</a>
                // (余下是文章简介，一般是裸文本，这里用不到)
                //
                // 若启用 efb-patch-middleware 且频道订阅多于一个公众号：
                // 第 1 个元素: <i><b>${emoji(标注消息来源于什么 slave，这里是表示微信的💬)}</b></i>
                // 第 2 个元素: <i><b>${emoji(标注对话类型，这里是表示私聊的👤)</b></i>
                // 第 3 个元素: <a href="${?q=%23url-encoded公众号名}">#${公众号名}</a>
                // 裸文本: ${公众号名余下部分 (若 hashtag 不合法 (遇到空格、标点) 导致被截断才会有)}(半角冒号)
                // 第 4 个元素: <br />
                // 第 5 个元素: <a href="${用于 link priview 的预览图 url}"><i><b>🔗</b></i></a>
                // 第 6 个元素: <a href="${文章 url}">${文章标题}</a>
                // (余下是文章简介，一般是裸文本，这里用不到)

                let author = '';
                let titleElemIs3thA = false;

                const brNode = item.find('.tgme_widget_message_text > br:nth-of-type(1)').get(0); // 获取第一个换行
                const authorNode = brNode && brNode.prev; // brNode 不为 undefined 时获取它的前一个节点
                const authorNodePrev = authorNode && authorNode.prev; // authorNode 不为 undefined 时获取它的前一个节点
                if (authorNode && authorNode.type === 'text') {
                    // 只有这个节点是一个裸文本时它才可能是公众号名，开始找寻公众号名
                    if (authorNodePrev && authorNodePrev.type === 'tag' && authorNodePrev.name === 'a' && authorNodePrev.attribs.href && authorNodePrev.attribs.href.startsWith('?q=%23')) {
                        // authorNode 前一个节点是链接, 且是个 hashtag，表示启用了 efb-patch-middleware，这个节点是公众号名
                        // 有两种可能：
                        // 带 # 的完整公众号名 (efb-patch-middleware 启用，且 hashtag 完全合法)
                        // 被截断的公众号名前半部分 (efb-patch-middleware 启用，但 hashtag 被空格或标点截断)
                        // (若 efb-patch-middleware 未启用，或 hashtag 完全不合法，不会进入此流程)
                        titleElemIs3thA = true;
                        author += $(authorNodePrev).text();
                    }

                    const spaceIndex = authorNode.data.indexOf(' ');
                    const colonIndex = authorNode.data.indexOf(':');
                    if (authorNode.data.length > 1 && colonIndex !== -1 && (spaceIndex !== -1 || titleElemIs3thA)) {
                        // 有三种可能：
                        // 不带 # 的完整公众号名 (efb-patch-middleware 未启用)
                        // 带 # 的完整公众号名 (efb-patch-middleware 启用，但 hashtag 完全不合法)
                        // 被截断的公众号名后半部分 (efb-patch-middleware 启用，但 hashtag 被空格或标点截断，此时空格有意义)
                        // (若 efb-patch-middleware 启用，且 hashtag 完全合法，不会进入此流程)
                        const sliceStart = titleElemIs3thA ? 0 : spaceIndex + 1;
                        author += authorNode.data.slice(sliceStart, colonIndex); // 提取作者
                    }

                    if (author.startsWith('#')) {
                        author = author.slice(1); // 去掉开头的 #
                    }
                }

                // 如果启用了 efb-patch-middleware 且 hashtag (部分)合法，第三个 a 元素会是文章链接，否则是第二个
                const titleElemNth = titleElemIs3thA ? 3 : 2;
                const titleElem = item.find(`.tgme_widget_message_text > a:nth-of-type(${titleElemNth})`);

                if (titleElem.length === 0) {
                    // 获取不到标题 a 元素，这可能是公众号发的服务消息，丢弃它
                    return;
                }

                let title = titleElem.text();
                const link = titleElem.attr('href');

                if (mpName && author !== mpName) {
                    // 指定了要筛选的公众号名，且该文章不是该公众号发的
                    return; // 丢弃
                } else if (!mpName && author) {
                    // 没有指定要筛选的公众号名，且匹配到了作者
                    title = author + ': ' + title; // 给标题里加上获取到的作者
                }

                const pubDate = new Date(item.find('.tgme_widget_message_date time').attr('datetime')).toUTCString();

                const single = {
                    title,
                    pubDate,
                    link,
                    guid: link,
                };

                if (link !== undefined) {
                    try {
                        return await finishArticleItem(ctx, single);
                    } catch (err) {
                        single.description = item.find('.tgme_widget_message_text').html();
                    }
                }
                return single;
            })
            .get()
    );

    out.reverse();
    ctx.state.data = {
        title: mpName ?? $('.tgme_channel_info_header_title').text(),
        link: `https://t.me/s/${id}`,
        item: out.filter((item) => item),
        allowEmpty: !!mpName,
    };
};
