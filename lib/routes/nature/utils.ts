import { load } from 'cheerio';
import { CookieJar } from 'tough-cookie';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.nature.com';

const fixFigure = (html) => {
    html('picture source').each((_, i) => {
        i = html(i);
        if (
            i.attr('srcset') &&
            (i.attr('srcset').startsWith('//media.springernature.com/lw685/') ||
                i.attr('srcset').startsWith('//media.springernature.com/m312/') ||
                i.attr('srcset').startsWith('//media.springernature.com/relative-r300-703_m1050/') ||
                i.attr('srcset').startsWith('//media.springernature.com/w300/'))
        ) {
            i.attr('srcset', i.attr('srcset').replace('//media.springernature.com/lw685/', '//media.springernature.com/full/'));
            i.attr('srcset', i.attr('srcset').replace('//media.springernature.com/m312/', '//media.springernature.com/full/'));
            i.attr('srcset', i.attr('srcset').replace('//media.springernature.com/relative-r300-703_m1050/', '//media.springernature.com/full/'));
            i.attr('srcset', i.attr('srcset').replace('//media.springernature.com/w300/', '//media.springernature.com/full/'));
        }
    });
    html('img').each((_, i) => {
        i = html(i);
        if (
            i.attr('src') &&
            (i.attr('src').startsWith('//media.springernature.com/lw685/') ||
                i.attr('src').startsWith('//media.springernature.com/m312/') ||
                i.attr('src').startsWith('//media.springernature.com/relative-r300-703_m1050/') ||
                i.attr('src').startsWith('//media.springernature.com/w300/'))
        ) {
            i.attr('src', i.attr('src').replace('//media.springernature.com/lw685/', '//media.springernature.com/full/'));
            i.attr('src', i.attr('src').replace('//media.springernature.com/m312/', '//media.springernature.com/full/'));
            i.attr('src', i.attr('src').replace('//media.springernature.com/relative-r300-703_m1050/', '//media.springernature.com/full/'));
            i.attr('src', i.attr('src').replace('//media.springernature.com/w300/', '//media.springernature.com/full/'));
        }
    });
};

const getArticleList = (html) =>
    html('.app-article-list-row__item')
        .toArray()
        .map((item) => {
            item = html(item);
            return {
                title: item.find('a').text(),
                link: baseUrl + item.find('a').attr('href'),
                pubDate: parseDate(item.find('.c-meta time').attr('datetime'), 'YYYY-MM-DD'),
            };
        });

const getArticle = (item) =>
    cache.tryGet(item.link, async () => {
        const response = await ofetch(item.link);

        const $ = load(response);

        if (new URL(item.link).pathname.startsWith('/immersive/')) {
            const meta = getDataLayer($);
            item.doi = meta.content.article?.doi;
            item.author = meta.content.contentInfo.authors.join(', ');
            item.pubDate = parseDate(meta.content.contentInfo.publishedAt, 'X') || item.pubDate;
        } else {
            const meta = JSON.parse($('script[type="application/ld+json"]').html());
            const freeAccess = meta.mainEntity.isAccessibleForFree;
            let description;

            if (meta.mainEntity.sameAs.startsWith('https://doi.org/')) {
                item.doi = meta.mainEntity.sameAs.replace('https://doi.org/', '');
            }
            item.author = meta.mainEntity.author.map((author) => author.name.replace(', ', ' ')).join(', ');
            item.category = meta.mainEntity.keywords;
            item.pubDate = parseDate(meta.mainEntity.datePublished) || item.pubDate;

            fixFigure($);

            $('section[data-recommended=jobs], span[data-recommended=jobs]').remove();
            $('#further-reading-section').remove();
            $('figure div.u-text-right.u-hide-print').remove();

            if (freeAccess) {
                description = $('.c-article-body').html();
            } else {
                $('div.c-article-access-provider, h2#access-options, div[data-component=entitlement-box],div[class^=LiveAreaSection-], nav.c-access-options').remove();
                description =
                    $('.c-article-body').html() ||
                    ($('.c-article-teaser-text').html() ?? '') + ($('div.u-clear-both.c-article-wide-figure').html() ?? '') + $('.article__teaser').html() + ($('.c-article-references__container').html() ?? '');
            }

            if ($('div.c-pdf-download').length) {
                // Please don't use meta[name=citation_pdf_url] because some of them point to an URL that needs to be logged in.
                // e.g., https://www.nature.com/articles/s41593-022-01079-5
                description += `<a href="${$('div.c-pdf-download a').attr('href')}">Download PDF</a>`;
            }

            item.description = description;
        }
        return item;
    });

