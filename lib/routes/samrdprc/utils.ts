import { type CheerioAPI, load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import ofetch from '@/utils/ofetch';

export const baseUrl = 'https://www.samrdprc.org.cn';

// Column pages only carry a placeholder script; the site renders the article list through its unit API with the script's queryData
export const loadList = async ($: CheerioAPI): Promise<CheerioAPI> => {
    const unit = $('script[querydata]');
    if (unit.length === 0) {
        throw new InvalidParameterError('This page has no article list. Use the path of a column list page on www.samrdprc.org.cn.');
    }

    const response = await ofetch(new URL(unit.attr('url')!, baseUrl).href, {
        query: JSON.parse(unit.attr('querydata')!.replaceAll("'", '"')),
    });

    return load(response.data.html);
};
