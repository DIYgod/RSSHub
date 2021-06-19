const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const sort = ctx.params.sort || 'new';

    let url = 'https://api.yanxishe.com/api?page=1&size=30&parent_tag=';

    if (id === 'all') {
        url += '&tag=';
    } else {
        url += `&tag=${id}`;
    }
    if (sort === 'hot') {
        url += '&is_hot=1&is_recommend=0';
    } else if (sort === 'recommend') {
        url += '&is_hot=0&is_recommend=1';
    } else {
        url += '&is_hot=0&is_recommend=0';
    }

    const response = await got({
        method: 'GET',
        url: url,
        headers: {
            Referer: `https://www.yanxishe.com/`,
        },
    });

    const ProcessFeed = (type, data, id) => {
        let description = '';
        let author = '';
        let link;
        switch (type) {
            case 'blog': // 博客
                description = data.content;
                author = data.user.nickname;
                if (data.relation_special) {
                    link = `https://www.yanxishe.com/columnDetail/${id}`;
                } else {
                    link = `https://www.yanxishe.com/blogDetail/${id}`;
                }
                break;
            case 'question': // 问答
                description = data.content;
                author = data.user.nickname;
                link = `https://www.yanxishe.com/questionDetail/${id}`;
                break;
            case 'article': // 翻译
                description = `<table><tr><td width="50%"> ${data.title} </td><td> ${data.zh_title} </td></tr>`;
                data.paragraphs.forEach((element) => {
                    description += `<tr><td> ${element.content} </td><td> ${element.zh_content.content} </td></tr>`;
                });
                description += `</table>
                <style>
                    table,
                    table tr th,
                    table tr td {
                        border: 1px solid #000000;
                        padding: 10px;
                    }
                    table {
                        border-collapse: collapse;
                    }
                </style>`;
                author = data.user.nickname;
                link = `https://www.yanxishe.com/TextTranslation/${id}`;
                break;
            case 'paper': // 论文
                description = `<h3>标题</h3><p> ${data.paper.title} </p>`;
                description += `<h3>作者</h3><p> ${data.paper.author.toString()} </p>`;
                description += `<h3>下载地址</h3><p><a href=" ${data.paper.url} ">${data.paper.url}</a></p>`;
                description += `<h3>发布时间</h3><p> ${data.paper.publish_time} </p>`;
                description += `<h3>摘要</h3><p> ${data.paper.description} </p>`;
                description += `<h3>推荐理由</h3><p><b> ${data.paper.userInfo.nickname} </b>: ${data.paper.recommend_reason} </p>`;
                author = data.paper.userInfo.nickname;
                link = `https://paper.yanxishe.com/review/${id}`;
                break;
            default:
                description = '暂不支持此类型，请到 https://github.com/DIYgod/RSSHub/issues 反馈';
                break;
        }

        // 提取内容
        return { author, description, link };
    };

    const items = await Promise.all(
        response.data.data.all.map(async (item) => {
            let itemUrl = `https://api.yanxishe.com/api/sthread/${item.id}?token=null`;

            if (item.type === 'blog') {
                itemUrl += '&type=null';
            } else if (item.type === 'article') {
                itemUrl = `https://api.yanxishe.com/api/stranslate/article/${item.id}?token=null&type=null`;
            } else if (item.type === 'paper') {
                itemUrl = `https://api.yanxishe.com/api/spaper/detail?token=null&id=${item.id}`;
            }

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got({
                method: 'get',
                url: itemUrl,
            });

            const result = ProcessFeed(item.type, response.data.data, item.id);

            const single = {
                title: item.zh_title,
                description: result.description,
                pubDate: new Date(parseFloat(item.published_time + '000')).toUTCString(),
                link: result.link,
                author: result.author,
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `AI研习社`,
        link: `https://ai.yanxishe.com/`,
        description: '专注AI技术发展与AI工程师成长的求知平台',
        item: items,
    };
};
