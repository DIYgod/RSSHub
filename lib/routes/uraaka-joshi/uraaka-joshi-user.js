const buildData = require('@/utils/common-config');

module.exports = async (ctx) => {
    const params = ctx.params;
    const link = `https://www.uraaka-joshi.com/users/${params.id}`;
    ctx.state.data = await buildData({
        link,
        url: link,
        title: `$('.top-profile-card-name-link').text() + '@${params.id} - 裏垢女子まとめ'`,
        item: {
            item: '.content-main .stream .stream-item',
            title: `$('.post-name').text() + '@${params.id} - 裏垢女子まとめ'`,
            link: `https://www.uraaka-joshi.com/users/${params.id}`,
            description: `$('.post .context').html()`,
            pubDate: `new Date($('.post-time').attr('datetime')).toUTCString()`,
            guid: `new Date($('.post-time').attr('datetime')).getTime()`,
        },
    });
};
