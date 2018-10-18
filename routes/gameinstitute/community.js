const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { tag = 'hot' } = ctx.params;

    const listRes = await axios({
        method: 'get',
        url: `http://gameinstitute.qq.com/community/${tag}/new?p=1&ps=20&ob=new&cid=0&tag=${tag}`,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    const storyList = listRes.data.archives;
    const resultItem = await Promise.all(
        storyList.map(async (story) => {
            const url = `http://gameinstitute.qq.com/article/detail/${story.id}`;
            const item = {
                title: story.title,
                description: '',
                link: url,
                author: story.user_name,
                pubDate: new Date(story.publish_time).toUTCString(),
            };
            const key = `gameinstitute-community: ${url}`;
            const value = await ctx.cache.get(key);

            if (value) {
                item.description = value;
            } else {
                const storyDetail = await axios({
                    method: 'get',
                    url: url,
                });
                const $ = cheerio.load(storyDetail.data);
                $('.art-cont img').each(function(_, item) {
                    $(item).attr('referrerpolicy', 'no-referrer');
                });

                // 处理图片左边被截断问题
                $('.art-cont .image-package').each(function(_, item) {
                    $(item).css('margin', '0');
                });

                item.description = $('.art-cont').html();
                ctx.cache.set(key, item.description, 24 * 60 * 60);
            }

            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: '游戏开发者社区-腾讯游戏学院',
        description: '腾讯游戏学院是专门为游戏行业从业者服务的游戏开发者社区，这里有关于游戏开发相关的文章教程、游戏策划、美术作品、还有新鲜的前沿科技资讯。',
        link: `http://gameinstitute.qq.com/community/${tag}`,
        item: resultItem,
    };
};