const getDataLayer = (html) =>
    JSON.parse(
        html('script[data-test=dataLayer]')
            .text()
            .match(/window\.dataLayer = \[(.*)];/s)[1]
    );

const cookieJar = new CookieJar();

/**
 * This is generated by /nature/siteindex.debug.json
 */
const journalMap = {
    items: [
        {
            title: 'aps',
            name: 'Acta Pharmacologica Sinica',
            id: '41401',
            description: '41401',
        },
        {
            title: 'bdjinpractice',
            name: 'BDJ In Practice',
            id: '41404',
            description: '41404',
        },
        {
            title: 'bdjopen',
            name: 'BDJ Open',
        },
        {
            title: 'bdjstudent',
            name: 'BDJ Student',
            id: '41406',
            description: '41406',
        },
        {
            title: 'bdjteam',
            name: 'BDJ Team',
            id: '41407',
            description: '41407',
        },
        {
            title: 'biopharmdeal',
            name: 'Biopharma Dealmakers',
            id: '43747',
            description: '43747',
        },
        {
            title: 'bjcreports',
            name: 'BJC Reports',
        },
        {
            title: 'bcj',
            name: 'Blood Cancer Journal',
        },
        {
            title: 'bmt',
            name: 'Bone Marrow Transplantation',
            id: '41409',
            description: '41409',
        },
        {
            title: 'boneres',
            name: 'Bone Research',
        },
        {
            title: 'bdj',
            name: 'British Dental Journal',
            id: '41415',
            description: '41415',
        },
        {
            title: 'bjc',
            name: 'British Journal of Cancer',
            id: '41416',
            description: '41416',
        },
        {
            title: 'cgt',
            name: 'Cancer Gene Therapy',
            id: '41417',
            description: '41417',
        },
        {
            title: 'cdd',
            name: 'Cell Death & Differentiation',
            id: '41418',
            description: '41418',
        },
        {
            title: 'cddis',
            name: 'Cell Death & Disease',
        },
        {
            title: 'cddiscovery',
            name: 'Cell Death Discovery',
        },
        {
            title: 'celldisc',
            name: 'Cell Discovery',
        },
        {
            title: 'cr',
            name: 'Cell Research',
            id: '41422',
            description: '41422',
        },
        {
            title: 'cmi',
            name: 'Cellular & Molecular Immunology',
            id: '41423',
            description: '41423',
        },
        {
            title: 'commsbio',
            name: 'Communications Biology',
        },
        {
            title: 'commschem',
            name: 'Communications Chemistry',
        },
        {
            title: 'commsenv',
            name: 'Communications Earth & Environment',
        },
        {
            title: 'commseng',
            name: 'Communications Engineering',
        },
        {
            title: 'commsmat',
            name: 'Communications Materials',
        },
        {
            title: 'commsmed',
            name: 'Communications Medicine',
        },
        {
            title: 'commsphys',
            name: 'Communications Physics',
        },
        {
            title: 'commspsychol',
            name: 'Communications Psychology',
        },
        {
            title: 'ejcn',
            name: 'European Journal of Clinical Nutrition',
            id: '41430',
            description: '41430',
        },
        {
            title: 'ejhg',
            name: 'European Journal of Human Genetics',
            id: '41431',
            description: '41431',
        },
        {
            title: 'ebd',
            name: 'Evidence-Based Dentistry',
            id: '41432',
            description: '41432',
        },
        {
            title: 'emm',
            name: 'Experimental & Molecular Medicine',
            id: '12276',
            description: '12276',
        },
        {
            title: 'eye',
            name: 'Eye',
            id: '41433',
            description: '41433',
        },
        {
            title: 'gt',
            name: 'Gene Therapy',
            id: '41434',
            description: '41434',
        },
        {
            title: 'gene',
            name: 'Genes & Immunity',
            id: '41435',
            description: '41435',
        },
        {
            title: 'hdy',
            name: 'Heredity',
            id: '41437',
            description: '41437',
        },
        {
            title: 'hgv',
            name: 'Human Genome Variation',
        },
        {
            title: 'palcomms',
            name: 'Humanities and Social Sciences Communications',
        },
        {
            title: 'hr',
            name: 'Hypertension Research',
            id: '41440',
            description: '41440',
        },
        {
            title: 'ijir',
            name: 'International Journal of Impotence Research',
            id: '41443',
            description: '41443',
        },
        {
            title: 'ijo',
            name: 'International Journal of Obesity',
            id: '41366',
            description: '41366',
        },
        {
            title: 'ijosup',
            name: 'International Journal of Obesity Supplements',
            id: '41367',
            description: '41367',
        },
        {
            title: 'ijos',
            name: 'International Journal of Oral Science',
        },
        {
            title: 'ismecomms',
            name: 'ISME Communications',
        },
        {
            title: 'ismej',
            name: 'The ISME Journal',
            id: '41396',
            description: '41396',
        },
        {
            title: 'ja',
            name: 'The Journal of Antibiotics',
            id: '41429',
            description: '41429',
        },
        {
            title: 'jes',
            name: 'Journal of Exposure Science & Environmental Epidemiology',
            id: '41370',
            description: '41370',
        },
        {
            title: 'jhg',
            name: 'Journal of Human Genetics',
            id: '10038',
            description: '10038',
        },
        {
            title: 'jhh',
            name: 'Journal of Human Hypertension',
            id: '41371',
            description: '41371',
        },
        {
            title: 'jp',
            name: 'Journal of Perinatology',
            id: '41372',
            description: '41372',
        },
        {
            title: 'laban',
            name: 'Lab Animal',
            id: '41684',
            description: '41684',
        },
        {
            title: 'labinvest',
            name: 'Laboratory Investigation',
            id: '41374',
            description: '41374',
        },
        {
            title: 'leu',
            name: 'Leukemia',
            id: '41375',
            description: '41375',
        },
        {
            title: 'leusup',
            name: 'Leukemia Supplements',
            id: '41376',
            description: '41376',
        },
        {
            title: 'lsa',
            name: 'Light: Science & Applications',
        },
        {
            title: 'micronano',
            name: 'Microsystems & Nanoengineering',
        },
        {
            title: 'modpathol',
            name: 'Modern Pathology',
            id: '41379',
            description: '41379',
        },
        {
            title: 'mp',
            name: 'Molecular Psychiatry',
            id: '41380',
            description: '41380',
        },
        {
            title: 'mi',
            name: 'Mucosal Immunology',
            id: '41385',
            description: '41385',
        },
        {
            title: 'nature',
            name: 'Nature',
        },
        {
            title: 'natafrica',
            name: 'Nature Africa',
        },
        {
            title: 'nataging',
            name: 'Nature Aging',
            id: '43587',
            description: '43587',
        },
        {
            title: 'natastron',
            name: 'Nature Astronomy',
            id: '41550',
            description: '41550',
        },
        {
            title: 'natbiomedeng',
            name: 'Nature Biomedical Engineering',
            id: '41551',
            description: '41551',
        },
        {
            title: 'nbt',
            name: 'Nature Biotechnology',
            id: '41587',
            description: '41587',
        },
        {
            title: 'natcancer',
            name: 'Nature Cancer',
            id: '43018',
            description: '43018',
        },
        {
            title: 'natcardiovascres',
            name: 'Nature Cardiovascular Research',
            id: '44161',
            description: '44161',
        },
        {
            title: 'natcatal',
            name: 'Nature Catalysis',
            id: '41929',
            description: '41929',
        },
        {
            title: 'ncb',
            name: 'Nature Cell Biology',
            id: '41556',
            description: '41556',
        },
        {
            title: 'nchembio',
            name: 'Nature Chemical Biology',
            id: '41589',
            description: '41589',
        },
        {
            title: 'natchemeng',
            name: 'Nature Chemical Engineering',
        },
        {
            title: 'nchem',
            name: 'Nature Chemistry',
            id: '41557',
            description: '41557',
        },
        {
            title: 'natcities',
            name: 'Nature Cities',
        },
        {
            title: 'nclimate',
            name: 'Nature Climate Change',
            id: '41558',
            description: '41558',
        },
        {
            title: 'ncomms',
            name: 'Nature Communications',
        },
        {
            title: 'natcomputsci',
            name: 'Nature Computational Science',
            id: '43588',
            description: '43588',
        },
        {
            title: 'ndigest',
            name: 'Nature Digest',
        },
        {
            title: 'natecolevol',
            name: 'Nature Ecology & Evolution',
            id: '41559',
            description: '41559',
        },
        {
            title: 'natelectron',
            name: 'Nature Electronics',
            id: '41928',
            description: '41928',
        },
        {
            title: 'nenergy',
            name: 'Nature Energy',
            id: '41560',
            description: '41560',
        },
        {
            title: 'natfood',
            name: 'Nature Food',
            id: '43016',
            description: '43016',
        },
        {
            title: 'ng',
            name: 'Nature Genetics',
            id: '41588',
            description: '41588',
        },
        {
            title: 'ngeo',
            name: 'Nature Geoscience',
            id: '41561',
            description: '41561',
        },
        {
            title: 'nathumbehav',
            name: 'Nature Human Behaviour',
            id: '41562',
            description: '41562',
        },
        {
            title: 'ni',
            name: 'Nature Immunology',
            id: '41590',
            description: '41590',
        },
        {
            title: 'natindia',
            name: 'Nature India',
        },
        {
            title: 'natitaly',
            name: 'Nature Italy',
        },
        {
            title: 'natmachintell',
            name: 'Nature Machine Intelligence',
            id: '42256',
            description: '42256',
        },
        {
            title: 'nmat',
            name: 'Nature Materials',
            id: '41563',
            description: '41563',
        },
        {
            title: 'nm',
            name: 'Nature Medicine',
            id: '41591',
            description: '41591',
        },
        {
            title: 'natmentalhealth',
            name: 'Nature Mental Health',
            id: '44220',
            description: '44220',
        },
        {
            title: 'natmetab',
            name: 'Nature Metabolism',
            id: '42255',
            description: '42255',
        },
        {
            title: 'nmeth',
            name: 'Nature Methods',
            id: '41592',
            description: '41592',
        },
        {
            title: 'nmicrobiol',
            name: 'Nature Microbiology',
            id: '41564',
            description: '41564',
        },
        {
            title: 'nnano',
            name: 'Nature Nanotechnology',
            id: '41565',
            description: '41565',
        },
        {
            title: 'neuro',
            name: 'Nature Neuroscience',
            id: '41593',
            description: '41593',
        },
        {
            title: 'nphoton',
            name: 'Nature Photonics',
            id: '41566',
            description: '41566',
        },
        {
            title: 'nphys',
            name: 'Nature Physics',
            id: '41567',
            description: '41567',
        },
        {
            title: 'nplants',
            name: 'Nature Plants',
            id: '41477',
            description: '41477',
        },
        {
            title: 'nprot',
            name: 'Nature Protocols',
            id: '41596',
            description: '41596',
        },
        {
            title: 'natrevbioeng',
            name: 'Nature Reviews Bioengineering',
            id: '44222',
            description: '44222',
        },
        {
            title: 'nrc',
            name: 'Nature Reviews Cancer',
            id: '41568',
            description: '41568',
        },
        {
            title: 'nrcardio',
            name: 'Nature Reviews Cardiology',
            id: '41569',
            description: '41569',
        },
        {
            title: 'natrevchem',
            name: 'Nature Reviews Chemistry',
            id: '41570',
            description: '41570',
        },
        {
            title: 'nrclinonc',
            name: 'Nature Reviews Clinical Oncology',
            id: '41571',
            description: '41571',
        },
        {
            title: 'nrdp',
            name: 'Nature Reviews Disease Primers',
        },
        {
            title: 'nrd',
            name: 'Nature Reviews Drug Discovery',
            id: '41573',
            description: '41573',
        },
        {
            title: 'natrevearthenviron',
            name: 'Nature Reviews Earth & Environment',
            id: '43017',
            description: '43017',
        },
        {
            title: 'natrevelectreng',
            name: 'Nature Reviews Electrical Engineering',
        },
        {
            title: 'nrendo',
            name: 'Nature Reviews Endocrinology',
            id: '41574',
            description: '41574',
        },
        {
            title: 'nrgastro',
            name: 'Nature Reviews Gastroenterology & Hepatology',
            id: '41575',
            description: '41575',
        },
        {
            title: 'nrg',
            name: 'Nature Reviews Genetics',
            id: '41576',
            description: '41576',
        },
        {
            title: 'nri',
            name: 'Nature Reviews Immunology',
            id: '41577',
            description: '41577',
        },
        {
            title: 'natrevmats',
            name: 'Nature Reviews Materials',
            id: '41578',
            description: '41578',
        },
        {
            title: 'nrmp',
            name: 'Nature Reviews Methods Primers',
        },
        {
            title: 'nrmicro',
            name: 'Nature Reviews Microbiology',
            id: '41579',
            description: '41579',
        },
        {
            title: 'nrm',
            name: 'Nature Reviews Molecular Cell Biology',
            id: '41580',
            description: '41580',
        },
        {
            title: 'nrneph',
            name: 'Nature Reviews Nephrology',
            id: '41581',
            description: '41581',
        },
        {
            title: 'nrneurol',
            name: 'Nature Reviews Neurology',
            id: '41582',
            description: '41582',
        },
        {
            title: 'nrn',
            name: 'Nature Reviews Neuroscience',
            id: '41583',
            description: '41583',
        },
        {
            title: 'natrevphys',
            name: 'Nature Reviews Physics',
            id: '42254',
            description: '42254',
        },
        {
            title: 'nrpsychol',
            name: 'Nature Reviews Psychology',
            id: '44159',
            description: '44159',
        },
        {
            title: 'nrrheum',
            name: 'Nature Reviews Rheumatology',
            id: '41584',
            description: '41584',
        },
        {
            title: 'nrurol',
            name: 'Nature Reviews Urology',
            id: '41585',
            description: '41585',
        },
        {
            title: 'nsmb',
            name: 'Nature Structural & Molecular Biology',
            id: '41594',
            description: '41594',
        },
        {
            title: 'natsustain',
            name: 'Nature Sustainability',
            id: '41893',
            description: '41893',
        },
        {
            title: 'natsynth',
            name: 'Nature Synthesis',
            id: '44160',
            description: '44160',
        },
        {
            title: 'natwater',
            name: 'Nature Water',
            id: '44221',
            description: '44221',
        },
        {
            title: 'npp',
            name: 'Neuropsychopharmacology',
            id: '41386',
            description: '41386',
        },
        {
            title: 'am',
            name: 'NPG Asia Materials',
        },
        {
            title: 'npj2dmaterials',
            name: 'npj 2D Materials and Applications',
        },
        {
            title: 'npjadvmanuf',
            name: 'npj Advanced Manufacturing',
        },
        {
            title: 'npjamd',
            name: 'npj Aging',
        },
        {
            title: 'npjamar',
            name: 'npj Antimicrobials and Resistance',
        },
        {
            title: 'npjbiodivers',
            name: 'npj Biodiversity',
        },
        {
            title: 'npjbiofilms',
            name: 'npj Biofilms and Microbiomes',
        },
        {
            title: 'npjbiolphysmech',
            name: 'npj Biological Physics and Mechanics',
        },
        {
            title: 'npjbts',
            name: 'npj Biological Timing and Sleep',
        },
        {
            title: 'npjbiosensing',
            name: 'npj Biosensing',
        },
        {
            title: 'npjbcancer',
            name: 'npj Breast Cancer',
        },
        {
            title: 'npjcardiohealth',
            name: 'npj Cardiovascular Health',
        },
        {
            title: 'npjcleanwater',
            name: 'npj Clean Water',
        },
        {
            title: 'npjclimataction',
            name: 'npj Climate Action',
        },
        {
            title: 'npjclimatsci',
            name: 'npj Climate and Atmospheric Science',
        },
        {
            title: 'npjcomplex',
            name: 'npj Complexity',
        },
        {
            title: 'npjcompumats',
            name: 'npj Computational Materials',
        },
        {
            title: 'npjdigitalmed',
            name: 'npj Digital Medicine',
        },
        {
            title: 'npjflexelectron',
            name: 'npj Flexible Electronics',
        },
        {
            title: 'npjgenmed',
            name: 'npj Genomic Medicine',
        },
        {
            title: 'npjimaging',
            name: 'npj Imaging',
        },
        {
            title: 'npjmatdeg',
            name: 'npj Materials Degradation',
        },
        {
            title: 'npjmatsustain',
            name: 'npj Materials Sustainability',
        },
        {
            title: 'npjmentalhealth',
            name: 'npj Mental Health Research',
        },
        {
            title: 'npjmetabhealth',
            name: 'npj Metabolic Health and Disease',
        },
        {
            title: 'npjmgrav',
            name: 'npj Microgravity',
        },
        {
            title: 'npjnanophoton',
            name: 'npj Nanophotonics',
        },
        {
            title: 'npjnathazards',
            name: 'npj Natural Hazards',
        },
        {
            title: 'npjoceansustain',
            name: 'npj Ocean Sustainability',
        },
        {
            title: 'npjparkd',
            name: "npj Parkinson's Disease",
        },
        {
            title: 'npjprecisiononcology',
            name: 'npj Precision Oncology',
        },
        {
            title: 'npjpcrm',
            name: 'npj Primary Care Respiratory Medicine',
        },
        {
            title: 'npjqi',
            name: 'npj Quantum Information',
        },
        {
            title: 'npjquantmats',
            name: 'npj Quantum Materials',
        },
        {
            title: 'npjregenmed',
            name: 'npj Regenerative Medicine',
        },
        {
            title: 'npjrobot',
            name: 'npj Robotics',
        },
        {
            title: 'npjscifood',
            name: 'npj Science of Food',
        },
        {
            title: 'npjscilearn',
            name: 'npj Science of Learning',
        },
        {
            title: 'npjspintronics',
            name: 'npj Spintronics',
        },
        {
            title: 'npjsustainagric',
            name: 'npj Sustainable Agriculture',
        },
        {
            title: 'npjsustainmobil',
            name: 'npj Sustainable Mobility and Transport',
        },
        {
            title: 'npjsba',
            name: 'npj Systems Biology and Applications',
        },
        {
            title: 'npjunconvcomput',
            name: 'npj Unconventional Computing',
        },
        {
            title: 'npjurbansustain',
            name: 'npj Urban Sustainability',
        },
        {
            title: 'npjvaccines',
            name: 'npj Vaccines',
        },
        {
            title: 'npjviruses',
            name: 'npj Viruses',
        },
        {
            title: 'npjwomenshealth',
            name: "npj Women's Health",
        },
        {
            title: 'dpn',
            name: 'NPP—Digital Psychiatry and Neuroscience',
        },
        {
            title: 'nutd',
            name: 'Nutrition & Diabetes',
        },
        {
            title: 'onc',
            name: 'Oncogene',
            id: '41388',
            description: '41388',
        },
        {
            title: 'oncsis',
            name: 'Oncogenesis',
        },
        {
            title: 'pr',
            name: 'Pediatric Research',
            id: '41390',
            description: '41390',
        },
        {
            title: 'tpj',
            name: 'The Pharmacogenomics Journal',
            id: '41397',
            description: '41397',
        },
        {
            title: 'pj',
            name: 'Polymer Journal',
            id: '41428',
            description: '41428',
        },
        {
            title: 'pcan',
            name: 'Prostate Cancer and Prostatic Diseases',
            id: '41391',
            description: '41391',
        },
        {
            title: 'npjschz',
            name: 'Schizophrenia',
        },
        {
            title: 'scientificamerican',
            name: 'Scientific American',
        },
        {
            title: 'scientificamericanmind',
            name: 'Scientific American Mind',
        },
        {
            title: 'sdata',
            name: 'Scientific Data',
        },
        {
            title: 'srep',
            name: 'Scientific Reports',
        },
        {
            title: 'sigtrans',
            name: 'Signal Transduction and Targeted Therapy',
        },
        {
            title: 'sc',
            name: 'Spinal Cord',
            id: '41393',
            description: '41393',
        },
        {
            title: 'scsandc',
            name: 'Spinal Cord Series and Cases',
        },
        {
            title: 'tp',
            name: 'Translational Psychiatry',
        },
    ],
};

export { baseUrl, cookieJar, getArticle, getArticleList, getDataLayer, journalMap };
