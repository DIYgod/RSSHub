import { load } from 'cheerio';

import got from '@/utils/got';
import { parseDateStrict } from '@/utils/time';

export const newsContent = async (link, department = '') => {
    // Fetch the article.
    const { data: response } = await got(link);
    // Load the article content.
    const $ = load(response);
    let reg = /\d{4}(?:\/\d{2}){2}/;
    let element = '.newscontent';

    // Select the department-specific article layout.
    if (['xky', 'jwc', 'gfxy'].includes(department)) {
        reg = /\d{4}-\d{2}-\d{2}/;
        element = department === 'jwc' ? '.collection .edit' : '.content .edit';
    }

    // Parse the source publication date.
    const extractDate = ($('.info').html()?.match(reg) || [])[0];
    const pubDate = extractDate ? parseDateStrict(extractDate.replaceAll('/', '-'), 'YYYY-MM-DD', 8) : undefined;
    // Extract the main article content.
    const newsContent = $(element).first();
    if (!newsContent.length) {
        throw new Error(`Article content was not found at ${link}`);
    }
    let description = newsContent.html() ?? '';

    // Select the department-specific article layout.
    if (department === 'gfxy') {
        description = description.replace('点击下载文件:', '');
    }

    // Return the extracted article details.
    return { description, pubDate };
};
