const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const mpName = ctx.params.mpName ?? '';

    const { data } = await got.get(`https://t.me/s/${id}`);
    const $ = cheerio.load(data);
    const list = $('.tgme_widget_message_wrap').slice(-20);

    const out = await Promise.all(
        list
            .map(async (index, item) => {
                item = $(item);

                // [ div.tgme_widget_message_text 格式简略说明 ]
                // 若频道只订阅一个公众号：
                // 第 1 个元素: <a href="${用于 link priview 的预览图 url}"><i><b>${emoji(链接)}</b></i></a>
                // 第 2 个元素: <a href="${文章 url}">${文章标题}</a>
                // (余下是文章简介，一般是裸文本，这里用不到)
                //
                // 若频道订阅多于一个公众号：
                // 第 1 个元素: <i><b>${emoji(标注消息来源于什么 slave，这里是表示微信的对话气泡)}</b></i>
                // 第 2 个元素: <i><b>${emoji(标注对话类型，这里是表示私聊的半身人像)</b></i>
                // 裸文本: (半角空格)${公众号名}(半角冒号)
                // 第 3 个元素: <br />
                // 第 4 个元素: <a href="${用于 link priview 的预览图 url}"><i><b>${emoji(链接)}</b></i></a>
                // 第 5 个元素: <a href="${文章 url}">${文章标题}</a>
                // (余下是文章简介，一般是裸文本，这里用不到)

                const title_elem = item.find('.tgme_widget_message_text > a:nth-of-type(2)'); // 第二个 a 元素会是文章链接

                if (title_elem.length === 0) {
                    // 获取不到第二个 a 元素，这可能是公众号发的服务消息，丢弃它
                    return;
                }

                let author;
                let title = title_elem.text();
                const link = title_elem.attr('href');

                const br_node = item.find('.tgme_widget_message_text > br:nth-of-type(1)').get(0); // 获取第一个换行
                const author_node = br_node && br_node.prev; // br_node 不为 undefined 时获取它的前一个节点
                if (author_node && author_node.type === 'text') {
                    // 只有这个节点是一个裸文本时它才可能是公众号名
                    const spaceIndex = author_node.data.indexOf(' ');
                    const colonIndex = author_node.data.indexOf(':');
                    if (spaceIndex !== -1 && colonIndex !== -1) {
                        // 找到了公众号名，说明这个频道订阅了多个公众号
                        author = author_node.data.slice(spaceIndex + 1, colonIndex); // 提取作者
                        if (mpName && author !== mpName) {
                            // 指定了要筛选的公众号名，且该文章不是该公众号发的
                            return; // 丢弃
                        } else if (!mpName) {
                            // 没有指定要筛选的公众号名
                            title = author + ': ' + title; // 给标题里加上获取到的作者
                        }
                    }
                }

                const pubDate = new Date(item.find('.tgme_widget_message_date time').attr('datetime')).toUTCString();

                const single = {
                    title,
                    pubDate,
                    link,
                    author,
                };

                if (link !== undefined) {
                    const value = await ctx.cache.get(link);
                    if (value) {
                        single.description = value;
                    } else {
                        try {
                            const reponse = await got.get(link);
                            const $ = cheerio.load(reponse.data);

                            single.description = $('.rich_media_content')
                                .html()
                                .replace(/data-src/g, 'src');
                            ctx.cache.set(link, single.description, 12 * 60 * 60);
                        } catch (err) {
                            single.description = item.find('.tgme_widget_message_text').html();
                        }
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
