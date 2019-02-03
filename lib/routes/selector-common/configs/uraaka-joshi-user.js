module.exports = (params) => {
    const link = `https://www.uraaka-joshi.com/users/${params.id}`;
    return {
        link,
        url: link,
        title: `%title%`,
        params: {
            name: `$('.top-profile-card-name-link').text()`, // 曾经写过直接输入选择器的模式，但是下面的那种date获取方式让我选择直接写js
            title: `%name%@${params.id} - 裏垢女子まとめ`,
        },
        item: {
            item: '.content-main .stream .stream-item',
            title: `%title%`,
            link: `https://www.uraaka-joshi.com/users/${params.id}`,
            description: `$('.post .context').html()`,
            pubDate: `new Date($('.post-time').attr('datetime')).toUTCString()`,
            guid: `new Date($('.post-time').attr('datetime')).getTime()`,
        },
    };
};
