const buildData = require('@/utils/common-config');

module.exports = async (ctx) => {
    const link = `https://www.uraaka-joshi.com/`;
    ctx.state.data = await buildData({
        link,
        url: link,
        title: `%title%`,
        params: {
            title: '裏垢女子まとめ',
        },
        item: {
            item: '.content-main .stream .stream-item .post',
            title: `$('.post-account-group').text() + ' - %title%'`,
            link: `$('.post-account-group').attr('href')`,
            description: `$('.context *').removeAttr('onclick');
                          $('.context *').removeAttr('onerror');
                          $('.context *').removeAttr('style');
                          $('.context video').each((video) => {
                              const poster = $(video).attr('poster')
                              const src = $(video).attr('src')
                              $(video).attr('poster', 'https:' + poster)
                              $(video).attr('src', 'https:' + src)
                          });
                          $('.context').html();`,
            pubDate: `new Date($('.post-time').attr('datetime')).toUTCString()`,
            guid: `new Date($('.post-time').attr('datetime')).getTime()`,
        },
    });
};
