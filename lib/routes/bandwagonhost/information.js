const axios = require('../../utils/axios');
module.exports = async (ctx) => {
    const veid = ctx.params.veid;
    const api_key = ctx.params.api_key;
    const response = await axios({
        method: 'get',
        url: `https://api.64clouds.com/v1/getLiveServiceInfo?veid=${veid}&api_key=${api_key}`,
        headers: {
            Referer: `https://bandwagonhost.com/clientarea.php?action=products`,
        },
    });
    const data = response.data;
    const ve_status = data.ve_status; // 运行状态
    const ip_addresses = data.ip_addresses; // ip地址
    const plan_ram = (data.plan_ram / 1024 / 1024).toFixed(2); // 全部内存G
    const plan_disk = data.plan_disk / 1024 / 1024 / 1024; // 全部磁盘G
    const plan_monthly_data = data.plan_monthly_data / 1024 / 1024 / 1024; // 全部流量G
    const swap_total_kb = (data.swap_total_kb / 1024).toFixed(2); // 全部swap

    const mem_available_kb = (data.mem_available_kb / 1024).toFixed(2); // 内存可用G
    const swap_available_kb = (data.swap_available_kb / 1024).toFixed(2); // swap可用MB
    const ve_used_disk_space_b = (data.ve_used_disk_space_b / 1024 / 1024 / 1024).toFixed(2); // 磁盘使用G
    const data_counter = (data.data_counter / 1024 / 1024 / 1024).toFixed(2); // 流量使用G

    const all_title = ['RAM_USED', 'SWAP_USED', 'DISK_USED', 'CURRENT BANDWIDTH USED'];
    const all_stat = [plan_ram + 'MB', swap_total_kb + 'MB', plan_disk + 'GB', plan_monthly_data + 'GB'];
    const now_stat = [plan_ram - mem_available_kb + 'MB', swap_total_kb - swap_available_kb + 'MB', ve_used_disk_space_b + 'GB', data_counter + 'GB'];

    ctx.state.data = {
        title: 'Bandwagon Host Status',
        description: '搬瓦工服务器状态',
        link: 'https://bandwagonhost.com/clientarea.php?action=products',
        item: [
            {
                title: `Detailed Information`,
                description: `VPS STATE：${ve_status}<br>IP address：${ip_addresses}<br>${all_title[0]}：${now_stat[0]}/${all_stat[0]}<br>${all_title[1]}：${now_stat[1]}/${all_stat[1]}<br>${all_title[2]}：${now_stat[2]}/${
                    all_stat[2]
                }<br>${all_title[3]}：${now_stat[3]}/${all_stat[3]}`,
                pubDate: new Date().getTime.toUTCString,
                link: '#',
            },
        ],
    };
};
