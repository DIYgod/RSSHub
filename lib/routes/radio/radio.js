const got = require('@/utils/got');

module.exports = async (ctx) => {
    const channelname = ctx.params.channelname; // 专辑id
    const name = ctx.params.name; // 专辑id

    const api = `http://tacc.radio.cn/pcpages/searchs/livehistory?channelname=${channelname}&name=${name}&start=1&rows=20`;
    const response = await got.get(api);

    const playList = response.data.passprogram;
    let title = '';
    let itunes_category = '';
    let items = [];
    if (playList && playList.length > 0) {
        const first = playList[0];
        title = `${first.channel_name} ${first.name}`;
        itunes_category = first.channel_name;

        items = playList.map((item) => {
            const single = {
                title: `${item.name} ${item.broadcast_date}`,
                link: 'http://' + item.stream_domain1 + item.stream_url1,
                description: `
                    <audio controls="controls">
                        <source src="http://${item.stream_domain1}${item.stream_url1}" type="audio/x-m4a">
                        <source src="http://${item.stream_domain2}${item.stream_url2}" type="audio/x-m4a">
                        <source src="http://${item.stream_domain3}${item.stream_url3}" type="audio/x-m4a">
                    </audio>
                    `,
                pubDate: item.update_time,
                guid: item.id,
                itunes_item_image: 'http://www.radio.cn/pc-portal/image/icon_32.jpg',
                enclosure_url: 'http://' + item.stream_domain1 + item.stream_url1,
                enclosure_length: item.resource_length,
                enclosure_type: 'audio/x-m4a',
            };
            return single;
        });
    }

    ctx.state.data = {
        title,
        link: `http://www.radio.cn/pc-portal/sanji/zhibo_2.html?channelname=${channelname}&name=${name}&title=radio`,
        description: title,
        image: 'http://www.radio.cn/pc-portal/image/icon_32.jpg',
        itunes_author: 'radio.cn',
        itunes_category,
        item: items,
    };
};
