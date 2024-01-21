const utils = require('./utils');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const site = ctx.params.site;
    const account_id = ctx.params.account_id;
    const only_media = ctx.params.only_media ? 'true' : 'false';
    if (!config.feature.allow_user_supply_unsafe_domain && !utils.allowSiteList.includes(site)) {
        ctx.throw(403, `This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }

    const { account_data, data } = await utils.getAccountStatuses(site, account_id, only_media);

    ctx.state.data = {
        title: `${account_data.display_name} (@${account_data.acct})`,
        link: account_data.url,
        description: account_data.note,
        item: utils.parseStatuses(data),
        allowEmpty: true,
    };
};
