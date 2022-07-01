const utils = require('./utils');

module.exports = async (ctx) => {
    const site = ctx.params.site;
    const account_id = ctx.params.account_id;
    const only_media = ctx.params.only_media ? 'true' : 'false';

    const { account_data, data } = await utils.getAccountStatuses(site, account_id, only_media);

    ctx.state.data = {
        title: `${account_data.display_name} (@${account_data.acct})`,
        link: account_data.url,
        description: account_data.note,
        item: utils.parseStatuses(data),
        allowEmpty: true,
    };
};
