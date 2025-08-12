import { Route, ViewType } from '@/types';
import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';

export const route: Route = {
    path: '/ratings/:language?',
    categories: ['finance'],
    view: ViewType.Notifications,
    example: '/spglobal/ratings/en',
    parameters: {
        language: {
            description: '语言',
            options: [
                { value: 'zh', label: '中文' },
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Español' },
                { value: 'pt', label: 'Português' },
                { value: 'jp', label: '日本語' },
                { value: 'ru', label: 'Русский' },
                { value: 'ar', label: 'العربية' },
            ],
        },
    },
    radar: [
        {
            source: ['www.spglobal.com/ratings/:language'],
        },
    ],
    name: 'Ratings',
    description: `
| language | Description |
| ---   | ---   |
| zh | 中文 |
| en | English |
| es | Español |
| pt | Português |
| jp | 日本語 |
| ru | Русский |
| ar | العربية |
    `,
    maintainers: ['Cedaric'],
    handler,
};

async function handler(ctx) {
    const language = ctx.req.param('language');

    const responseData = await got(
        `https://www.spglobal.com/crownpeaksearchproxy.aspx?q=https%3A%2F%2Fsearchg2-restricted.crownpeak.net%2Fsandpglobal-spglobal-live%2Fselect%3Fq%3D*%253A*%26echoParams%3Dexplicit%26fl%3Dtitle%2Ccustom_i_article_id%2Ccustom_ss_theme%2Ccustom_ss_theme_full%2Ccustom_dt_meta_publish_date%2Ccustom_s_meta_location%20%2Ccustom_s_local_url%2Ccustom_s_tile_image%2Ccustom_s_cshtml_path%2Ccustom_s_sub_type%2Ccustom_s_meta_type%2Cscore%2Ccustom_s_division%2Ccustom_ss_contenttype%2Ccustom_ss_location%2Ccustom_ss_region%2Ccustom_ss_theme%2Ccustom_ss_author_thumbnails%2Ccustom_ss_authors%2Ccustom_ss_author_titles%2Ccustom_s_meta_videoid%2Ctaxonomy_tag_freeform%2Ccustom_ss_tags%2Ccustom_ss_freeform%26defType%3Dedismax%26wt%3Djson%26start%3D0%26rows%3D10%26fq%3Dcustom_s_type%3Aarticle%26fq%3Dcustom_s_sub_type%3A(%22blog%22%2C%20%22news%22%2C%20%22research%22%2C%20%22podcast%22%2C%20%22video%22%2C%20%22article%22%2C%20%22pdf%20details%22)%26fq%3Dcustom_s_division%3A%22Ratings%22%26fq%3Dcustom_s_region%3A%22${language}%22%26facet%3Dtrue%26facet.mincount%3D1%26facet.field%3Dcustom_ss_theme_full%26facet.limit%3D15%26sort%3Dcustom_dt_meta_publish_date%20desc%26f.custom_ss_theme_full.facet.sort%3Dindex`
    );

    const items = responseData?.data?.response?.docs || [];

    return {
        title: `S&P Global Ratings(${language})`,
        link: `https://www.spglobal.com/ratings/${language}/`,
        allowEmpty: true,
        item: items.map((x) => ({
            title: x.title,
            pubDate: parseDate(x.custom_dt_meta_publish_date),
            link: `https://www.spglobal.com${x.custom_s_local_url}`,
        })),
    };
}
