const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const parseDate = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id || '';
    const rootUrl = 'https://orcid.org/';
    const currentUrl = `${rootUrl}${id ? `${id}/worksPage.json?offset=0&sort=date&sortAsc=false&pageSize=2` : ''}`;
    const response = await got.get(currentUrl);
    
    const items = response.data.groups;
    const out = new Array;
    
    for (let i = 0; i < items.length; i++) {
        console.log(items[i].works);   
    }
};
