const got = require('@/utils/got');
const utils = require('./utils');

module.exports = async (ctx) => {
    const site = ctx.params.site;
    const account_id = ctx.params.account_id;
    const only_media = ctx.params.only_media ? true : false;

    const statuses_url = `http://${site}/api/v1/accounts/${account_id}/statuses`;
    const statuses_response = await got({
        method: 'get',
        url: statuses_url,
    });
    let data = statuses_response.data;

    let account_data;
    if (data.length !== 0 && data[0].account !== null) {
        account_data = data[0].account;
    } else {
        const account_url = `http://${site}/api/v1/accounts/${account_id}`;
        const account_response = await got({
            method: 'get',
            url: account_url,
        });
        account_data = account_response.data;
    }

    if (only_media === true) {
        data = data.filter((item) => item.media_attachments.length !== 0);
    }

    ctx.state.data = {
        title: `${account_data.display_name} (@${account_data.acct})`,
        link: `${account_data.url}`,
        description: `${account_data.note}`,
        item: utils.ProcessFeed(data),
        allowEmpty: true,
    };
};
