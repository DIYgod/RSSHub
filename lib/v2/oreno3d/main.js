const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');
const cheerio = require('cheerio');
const get_sec_page_data = require('./get_sec_page_data');

const rootUrl = 'https://oreno3d.com';

const sortRename = {
    favorites: '高評価',
    hot: '急上昇',
    latest: '新着',
    popularity: '人気',
};

function get_user_url(rootUrl, ctx, sort) {
    let userUrl = '';
    // 判断userurl获取位置
    if (ctx.params.keyword) {
        const keyword = ctx.params.keyword;
        userUrl = `${rootUrl}/search?sort=${sort}&keyword=${keyword}`;
    } else if (ctx.params.characterid) {
        const characterid = ctx.params.characterid;
        userUrl = `${rootUrl}/characters/${characterid}?sort=${sort}`;
    } else if (ctx.params.authorid) {
        const authorid = ctx.params.authorid;
        userUrl = `${rootUrl}/authors/${authorid}?sort=${sort}`;
    } else if (ctx.params.tagid) {
        const tagid = ctx.params.tagid;
        userUrl = `${rootUrl}/tags/${tagid}?sort=${sort}`;
    } else if (ctx.params.originid) {
        const originid = ctx.params.originid;
        userUrl = `${rootUrl}/origins/${originid}?sort=${sort}`;
    }
    return userUrl;
}
const selector = 'a.box';
module.exports = async (ctx) => {
    // 下载
    const sort = ctx.params.sort ?? 'latest';
    const userUrl = get_user_url(rootUrl, ctx, sort);
    const response = await got(userUrl);
    const $ = cheerio.load(response.data);
    // 第一页，获取搜索主标题
    const title = $('div.g-main-list').find('h1.main-h').text(); // 搜索标题;//第二页跳转链接

    const list = $(selector);
    const items = await Promise.all(
        list
            .map((_, item) => {
                // 第一页，获取搜各视频地址
                const link = $(item).attr('href');
                return ctx.cache.tryGet(link, async () => {
                    // 第二页数据分析
                    const sec_data = await get_sec_page_data(link);
                    // 传递
                    const raw_pic_link = sec_data.raw_pic_link;
                    const video_name = sec_data.video_name;
                    const authors = sec_data.authors;
                    const origins = sec_data.origins;
                    const characters = sec_data.characters;
                    const tags = sec_data.tags;
                    const desc = sec_data.desc;
                    const iwara_link = sec_data.iwara_link;
                    const oreno3d_link = sec_data.oreno3d_link;
                    // 打包
                    return {
                        title: `${video_name} - ${authors}`,
                        author: authors,
                        link: oreno3d_link,
                        category: tags.split(' '),
                        description: art(path.join(__dirname, 'templates/description.art'), {
                            raw_pic_link,
                            video_name,
                            authors,
                            origins,
                            characters,
                            tags,
                            desc,
                            iwara_link,
                            oreno3d_link,
                        }),
                    };
                });
            })
            .get()
    );

    ctx.state.data = {
        title: `${title} - ${sortRename[sort]}`,
        link: userUrl,
        item: items,
    };
};
