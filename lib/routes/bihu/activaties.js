const axios = require('../../utils/axios');
const url = require('url');

const api = 'https://be02.bihu.com/bihube-pc/bihu/user/getUserContentList/';
const articleHost = 'https://bihu.com/article/';
const host = 'https://bihu.com/people/';
const getArticleApi = 'https://be02.bihu.com/bihube-pc/api/content/show/getArticle2/';
const articleContent = 'https://oss02.bihu.com/';

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const link = url.resolve(host, id);
    const response = await axios.post(api, {
        queryUserId: id,
        pageNum: 1,
    });

    const data = response.data.data;
    const contenList = data.list;

    let author = '未知用户';
    let out = '';

    if (contenList.length !== 0) {
        author = contenList[0].userName;

        out = await Promise.all(
            contenList.map(async (item) => {
                const type = item.type;
                let description = item.content;
                let title = '动态';
                let itemLink = link;

                // 文章
                if (type !== 1) {
                    title = item.title;
                    const contentId = item.contentId;
                    itemLink = url.resolve(articleHost, contentId.toString());

                    const getArticleApiResponse = await axios.post(getArticleApi, {
                        artId: contentId,
                    });

                    const articleContentPath = getArticleApiResponse.data.data.content;

                    const link = url.resolve(articleContent, articleContentPath);
                    const articleContentResponse = await axios.get(link);
                    description = decodeURIComponent(articleContentResponse.data);
                }

                const single = {
                    title: title,
                    link: itemLink,
                    author: author,
                    description: description,
                    pubDate: new Date(item.createTime).toUTCString(),
                };

                return single;
            })
        );
    }

    ctx.state.data = {
        title: `币乎 - ${author}的动态`,
        link: link,
        item: out,
    };
};
