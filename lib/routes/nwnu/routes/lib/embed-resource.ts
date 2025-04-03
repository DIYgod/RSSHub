import { load } from 'cheerio';

export function processEmbedPDF(baseurl: string, html: string) {
    const $ = load(html);

    $('div.wp_pdf_player').each(function () {
        const $div = $(this);
        const pdfsrc = $div.attr('pdfsrc') || '';
        const downloadUrl = new URL(pdfsrc, baseurl).href;
        const newDiv = `<p><a href=${downloadUrl} target="_blank">点击下载 PDF 文件资源</a></p>`;
        $div.replaceWith(newDiv);
    });
    return $.html();
}
