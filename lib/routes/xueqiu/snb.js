import got from '~/utils/got.js';

export default async (ctx) => {
    const {
        id
    } = ctx.params;
    const url = 'https://xueqiu.com/p/' + id;

    const {
        data
    } = await got({
        method: 'get',
        url,
    });
    const pattern = /SNB.cubeInfo = (.+?);/;
    const info = pattern.exec(data)[1];
    const obj = JSON.parse(info);
    const {
        rebalancing_histories
    } = obj.sell_rebalancing;
    const snb_title = obj.name + ' 的调仓历史';
    const snb_description = obj.description;

    const title = obj.name + ' 的上一笔调仓';
    let description = '';
    for (const some_detail of rebalancing_histories) {
        const {
            prev_weight_adjusted = 0
        } = some_detail;
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
