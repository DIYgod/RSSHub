const got = require('@/utils/got');

const postTypes = {
    1: '文字',
    2: '表情',
    3: '纯图片',
    4: '评论',
    5: '转发',
    6: '纯视频',
    7: '图片文字',
    8: '视频文字',
};

module.exports = async (ctx) => {
    const username = ctx.params.username;

    const url = `https://api.7gogo.jp/web/v2/talks/${username}/posts?talkId=${username}&direction=PREV`;

    const response = await got.get(url);
    const list = response.data.data;

    const user_display_name = list[0].user.name;
    const user_description = list[0].user.description;
    const user_image = list[0].user.coverImageUrl;

    const GetContent = (post) =>
        post.body &&
        post.body
            .map((item) => {
                switch (item.bodyType) {
                    case 1:
                        return `<p>${item.text.replace(/\n/gm, '<br/>')}</p>`;
                    case 2:
                        return `<img src="${item.image}">`;
                    case 3:
                        return `<img src="${item.image}">`;
                    case 4:
                        return `<blockquote>${item.comment.user.name}:<br/>${item.comment.comment.body.replace(/\n/gm, '<br/>')}</blockquote>`;
                    case 7:
                        return `<blockquote>${item.talk.name}:<br/>${GetContent(item.post)}</blockquote>`;
                    case 8:
                        return `<video src="${item.movieUrlHq}" poster="${item.thumbnailUrl}" controls loop>Video</video>`;
                    default:
                        return '';
                }
            })
            .join('');

    const GetTitle = (post) => {
        const texts = post.body.filter((s) => s.bodyType === 1);
        const type_name = postTypes[post.postType];
        return texts.length !== 0 ? texts[0].text.split('\n')[0] : type_name;
    };

    const ProcessFeed = (data) =>
        data.slice(0, 20).map((item) => ({
            title: GetTitle(item.post),
            author: user_display_name,
            description: GetContent(item.post),
            pubDate: new Date(item.post.time * 1000).toUTCString(),
            link: `https://7gogo.jp/${username}/${item.post.postId}`,
        }));

    ctx.state.data = {
        title: `${user_display_name} - 755`,
        image: user_image,
        description: user_description,
        link: `https://7gogo.jp/${username}`,
        item: ProcessFeed(list),
    };
};
