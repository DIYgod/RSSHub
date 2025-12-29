import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

export const route: Route = {
    path: '/:category?',
    categories: ['new-media'],
    example: '/thoughtco',
    parameters: { category: 'Category id, see below' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Category',
    maintainers: ['nczitzk'],
    handler,
    description: `#### Science, Tech, Math

| category         | id                         |
| ---------------- | -------------------------- |
| Science          | science-4132464            |
| Math             | math-4133545               |
| Social Sciences  | social-sciences-4133522    |
| Computer Science | computer-science-4133486   |
| Animals & Nature | animals-and-nature-4133421 |

#### Humanities

| category          | id                          |
| ----------------- | --------------------------- |
| History & Culture | history-and-culture-4133356 |
| Visual Arts       | visual-arts-4132957         |
| Literature        | literature-4133251          |
| English           | english-4688281             |
| Geography         | geography-4133035           |
| Philosophy        | philosophy-4133025          |
| Issues            | issues-4133022              |

#### Languages

| category                     | id               |
| ---------------------------- | ---------------- |
| English as a Second Language | esl-4133095      |
| Spanish                      | spanish-4133085  |
| French                       | french-4133079   |
| German                       | german-4133073   |
| Italian                      | italian-4133069  |
| Japanese                     | japanese-4133062 |
| Mandarin                     | mandarin-4133057 |
| Russian                      | russian-4175265  |

#### Resources

| category               | id                           |
| ---------------------- | ---------------------------- |
| For Students & Parents | for-students-parents-4132588 |
| For Educators          | for-educators-4132509        |
| For Adult Learners     | for-adult-learners-4132469   |

<details>
<summary>More categories</summary>

#### Science

| category          | id                          |
| ----------------- | --------------------------- |
| Chemistry         | chemistry-4133594           |
| Biology           | biology-4133580             |
| Physics           | physics-4133571             |
| Geology           | geology-4133564             |
| Astronomy         | astronomy-4133558           |
| Weather & Climate | weather-and-climate-4133550 |

#### Math

| category              | id                              |
| --------------------- | ------------------------------- |
| Math Tutorials        | math-tutorials-4133543          |
| Geometry              | geometry-4133540                |
| Arithmetic            | arithmetic-4133542              |
| Pre Algebra & Algebra | pre-algebra-and-algebra-4133541 |
| Statistics            | statistics-4133539              |
| Exponential Decay     | exponential-decay-4133528       |
| Worksheets By Grade   | worksheets-by-grade-4133526     |
| Resources             | math-resources-4133523          |

#### Social Sciences

| category    | id                  |
| ----------- | ------------------- |
| Psychology  | psychology-4160512  |
| Sociology   | sociology-4133515   |
| Archaeology | archaeology-4133504 |
| Economics   | economics-4133521   |
| Ergonomics  | ergonomics-4133492  |

#### Computer Science

| category               | id                               |
| ---------------------- | -------------------------------- |
| PHP Programming        | php-4133485                      |
| Perl                   | perl-4133481                     |
| Python                 | python-4133477                   |
| Java Programming       | java-programming-4133478         |
| Javascript Programming | javascript-programming-4133476   |
| Delphi Programming     | delphi-programming-4133475       |
| C & C++ Programming    | c-and-c-plus-programming-4133470 |
| Ruby Programming       | ruby-programming-4133469         |
| Visual Basic           | visual-basic-4133468             |

#### Animals and Nature

| category         | id                       |
| ---------------- | ------------------------ |
| Amphibians       | amphibians-4133418       |
| Birds            | birds-4133416            |
| Habitat Profiles | habitat-profiles-4133412 |
| Mammals          | mammals-4133411          |
| Reptiles         | reptiles-4133408         |
| Insects          | insects-4133406          |
| Marine Life      | marine-life-4133393      |
| Forestry         | forestry-4133386         |
| Dinosaurs        | dinosaurs-4133376        |
| Evolution        | evolution-4133366        |

#### History and Culture

| category                       | id                                       |
| ------------------------------ | ---------------------------------------- |
| American History               | american-history-4133354                 |
| African American History       | african-american-history-4133344         |
| African History                | african-history-4133338                  |
| Ancient History and Culture    | ancient-history-4133336                  |
| Asian History                  | asian-history-4133325                    |
| European History               | european-history-4133316                 |
| Genealogy                      | genealogy-4133308                        |
| Inventions                     | inventions-4133303                       |
| Latin American History         | latin-american-history-4133296           |
| Medieval & Renaissance History | medieval-and-renaissance-history-4133289 |
| Military History               | military-history-4133285                 |
| The 20th Century               | 20th-century-4133273                     |
| Women's History                | womens-history-4133260                   |

#### Visual Arts

| category      | id                   |
| ------------- | -------------------- |
| Art & Artists | art-4132956          |
| Architecture  | architecture-4132953 |

#### Literature

| category           | id                         |
| ------------------ | -------------------------- |
| Best Sellers       | best-sellers-4133250       |
| Classic Literature | classic-literature-4133245 |
| Plays & Drama      | plays-and-drama-4133239    |
| Poetry             | poetry-4133232             |
| Quotations         | quotations-4133229         |
| Shakespeare        | shakespeare-4133223        |
| Short Stories      | short-stories-4133217      |
| Children's Books   | childrens-books-4133216    |

#### English

| category        | id                      |
| --------------- | ----------------------- |
| English Grammar | english-grammar-4133049 |
| Writing         | writing-4133048         |

#### Geography

| category                 | id                                 |
| ------------------------ | ---------------------------------- |
| Basics                   | geography-basics-4133034           |
| Physical Geography       | physical-geography-4133032         |
| Political Geography      | political-geography-4133033        |
| Population               | population-4133031                 |
| Country Information      | country-information-4133030        |
| Key Figures & Milestones | key-figures-and-milestones-4133029 |
| Maps                     | maps-4133027                       |
| Urban Geography          | urban-geography-4133026            |

#### Philosophy

| category                       | id                                       |
| ------------------------------ | ---------------------------------------- |
| Philosophical Theories & Ideas | philosophical-theories-and-ideas-4133024 |
| Major Philosophers             | major-philosophers-4133023               |

#### Issues

| category                          | id                               |
| --------------------------------- | -------------------------------- |
| The U. S. Government              | us-government-4133021            |
| U.S. Foreign Policy               | us-foreign-policy-4133010        |
| U.S. Liberal Politics             | us-liberal-politics-4133009      |
| U.S. Conservative Politics        | us-conservative-politics-4133006 |
| Women's Issues                    | womens-issues-4133002            |
| Civil Liberties                   | civil-liberties-4132996          |
| The Middle East                   | middle-east-4132989              |
| Race Relations                    | race-relations-4132982           |
| Immigration                       | immigration-4132977              |
| Crime & Punishment                | crime-and-punishment-4132972     |
| Canadian Government               | canadian-government-4132959      |
| Understanding Types of Government | types-of-government-5179107      |

#### English as a Second Language

| category                     | id                                         |
| ---------------------------- | ------------------------------------------ |
| Pronunciation & Conversation | esl-pronunciation-and-conversation-4133093 |
| Vocabulary                   | esl-vocabulary-4133092                     |
| Writing Skills               | esl-writing-skills-4133091                 |
| Reading Comprehension        | esl-reading-comprehension-4133090          |
| Grammar                      | esl-grammar-4133089                        |
| Business English             | esl-business-english-4133088               |
| Resources for Teachers       | resources-for-esl-teachers-4133087         |

#### Spanish

| category          | id                                  |
| ----------------- | ----------------------------------- |
| History & Culture | spanish-history-and-culture-4133084 |
| Pronunciation     | spanish-pronunciation-4133083       |
| Vocabulary        | spanish-vocabulary-4133082          |
| Writing Skills    | spanish-writing-skills-4133081      |
| Grammar           | spanish-grammar-4133080             |

#### French

| category                     | id                                           |
| ---------------------------- | -------------------------------------------- |
| Pronunciation & Conversation | french-pronunciation-4133075                 |
| Vocabulary                   | french-vocabulary-4133076                    |
| Grammar                      | french-grammar-4133074                       |
| Resources For Teachers       | french-resources-for-french-teachers-4133077 |

#### German

| category                     | id                                 |
| ---------------------------- | ---------------------------------- |
| History & Culture            | german-history-and-culture-4133071 |
| Pronunciation & Conversation | german-pronunciation-4133070       |
| Vocabulary                   | german-vocabulary-4133068          |
| Grammar                      | german-grammar-4133067             |

#### Italian

| category          | id                                  |
| ----------------- | ----------------------------------- |
| History & Culture | italian-history-and-culture-4133065 |
| Vocabulary        | italian-vocabulary-4133061          |
| Grammar           | italian-grammar-4133063             |

#### Japanese

| category                      | id                                   |
| ----------------------------- | ------------------------------------ |
| History & Culture             | japanese-history-and-culture-4133058 |
| Essential Japanese Vocabulary | japanese-vocabulary-4133060          |
| Japanese Grammar              | japanese-grammar-4133056             |

#### Mandarin

| category                         | id                                       |
| -------------------------------- | ---------------------------------------- |
| Mandarin History and Culture     | mandarin-history-and-culture-4133054     |
| Pronunciation                    | mandarin-pronunciation-4133053           |
| Vocabulary                       | mandarin-vocabulary-4133052              |
| Understanding Chinese Characters | understanding-chinese-characters-4133051 |

#### Russian

| category | id              |
| -------- | --------------- |
| Russian  | russian-4175265 |

#### For Students & Parents

| category           | id                         |
| ------------------ | -------------------------- |
| Homework Help      | homework-help-4132587      |
| Private School     | private-school-4132514     |
| Test Prep          | test-prep-4132578          |
| College Admissions | college-admissions-4132565 |
| College Life       | college-life-4132553       |
| Graduate School    | graduate-school-4132543    |
| Business School    | business-school-4132536    |
| Law School         | law-school-4132527         |
| Distance Learning  | distance-learning-4132521  |

#### For Educators

| category             | id                            |
| -------------------- | ----------------------------- |
| Becoming A Teacher   | becoming-a-teacher-4132510    |
| Assessments & Tests  | assessments-and-tests-4132508 |
| Elementary Education | elementary-education-4132507  |
| Secondary Education  | secondary-education-4132504   |
| Special Education    | special-education-4132499     |
| Teaching             | teaching-4132488              |
| Homeschooling        | homeschooling-4132480         |

#### For Adult Learners

| category                | id                              |
| ----------------------- | ------------------------------- |
| Tips For Adult Students | tips-for-adult-students-4132468 |
| Getting Your Ged        | getting-your-ged-4132466        |
</details>`,
};

async function handler(ctx) {
    const { category = '' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;

    const rootUrl = 'https://www.thoughtco.com';
    const currentUrl = new URL(category, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('a[data-doc-id]')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('span.block-title').text(),
                link: new URL(item.prop('href'), rootUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                content('div.adslot').remove();
                content('div.sources-and-citation, .mntl-figure-caption svg').remove();
                content('div.figure-media').each((_, e) => {
                    e = $(e);

                    const image = e.find('img');

                    e.replaceWith(
                        renderDescription({
                            image: {
                                src: image.prop('data-src'),
                                width: image.prop('width'),
                                height: image.prop('height'),
                            },
                        })
                    );
                });

                item.title = content('meta[property="og:title"]').prop('content');
                item.description = renderDescription({
                    image: {
                        src: content('meta[property="og:image"]').prop('content'),
                    },
                    description: content('div.article-content').html(),
                });
                item.author = content('meta[name="sailthru.author"]').prop('content');
                item.category = [
                    ...new Set(
                        content('meta[name="parsely-tags"]')
                            .prop('content')
                            ?.split(/,/)
                            .map((c) => c.trim())
                    ),
                ];
                item.pubDate = parseDate(detailResponse.match(/"datePublished": "(.*?)"/)[1]);
                item.updated = parseDate(detailResponse.match(/"dateModified": "(.*?)"/)[1]);

                return item;
            })
        )
    );

    const author = $('meta[property="og:site_name"]').prop('content');
    const title = $('meta[property="og:title"]').prop('content');
    const icon = new URL($('link[rel="apple-touch-icon-precomposed"]').prop('href'), rootUrl).href;

    return {
        item: items,
        title: `${author}${title.startsWith(author) ? '' : ` - ${title}`}`,
        link: currentUrl,
        description: $('meta[property="og:description"]').prop('content'),
        language: $('html').prop('lang'),
        image: $('meta[property="og:image"]').prop('content'),
        icon,
        logo: icon,
        subtitle: $('meta[property="og:title"]').prop('content'),
        author,
    };
}
