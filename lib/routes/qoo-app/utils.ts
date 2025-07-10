import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const appsUrl = 'https://apps.qoo-app.com';
const newsUrl = 'https://news.qoo-app.com';
const notesUrl = 'https://notes.qoo-app.com';
const ssoUrl = 'https://sso.qoo-app.com';
const userUrl = 'https://user.qoo-app.com';

const siteIcon = 'https://o.qoo-img.com/statics.qoo-app.com/cdn/img/QooApp_512.v-0d0fd2.png';

const fixImg = ($) => {
    $('img').each((_, img) => {
        if (img.attribs['data-orig-file']) {
            img.attribs.src = img.attribs['data-orig-file'].replace('i0.wp.com/', '').split('?')[0];
            delete img.attribs['data-orig-file'];
            delete img.attribs['data-orig-size'];
            delete img.attribs['data-image-meta'];
            delete img.attribs['data-comments-opened'];
            delete img.attribs['data-full-url'];
            delete img.attribs['data-medium-file'];
            delete img.attribs['data-large-file'];
        }
        img.attribs.src = img.attribs.src.replace('i0.wp.com/', '').split('?')[0];
        delete img.attribs.srcset;
    });
};

const extractNotes = ($) => {
    $('.qoo-note-wrap')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('.qoo-note-view .content-title').text();
            const author = item.find('cite.name').text();
            const pubDate = timezone(parseDate(item.find('time').text(), 'YYYY-MM-DD HH:mm'), 8);
            item.find('cite.name, time, footer').remove();
            return {
                title,
                description: item.find('.qoo-note-view').html(),
                link: item.find('a.link-wrap').attr('href'),
                pubDate,
                author,
            };
        });
};

export { appsUrl, newsUrl, notesUrl, ssoUrl, userUrl, siteIcon, fixImg, extractNotes };
