const got = require('@/utils/got');

module.exports = async (ctx) => {
    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        url: `http://file.apicvn.com/file/list`,
    });

    const data = response.data; // response.data 为 HTTP GET 请求返回的数据对象
    // 这个对象中包含了数组名为 data，所以 response.data.data 则为需要的数据

    ctx.state.data = {
        // 源标题
        title: `yyets 的今日更新`,
        // 源链接
        link: `http://file.apicvn.com/file/list`,
        // 源说明
        description: `yyets 的今日更新视频列表`,
        // 遍历此前获取的数据
        item: data.map((item) => ({
            // 文章标题
            title: item.file_name,
            // 文章正文
            description: ``,
            // 文章发布时间
            pubDate: item.create_time,
            // 文章链接
            link: `${item.magnet_url}&tr=http://tr.cili001.com:8070/announce&tr=udp://p4p.arenabg.com:1337&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://open.demonii.com:1337`,
            enclosure_url: `${item.magnet_url}&tr=http://tr.cili001.com:8070/announce&tr=udp://p4p.arenabg.com:1337&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://open.demonii.com:1337`, // 磁力链接
            enclosure_length: '', // 时间戳 (播放长度) , 一般是秒数，可选
            enclosure_type: 'application/x-bittorrent', // 固定为 'application/x-bittorrent'
        })),
    };
};
