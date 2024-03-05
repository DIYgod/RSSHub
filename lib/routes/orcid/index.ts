// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const id = ctx.req.param('id');
    const rootUrl = 'https://orcid.org/';
    const currentUrl = `${rootUrl}${id}/worksPage.json?offset=0&sort=date&sortAsc=false&pageSize=20`;
    const response = await got(currentUrl);

    const items = response.data.groups;
    const works = [];
    const out = [];

    for (const item of items) {
        for (let j = 0; j < item.works.length; j++) {
            works.push(item.works[j]);
        }
    }

    works.map((work) => {
        let Str = '';

        for (let l = 0; l < work.workExternalIdentifiers.length; l++) {
            Str += work.workExternalIdentifiers[l].url
                ? '<a href="' + work.workExternalIdentifiers[l].url.value + '">' + work.workExternalIdentifiers[l].externalIdentifierType.value + ': ' + work.workExternalIdentifiers[l].externalIdentifierId.value + '</a><br>'
                : work.workExternalIdentifiers[l].externalIdentifierType.value + ': ' + work.workExternalIdentifiers[l].externalIdentifierId.value + '<br>';
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

    ctx.set('data', {
        title: 'ORCID Works List' + id,
        link: currentUrl,
        item: out,
    });
};
