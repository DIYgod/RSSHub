const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const url = 'https://xueqiu.com/p/' + id;

    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;
    const pattern = /SNB.cubeInfo = (.+?);/;
    const info = pattern.exec(data)[1];
    const obj = JSON.parse(info);
    const rebalancing_histories = obj.sell_rebalancing.rebalancing_histories;
    const snb_title = obj.name + ' 的调仓历史';
    const snb_description = obj.description;

    const title = obj.name + ' 的上一笔调仓';
    let description = '';
    for (const some_detail of rebalancing_histories) {
        const prev_weight_adjusted = some_detail.prev_weight_adjusted ? some_detail.prev_weight_adjusted : 0;
        description += some_detail.stock_name + ' from ' + prev_weight_adjusted + ' to ' + some_detail.target_weight + '，\n';
    }
    const time = obj.sell_rebalancing.updated_at;

    const single = {
        title,
        description,
        pubDate: new Date(time).toUTCString(),
        link: url,
        guid: `xueqiu::snb::${id}::${time}`,
    };

    ctx.state.data = {
        title: snb_title,
        link: url,
        description: snb_description,
        item: [single],
    };
};
