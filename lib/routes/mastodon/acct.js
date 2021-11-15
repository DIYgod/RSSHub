import utils from './utils.js';

export default async (ctx) => {
    const {
        acct
    } = ctx.params;
    const only_media = ctx.params.only_media ? 'true' : 'false';

    const { site, account_id } = await utils.getAccountIdByAcct(acct, ctx);

    const { account_data, data } = await utils.getAccountStatuses(site, account_id, only_media);

    ctx.state.data = {
        title: `${account_data.display_name} (@${account_data.acct})`,
        link: account_data.url,
        description: account_data.note,
        item: utils.parseStatuses(data),
        allowEmpty: true,
    };
};
