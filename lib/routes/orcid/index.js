const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id || '';
    const rootUrl = 'https://orcid.org/';
    const currentUrl = `${rootUrl}${id ? `${id}/worksPage.json?offset=0&sort=date&sortAsc=false&pageSize=20` : ''}`;
    const response = await got.get(currentUrl);

    const items = response.data.groups;
    const works = new Array;
     const out = new Array;

    for (let i = 0; i < items.length; i++) {
        for (let j = 0; j < items[i].works.length; j++) {
            works.push(items[i].works[j]);
        }
    }

    works.map((work) => {
        let publicationDate = `${work.publicationDate.year ? `${work.publicationDate.year}-`: ``}${work.publicationDate.month}${work.publicationDate.day ? `-${work.publicationDate.day}` : ``}`;
        let Str = '';

        for (let l = 0; l < work.workExternalIdentifiers.length; l++) {
            if (work.workExternalIdentifiers[l].url) {
                Str = Str + work.workExternalIdentifiers[l].externalIdentifierType.value + ': ' + work.workExternalIdentifiers[l].externalIdentifierId.value + '(URL: ' + work.workExternalIdentifiers[l].url.value + ')<br>';
            } else {
                Str = Str + work.workExternalIdentifiers[l].externalIdentifierType.value + ': ' + work.workExternalIdentifiers[l].externalIdentifierId.value + '<br>';
            }
        }

        const info = {
            title: work.title.value,
            link: work.url,
            description: `<h2>${work.title.value}</h2><h3>${work.journalTitle.value}</h3><span>${publicationDate} | ${work.workType.value}</span><br><span>${Str}</span><span>Source: ${work.sourceName}`,
            guid: work.putCode.value,
        };
        out.push(info);
        return info;
    });

    ctx.state.data = {
        title: 'ORCID Works List',
        link: currentUrl,
        item: out,
    };
};
