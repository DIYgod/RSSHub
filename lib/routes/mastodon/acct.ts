import utils from './utils';

export default async (ctx) => {
    const acct = ctx.req.param('acct');
    const only_media = ctx.req.param('only_media') ? 'true' : 'false';

    const { site, account_id } = await utils.getAccountIdByAcct(acct);

    const { account_data, data } = await utils.getAccountStatuses(site, account_id, only_media);

    ctx.set('data', {
        title: `${account_data.display_name} (@${account_data.acct})`,
        link: account_data.url,
        description: account_data.note,
        item: utils.parseStatuses(data),
        allowEmpty: true,
    });
};
