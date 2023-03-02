const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const rootUrl = 'https://orcid.org/';
    const currentUrl = `${rootUrl}${id}/worksPage.json?offset=0&sort=date&sortAsc=false&pageSize=20`;
    const response = await got(currentUrl);

    const items = response.data.groups;
    const works = new Array();
    const out = new Array();

    for (let i = 0; i < items.length; i++) {
        for (let j = 0; j < items[i].works.length; j++) {
            works.push(items[i].works[j]);
        }
    }

    works.map((work) => {
        let Str = '';

        for (let l = 0; l < work.workExternalIdentifiers.length; l++) {
            if (work.workExternalIdentifiers[l].url) {
                Str += '<a href="' + work.workExternalIdentifiers[l].url.value + '">' + work.workExternalIdentifiers[l].externalIdentifierType.value + ': ' + work.workExternalIdentifiers[l].externalIdentifierId.value + '</a><br>';
            } else {
                Str += work.workExternalIdentifiers[l].externalIdentifierType.value + ': ' + work.workExternalIdentifiers[l].externalIdentifierId.value + '<br>';
            }
        }

        const info = {
            title: work.title.value,
            link: work.url,
            description: art(path.join(__dirname, 'templates/description.art'), {
                title: work.title.value,
                journalTitle: work.journalTitle?.value,
                publicationDate: work.publicationDate,
                workType: work.workType.value,
                Str,
                sourceName: work.sourceName,
            }),
            guid: work.putCode.value,
        };
        out.push(info);
        return info;
    });

    ctx.state.data = {
        title: 'ORCID Works List' + id,
        link: currentUrl,
        item: out,
    };
};
