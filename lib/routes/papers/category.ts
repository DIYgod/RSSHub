import { type Data, type DataItem, type Route, ViewType } from '@/types';

import { art } from '@/utils/render';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { type CheerioAPI, type Cheerio, type Element, load } from 'cheerio';
import { type Context } from 'hono';
import path from 'node:path';

export const handler = async (ctx: Context): Promise<Data> => {
    const { id } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '50', 10);

    const baseUrl: string = 'https://papers.cool';
    const targetUrl: string = new URL(`${id}?show=${limit}`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'en';

    const items: DataItem[] = $('div.paper')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            const title: string = $el.find('a.title-link').text();
            const pubDateStr: string | undefined = $el
                .find('p.date')
                .contents()
                .last()
                .text()
                ?.trim()
                ?.match(/(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})/)?.[1];
            const linkUrl: string | undefined = $el.find('a.title-link').attr('href');
            const categoryEls: Element[] = $el.find('p.subjects a').toArray();
            const categories: string[] = [...new Set(categoryEls.map((el) => $(el).text()).filter(Boolean))];
            const authorEls: Element[] = $el.find('p.authors a.author').toArray();
            const authors: DataItem['author'] = authorEls.map((authorEl) => {
                const $authorEl: Cheerio<Element> = $(authorEl);

                return {
                    name: $authorEl.text(),
                    url: $authorEl.attr('href'),
                    avatar: undefined,
                };
            });
            const doi: string = $el.attr('id') as string;
            const guid: string = `papers.cool-${doi}`;
            const upDatedStr: string | undefined = pubDateStr;

            let processedItem: DataItem = {
                title,
                pubDate: pubDateStr ? timezone(parseDate(pubDateStr), +0) : undefined,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                category: categories,
                author: authors,
                doi,
                guid,
                id: guid,
                updated: upDatedStr ? timezone(parseDate(upDatedStr), +0) : undefined,
                language,
            };

            const $enclosureEl: Cheerio<Element> = $el.find('a.title-pdf').first();
            const enclosureUrl: string | undefined = $enclosureEl.attr('onclick')?.match(/togglePdf\('.*?',\s'(.*?)',\sthis\)/)?.[1];

            if (enclosureUrl) {
                processedItem = {
                    ...processedItem,
                    enclosure_url: enclosureUrl,
                    enclosure_type: 'application/pdf',
                    enclosure_title: title,
                    enclosure_length: undefined,
                };
            }

            const description: string = art(path.join(__dirname, 'templates/description.art'), {
                pdfUrl: enclosureUrl,
                kimiUrl: `${targetUrl.replace(/[a-zA-Z0-9.]+$/, 'kimi')}?paper=${doi}`,
                authors,
                summary: $el.find('p.summary').text(),
            });

            processedItem = {
                ...processedItem,
                description,
                content: {
                    html: description,
                    text: description,
                },
            };

            return processedItem;
        })
        .filter((_): _ is DataItem => true);

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('meta[property="og:image"]').attr('content'),
        language,
        feedLink: `${targetUrl}/feed`,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/category/:id{.+}?',
    name: 'Category',
    url: 'papers.cool',
    maintainers: ['nczitzk', 'Muyun99'],
    handler,
    example: '/papers/category/arxiv/cs.AI',
    parameters: {
        id: {
            description: 'Category ID, can be found in URL',
        },
    },
    description: `:::tip
To subscribe to [Artificial Intelligence (cs.AI)](https://papers.cool/arxiv/cs.AI) (<https://papers.cool/arxiv/cs.AI>), extract \`arxiv/cs.AI\` from the URL as the \`category\` parameter. The resulting route will be [\`/papers/category/arxiv/cs.AI\`](https://rsshub.app/papers/category/arxiv/cs.AI).
:::

<details>
  <summary>More categories</summary>

#### [Astrophysics (astro-ph)](https://papers.cool/arxiv/astro-ph)

| [Astrophysics (astro-ph)](https://papers.cool/arxiv/astro-ph)       | [Astrophysics of Galaxies (astro-ph.GA)](https://papers.cool/arxiv/astro-ph.GA) | [Cosmology and Nongalactic Astrophysics (astro-ph.CO)](https://papers.cool/arxiv/astro-ph.CO) | [Earth and Planetary Astrophysics (astro-ph.EP)](https://papers.cool/arxiv/astro-ph.EP) | [High Energy Astrophysical Phenomena (astro-ph.HE)](https://papers.cool/arxiv/astro-ph.HE) |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [arxiv/astro-ph](https://rsshub.app/papers/category/arxiv/astro-ph) | [arxiv/astro-ph.GA](https://rsshub.app/papers/category/arxiv/astro-ph.GA)       | [arxiv/astro-ph.CO](https://rsshub.app/papers/category/arxiv/astro-ph.CO)                     | [arxiv/astro-ph.EP](https://rsshub.app/papers/category/arxiv/astro-ph.EP)               | [arxiv/astro-ph.HE](https://rsshub.app/papers/category/arxiv/astro-ph.HE)                  |

| [Instrumentation and Methods for Astrophysics (astro-ph.IM)](https://papers.cool/arxiv/astro-ph.IM) | [Solar and Stellar Astrophysics (astro-ph.SR)](https://papers.cool/arxiv/astro-ph.SR) |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [arxiv/astro-ph.IM](https://rsshub.app/papers/category/arxiv/astro-ph.IM)                           | [arxiv/astro-ph.SR](https://rsshub.app/papers/category/arxiv/astro-ph.SR)             |

#### [Condensed Matter (cond-mat)](https://papers.cool/arxiv/cond-mat)

| [Condensed Matter (cond-mat)](https://papers.cool/arxiv/cond-mat)   | [Disordered Systems and Neural Networks (cond-mat.dis-nn)](https://papers.cool/arxiv/cond-mat.dis-nn) | [Materials Science (cond-mat.mtrl-sci)](https://papers.cool/arxiv/cond-mat.mtrl-sci)  | [Mesoscale and Nanoscale Physics (cond-mat.mes-hall)](https://papers.cool/arxiv/cond-mat.mes-hall) | [Other Condensed Matter (cond-mat.other)](https://papers.cool/arxiv/cond-mat.other) |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [arxiv/cond-mat](https://rsshub.app/papers/category/arxiv/cond-mat) | [arxiv/cond-mat.dis-nn](https://rsshub.app/papers/category/arxiv/cond-mat.dis-nn)                     | [arxiv/cond-mat.mtrl-sci](https://rsshub.app/papers/category/arxiv/cond-mat.mtrl-sci) | [arxiv/cond-mat.mes-hall](https://rsshub.app/papers/category/arxiv/cond-mat.mes-hall)              | [arxiv/cond-mat.other](https://rsshub.app/papers/category/arxiv/cond-mat.other)     |

| [Quantum Gases (cond-mat.quant-gas)](https://papers.cool/arxiv/cond-mat.quant-gas)      | [Soft Condensed Matter (cond-mat.soft)](https://papers.cool/arxiv/cond-mat.soft) | [Statistical Mechanics (cond-mat.stat-mech)](https://papers.cool/arxiv/cond-mat.stat-mech) | [Strongly Correlated Electrons (cond-mat.str-el)](https://papers.cool/arxiv/cond-mat.str-el) | [Superconductivity (cond-mat.supr-con)](https://papers.cool/arxiv/cond-mat.supr-con)  |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [arxiv/cond-mat.quant-gas](https://rsshub.app/papers/category/arxiv/cond-mat.quant-gas) | [arxiv/cond-mat.soft](https://rsshub.app/papers/category/arxiv/cond-mat.soft)    | [arxiv/cond-mat.stat-mech](https://rsshub.app/papers/category/arxiv/cond-mat.stat-mech)    | [arxiv/cond-mat.str-el](https://rsshub.app/papers/category/arxiv/cond-mat.str-el)            | [arxiv/cond-mat.supr-con](https://rsshub.app/papers/category/arxiv/cond-mat.supr-con) |

#### [General Relativity and Quantum Cosmology (gr-qc)](https://papers.cool/arxiv/gr-qc)

| [General Relativity and Quantum Cosmology (gr-qc)](https://papers.cool/arxiv/gr-qc) |
| ----------------------------------------------------------------------------------- |
| [arxiv/gr-qc](https://rsshub.app/papers/category/arxiv/gr-qc)                       |

#### [High Energy Physics - Experiment (hep-ex)](https://papers.cool/arxiv/hep-ex)

| [High Energy Physics - Experiment (hep-ex)](https://papers.cool/arxiv/hep-ex) |
| ----------------------------------------------------------------------------- |
| [arxiv/hep-ex](https://rsshub.app/papers/category/arxiv/hep-ex)               |

#### [High Energy Physics - Lattice (hep-lat)](https://papers.cool/arxiv/hep-lat)

| [High Energy Physics - Lattice (hep-lat)](https://papers.cool/arxiv/hep-lat) |
| ---------------------------------------------------------------------------- |
| [arxiv/hep-lat](https://rsshub.app/papers/category/arxiv/hep-lat)            |

#### [High Energy Physics - Phenomenology (hep-ph)](https://papers.cool/arxiv/hep-ph)

| [High Energy Physics - Phenomenology (hep-ph)](https://papers.cool/arxiv/hep-ph) |
| -------------------------------------------------------------------------------- |
| [arxiv/hep-ph](https://rsshub.app/papers/category/arxiv/hep-ph)                  |

#### [High Energy Physics - Theory (hep-th)](https://papers.cool/arxiv/hep-th)

| [High Energy Physics - Theory (hep-th)](https://papers.cool/arxiv/hep-th) |
| ------------------------------------------------------------------------- |
| [arxiv/hep-th](https://rsshub.app/papers/category/arxiv/hep-th)           |

#### [Mathematical Physics (math-ph)](https://papers.cool/arxiv/math-ph)

| [Mathematical Physics (math-ph)](https://papers.cool/arxiv/math-ph) |
| ------------------------------------------------------------------- |
| [arxiv/math-ph](https://rsshub.app/papers/category/arxiv/math-ph)   |

#### [Nonlinear Sciences (nlin)](https://papers.cool/arxiv/nlin)

| [Nonlinear Sciences (nlin)](https://papers.cool/arxiv/nlin) | [Adaptation and Self-Organizing Systems (nlin.AO)](https://papers.cool/arxiv/nlin.AO) | [Cellular Automata and Lattice Gases (nlin.CG)](https://papers.cool/arxiv/nlin.CG) | [Chaotic Dynamics (nlin.CD)](https://papers.cool/arxiv/nlin.CD)   | [Exactly Solvable and Integrable Systems (nlin.SI)](https://papers.cool/arxiv/nlin.SI) |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [arxiv/nlin](https://rsshub.app/papers/category/arxiv/nlin) | [arxiv/nlin.AO](https://rsshub.app/papers/category/arxiv/nlin.AO)                     | [arxiv/nlin.CG](https://rsshub.app/papers/category/arxiv/nlin.CG)                  | [arxiv/nlin.CD](https://rsshub.app/papers/category/arxiv/nlin.CD) | [arxiv/nlin.SI](https://rsshub.app/papers/category/arxiv/nlin.SI)                      |

| [Pattern Formation and Solitons (nlin.PS)](https://papers.cool/arxiv/nlin.PS) |
| ----------------------------------------------------------------------------- |
| [arxiv/nlin.PS](https://rsshub.app/papers/category/arxiv/nlin.PS)             |

#### [Nuclear Experiment (nucl-ex)](https://papers.cool/arxiv/nucl-ex)

| [Nuclear Experiment (nucl-ex)](https://papers.cool/arxiv/nucl-ex) |
| ----------------------------------------------------------------- |
| [arxiv/nucl-ex](https://rsshub.app/papers/category/arxiv/nucl-ex) |

#### [Nuclear Theory (nucl-th)](https://papers.cool/arxiv/nucl-th)

| [Nuclear Theory (nucl-th)](https://papers.cool/arxiv/nucl-th)     |
| ----------------------------------------------------------------- |
| [arxiv/nucl-th](https://rsshub.app/papers/category/arxiv/nucl-th) |

#### [Physics (physics)](https://papers.cool/arxiv/physics)

| [Physics (physics)](https://papers.cool/arxiv/physics)            | [Accelerator Physics (physics.acc-ph)](https://papers.cool/arxiv/physics.acc-ph) | [Applied Physics (physics.app-ph)](https://papers.cool/arxiv/physics.app-ph)    | [Atmospheric and Oceanic Physics (physics.ao-ph)](https://papers.cool/arxiv/physics.ao-ph) | [Atomic and Molecular Clusters (physics.atm-clus)](https://papers.cool/arxiv/physics.atm-clus) |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| [arxiv/physics](https://rsshub.app/papers/category/arxiv/physics) | [arxiv/physics.acc-ph](https://rsshub.app/papers/category/arxiv/physics.acc-ph)  | [arxiv/physics.app-ph](https://rsshub.app/papers/category/arxiv/physics.app-ph) | [arxiv/physics.ao-ph](https://rsshub.app/papers/category/arxiv/physics.ao-ph)              | [arxiv/physics.atm-clus](https://rsshub.app/papers/category/arxiv/physics.atm-clus)            |

| [Atomic Physics (physics.atom-ph)](https://papers.cool/arxiv/physics.atom-ph)     | [Biological Physics (physics.bio-ph)](https://papers.cool/arxiv/physics.bio-ph) | [Chemical Physics (physics.chem-ph)](https://papers.cool/arxiv/physics.chem-ph)   | [Classical Physics (physics.class-ph)](https://papers.cool/arxiv/physics.class-ph)  | [Computational Physics (physics.comp-ph)](https://papers.cool/arxiv/physics.comp-ph) |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [arxiv/physics.atom-ph](https://rsshub.app/papers/category/arxiv/physics.atom-ph) | [arxiv/physics.bio-ph](https://rsshub.app/papers/category/arxiv/physics.bio-ph) | [arxiv/physics.chem-ph](https://rsshub.app/papers/category/arxiv/physics.chem-ph) | [arxiv/physics.class-ph](https://rsshub.app/papers/category/arxiv/physics.class-ph) | [arxiv/physics.comp-ph](https://rsshub.app/papers/category/arxiv/physics.comp-ph)    |

| [Data Analysis, Statistics and Probability (physics.data-an)](https://papers.cool/arxiv/physics.data-an) | [Fluid Dynamics (physics.flu-dyn)](https://papers.cool/arxiv/physics.flu-dyn)     | [General Physics (physics.gen-ph)](https://papers.cool/arxiv/physics.gen-ph)    | [Geophysics (physics.geo-ph)](https://papers.cool/arxiv/physics.geo-ph)         | [History and Philosophy of Physics (physics.hist-ph)](https://papers.cool/arxiv/physics.hist-ph) |
| -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| [arxiv/physics.data-an](https://rsshub.app/papers/category/arxiv/physics.data-an)                        | [arxiv/physics.flu-dyn](https://rsshub.app/papers/category/arxiv/physics.flu-dyn) | [arxiv/physics.gen-ph](https://rsshub.app/papers/category/arxiv/physics.gen-ph) | [arxiv/physics.geo-ph](https://rsshub.app/papers/category/arxiv/physics.geo-ph) | [arxiv/physics.hist-ph](https://rsshub.app/papers/category/arxiv/physics.hist-ph)                |

| [Instrumentation and Detectors (physics.ins-det)](https://papers.cool/arxiv/physics.ins-det) | [Medical Physics (physics.med-ph)](https://papers.cool/arxiv/physics.med-ph)    | [Optics (physics.optics)](https://papers.cool/arxiv/physics.optics)             | [Physics and Society (physics.soc-ph)](https://papers.cool/arxiv/physics.soc-ph) | [Physics Education (physics.ed-ph)](https://papers.cool/arxiv/physics.ed-ph)  |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [arxiv/physics.ins-det](https://rsshub.app/papers/category/arxiv/physics.ins-det)            | [arxiv/physics.med-ph](https://rsshub.app/papers/category/arxiv/physics.med-ph) | [arxiv/physics.optics](https://rsshub.app/papers/category/arxiv/physics.optics) | [arxiv/physics.soc-ph](https://rsshub.app/papers/category/arxiv/physics.soc-ph)  | [arxiv/physics.ed-ph](https://rsshub.app/papers/category/arxiv/physics.ed-ph) |

| [Plasma Physics (physics.plasm-ph)](https://papers.cool/arxiv/physics.plasm-ph)     | [Popular Physics (physics.pop-ph)](https://papers.cool/arxiv/physics.pop-ph)    | [Space Physics (physics.space-ph)](https://papers.cool/arxiv/physics.space-ph)      |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [arxiv/physics.plasm-ph](https://rsshub.app/papers/category/arxiv/physics.plasm-ph) | [arxiv/physics.pop-ph](https://rsshub.app/papers/category/arxiv/physics.pop-ph) | [arxiv/physics.space-ph](https://rsshub.app/papers/category/arxiv/physics.space-ph) |

#### [Quantum Physics (quant-ph)](https://papers.cool/arxiv/quant-ph)

| [Quantum Physics (quant-ph)](https://papers.cool/arxiv/quant-ph)    |
| ------------------------------------------------------------------- |
| [arxiv/quant-ph](https://rsshub.app/papers/category/arxiv/quant-ph) |

#### [Mathematics (math)](https://papers.cool/arxiv/math)

| [Mathematics (math)](https://papers.cool/arxiv/math)        | [Algebraic Geometry (math.AG)](https://papers.cool/arxiv/math.AG) | [Algebraic Topology (math.AT)](https://papers.cool/arxiv/math.AT) | [Analysis of PDEs (math.AP)](https://papers.cool/arxiv/math.AP)   | [Category Theory (math.CT)](https://papers.cool/arxiv/math.CT)    |
| ----------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| [arxiv/math](https://rsshub.app/papers/category/arxiv/math) | [arxiv/math.AG](https://rsshub.app/papers/category/arxiv/math.AG) | [arxiv/math.AT](https://rsshub.app/papers/category/arxiv/math.AT) | [arxiv/math.AP](https://rsshub.app/papers/category/arxiv/math.AP) | [arxiv/math.CT](https://rsshub.app/papers/category/arxiv/math.CT) |

| [Classical Analysis and ODEs (math.CA)](https://papers.cool/arxiv/math.CA) | [Combinatorics (math.CO)](https://papers.cool/arxiv/math.CO)      | [Commutative Algebra (math.AC)](https://papers.cool/arxiv/math.AC) | [Complex Variables (math.CV)](https://papers.cool/arxiv/math.CV)  | [Differential Geometry (math.DG)](https://papers.cool/arxiv/math.DG) |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------- | -------------------------------------------------------------------- |
| [arxiv/math.CA](https://rsshub.app/papers/category/arxiv/math.CA)          | [arxiv/math.CO](https://rsshub.app/papers/category/arxiv/math.CO) | [arxiv/math.AC](https://rsshub.app/papers/category/arxiv/math.AC)  | [arxiv/math.CV](https://rsshub.app/papers/category/arxiv/math.CV) | [arxiv/math.DG](https://rsshub.app/papers/category/arxiv/math.DG)    |

| [Dynamical Systems (math.DS)](https://papers.cool/arxiv/math.DS)  | [Functional Analysis (math.FA)](https://papers.cool/arxiv/math.FA) | [General Mathematics (math.GM)](https://papers.cool/arxiv/math.GM) | [General Topology (math.GN)](https://papers.cool/arxiv/math.GN)   | [Geometric Topology (math.GT)](https://papers.cool/arxiv/math.GT) |
| ----------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ | ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| [arxiv/math.DS](https://rsshub.app/papers/category/arxiv/math.DS) | [arxiv/math.FA](https://rsshub.app/papers/category/arxiv/math.FA)  | [arxiv/math.GM](https://rsshub.app/papers/category/arxiv/math.GM)  | [arxiv/math.GN](https://rsshub.app/papers/category/arxiv/math.GN) | [arxiv/math.GT](https://rsshub.app/papers/category/arxiv/math.GT) |

| [Group Theory (math.GR)](https://papers.cool/arxiv/math.GR)       | [History and Overview (math.HO)](https://papers.cool/arxiv/math.HO) | [Information Theory (math.IT)](https://papers.cool/arxiv/math.IT) | [K-Theory and Homology (math.KT)](https://papers.cool/arxiv/math.KT) | [Logic (math.LO)](https://papers.cool/arxiv/math.LO)              |
| ----------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------- |
| [arxiv/math.GR](https://rsshub.app/papers/category/arxiv/math.GR) | [arxiv/math.HO](https://rsshub.app/papers/category/arxiv/math.HO)   | [arxiv/math.IT](https://rsshub.app/papers/category/arxiv/math.IT) | [arxiv/math.KT](https://rsshub.app/papers/category/arxiv/math.KT)    | [arxiv/math.LO](https://rsshub.app/papers/category/arxiv/math.LO) |

| [Mathematical Physics (math.MP)](https://papers.cool/arxiv/math.MP) | [Metric Geometry (math.MG)](https://papers.cool/arxiv/math.MG)    | [Number Theory (math.NT)](https://papers.cool/arxiv/math.NT)      | [Numerical Analysis (math.NA)](https://papers.cool/arxiv/math.NA) | [Operator Algebras (math.OA)](https://papers.cool/arxiv/math.OA)  |
| ------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| [arxiv/math.MP](https://rsshub.app/papers/category/arxiv/math.MP)   | [arxiv/math.MG](https://rsshub.app/papers/category/arxiv/math.MG) | [arxiv/math.NT](https://rsshub.app/papers/category/arxiv/math.NT) | [arxiv/math.NA](https://rsshub.app/papers/category/arxiv/math.NA) | [arxiv/math.OA](https://rsshub.app/papers/category/arxiv/math.OA) |

| [Optimization and Control (math.OC)](https://papers.cool/arxiv/math.OC) | [Probability (math.PR)](https://papers.cool/arxiv/math.PR)        | [Quantum Algebra (math.QA)](https://papers.cool/arxiv/math.QA)    | [Representation Theory (math.RT)](https://papers.cool/arxiv/math.RT) | [Rings and Algebras (math.RA)](https://papers.cool/arxiv/math.RA) |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------- |
| [arxiv/math.OC](https://rsshub.app/papers/category/arxiv/math.OC)       | [arxiv/math.PR](https://rsshub.app/papers/category/arxiv/math.PR) | [arxiv/math.QA](https://rsshub.app/papers/category/arxiv/math.QA) | [arxiv/math.RT](https://rsshub.app/papers/category/arxiv/math.RT)    | [arxiv/math.RA](https://rsshub.app/papers/category/arxiv/math.RA) |

| [Spectral Theory (math.SP)](https://papers.cool/arxiv/math.SP)    | [Statistics Theory (math.ST)](https://papers.cool/arxiv/math.ST)  | [Symplectic Geometry (math.SG)](https://papers.cool/arxiv/math.SG) |
| ----------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| [arxiv/math.SP](https://rsshub.app/papers/category/arxiv/math.SP) | [arxiv/math.ST](https://rsshub.app/papers/category/arxiv/math.ST) | [arxiv/math.SG](https://rsshub.app/papers/category/arxiv/math.SG)  |

#### [Computer Science (cs)](https://papers.cool/arxiv/cs)

| [Computer Science (cs)](https://papers.cool/arxiv/cs)   | [Artificial Intelligence (cs.AI)](https://papers.cool/arxiv/cs.AI) | [Computation and Language (cs.CL)](https://papers.cool/arxiv/cs.CL) | [Computational Complexity (cs.CC)](https://papers.cool/arxiv/cs.CC) | [Computational Engineering, Finance, and Science (cs.CE)](https://papers.cool/arxiv/cs.CE) |
| ------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [arxiv/cs](https://rsshub.app/papers/category/arxiv/cs) | [arxiv/cs.AI](https://rsshub.app/papers/category/arxiv/cs.AI)      | [arxiv/cs.CL](https://rsshub.app/papers/category/arxiv/cs.CL)       | [arxiv/cs.CC](https://rsshub.app/papers/category/arxiv/cs.CC)       | [arxiv/cs.CE](https://rsshub.app/papers/category/arxiv/cs.CE)                              |

| [Computational Geometry (cs.CG)](https://papers.cool/arxiv/cs.CG) | [Computer Science and Game Theory (cs.GT)](https://papers.cool/arxiv/cs.GT) | [Computer Vision and Pattern Recognition (cs.CV)](https://papers.cool/arxiv/cs.CV) | [Computers and Society (cs.CY)](https://papers.cool/arxiv/cs.CY) | [Cryptography and Security (cs.CR)](https://papers.cool/arxiv/cs.CR) |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------- |
| [arxiv/cs.CG](https://rsshub.app/papers/category/arxiv/cs.CG)     | [arxiv/cs.GT](https://rsshub.app/papers/category/arxiv/cs.GT)               | [arxiv/cs.CV](https://rsshub.app/papers/category/arxiv/cs.CV)                      | [arxiv/cs.CY](https://rsshub.app/papers/category/arxiv/cs.CY)    | [arxiv/cs.CR](https://rsshub.app/papers/category/arxiv/cs.CR)        |

| [Data Structures and Algorithms (cs.DS)](https://papers.cool/arxiv/cs.DS) | [Databases (cs.DB)](https://papers.cool/arxiv/cs.DB)          | [Digital Libraries (cs.DL)](https://papers.cool/arxiv/cs.DL)  | [Discrete Mathematics (cs.DM)](https://papers.cool/arxiv/cs.DM) | [Distributed, Parallel, and Cluster Computing (cs.DC)](https://papers.cool/arxiv/cs.DC) |
| ------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [arxiv/cs.DS](https://rsshub.app/papers/category/arxiv/cs.DS)             | [arxiv/cs.DB](https://rsshub.app/papers/category/arxiv/cs.DB) | [arxiv/cs.DL](https://rsshub.app/papers/category/arxiv/cs.DL) | [arxiv/cs.DM](https://rsshub.app/papers/category/arxiv/cs.DM)   | [arxiv/cs.DC](https://rsshub.app/papers/category/arxiv/cs.DC)                           |

| [Emerging Technologies (cs.ET)](https://papers.cool/arxiv/cs.ET) | [Formal Languages and Automata Theory (cs.FL)](https://papers.cool/arxiv/cs.FL) | [General Literature (cs.GL)](https://papers.cool/arxiv/cs.GL) | [Graphics (cs.GR)](https://papers.cool/arxiv/cs.GR)           | [Hardware Architecture (cs.AR)](https://papers.cool/arxiv/cs.AR) |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------- |
| [arxiv/cs.ET](https://rsshub.app/papers/category/arxiv/cs.ET)    | [arxiv/cs.FL](https://rsshub.app/papers/category/arxiv/cs.FL)                   | [arxiv/cs.GL](https://rsshub.app/papers/category/arxiv/cs.GL) | [arxiv/cs.GR](https://rsshub.app/papers/category/arxiv/cs.GR) | [arxiv/cs.AR](https://rsshub.app/papers/category/arxiv/cs.AR)    |

| [Human-Computer Interaction (cs.HC)](https://papers.cool/arxiv/cs.HC) | [Information Retrieval (cs.IR)](https://papers.cool/arxiv/cs.IR) | [Information Theory (cs.IT)](https://papers.cool/arxiv/cs.IT) | [Logic in Computer Science (cs.LO)](https://papers.cool/arxiv/cs.LO) | [Machine Learning (cs.LG)](https://papers.cool/arxiv/cs.LG)   |
| --------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------- |
| [arxiv/cs.HC](https://rsshub.app/papers/category/arxiv/cs.HC)         | [arxiv/cs.IR](https://rsshub.app/papers/category/arxiv/cs.IR)    | [arxiv/cs.IT](https://rsshub.app/papers/category/arxiv/cs.IT) | [arxiv/cs.LO](https://rsshub.app/papers/category/arxiv/cs.LO)        | [arxiv/cs.LG](https://rsshub.app/papers/category/arxiv/cs.LG) |

| [Mathematical Software (cs.MS)](https://papers.cool/arxiv/cs.MS) | [Multiagent Systems (cs.MA)](https://papers.cool/arxiv/cs.MA) | [Multimedia (cs.MM)](https://papers.cool/arxiv/cs.MM)         | [Networking and Internet Architecture (cs.NI)](https://papers.cool/arxiv/cs.NI) | [Neural and Evolutionary Computing (cs.NE)](https://papers.cool/arxiv/cs.NE) |
| ---------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [arxiv/cs.MS](https://rsshub.app/papers/category/arxiv/cs.MS)    | [arxiv/cs.MA](https://rsshub.app/papers/category/arxiv/cs.MA) | [arxiv/cs.MM](https://rsshub.app/papers/category/arxiv/cs.MM) | [arxiv/cs.NI](https://rsshub.app/papers/category/arxiv/cs.NI)                   | [arxiv/cs.NE](https://rsshub.app/papers/category/arxiv/cs.NE)                |

| [Numerical Analysis (cs.NA)](https://papers.cool/arxiv/cs.NA) | [Operating Systems (cs.OS)](https://papers.cool/arxiv/cs.OS)  | [Other Computer Science (cs.OH)](https://papers.cool/arxiv/cs.OH) | [Performance (cs.PF)](https://papers.cool/arxiv/cs.PF)        | [Programming Languages (cs.PL)](https://papers.cool/arxiv/cs.PL) |
| ------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------- |
| [arxiv/cs.NA](https://rsshub.app/papers/category/arxiv/cs.NA) | [arxiv/cs.OS](https://rsshub.app/papers/category/arxiv/cs.OS) | [arxiv/cs.OH](https://rsshub.app/papers/category/arxiv/cs.OH)     | [arxiv/cs.PF](https://rsshub.app/papers/category/arxiv/cs.PF) | [arxiv/cs.PL](https://rsshub.app/papers/category/arxiv/cs.PL)    |

| [Robotics (cs.RO)](https://papers.cool/arxiv/cs.RO)           | [Social and Information Networks (cs.SI)](https://papers.cool/arxiv/cs.SI) | [Software Engineering (cs.SE)](https://papers.cool/arxiv/cs.SE) | [Sound (cs.SD)](https://papers.cool/arxiv/cs.SD)              | [Symbolic Computation (cs.SC)](https://papers.cool/arxiv/cs.SC) |
| ------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------- |
| [arxiv/cs.RO](https://rsshub.app/papers/category/arxiv/cs.RO) | [arxiv/cs.SI](https://rsshub.app/papers/category/arxiv/cs.SI)              | [arxiv/cs.SE](https://rsshub.app/papers/category/arxiv/cs.SE)   | [arxiv/cs.SD](https://rsshub.app/papers/category/arxiv/cs.SD) | [arxiv/cs.SC](https://rsshub.app/papers/category/arxiv/cs.SC)   |

| [Systems and Control (cs.SY)](https://papers.cool/arxiv/cs.SY) |
| -------------------------------------------------------------- |
| [arxiv/cs.SY](https://rsshub.app/papers/category/arxiv/cs.SY)  |

#### [Quantitative Biology (q-bio)](https://papers.cool/arxiv/q-bio)

| [Quantitative Biology (q-bio)](https://papers.cool/arxiv/q-bio) | [Biomolecules (q-bio.BM)](https://papers.cool/arxiv/q-bio.BM)       | [Cell Behavior (q-bio.CB)](https://papers.cool/arxiv/q-bio.CB)      | [Genomics (q-bio.GN)](https://papers.cool/arxiv/q-bio.GN)           | [Molecular Networks (q-bio.MN)](https://papers.cool/arxiv/q-bio.MN) |
| --------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- |
| [arxiv/q-bio](https://rsshub.app/papers/category/arxiv/q-bio)   | [arxiv/q-bio.BM](https://rsshub.app/papers/category/arxiv/q-bio.BM) | [arxiv/q-bio.CB](https://rsshub.app/papers/category/arxiv/q-bio.CB) | [arxiv/q-bio.GN](https://rsshub.app/papers/category/arxiv/q-bio.GN) | [arxiv/q-bio.MN](https://rsshub.app/papers/category/arxiv/q-bio.MN) |

| [Neurons and Cognition (q-bio.NC)](https://papers.cool/arxiv/q-bio.NC) | [Other Quantitative Biology (q-bio.OT)](https://papers.cool/arxiv/q-bio.OT) | [Populations and Evolution (q-bio.PE)](https://papers.cool/arxiv/q-bio.PE) | [Quantitative Methods (q-bio.QM)](https://papers.cool/arxiv/q-bio.QM) | [Subcellular Processes (q-bio.SC)](https://papers.cool/arxiv/q-bio.SC) |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [arxiv/q-bio.NC](https://rsshub.app/papers/category/arxiv/q-bio.NC)    | [arxiv/q-bio.OT](https://rsshub.app/papers/category/arxiv/q-bio.OT)         | [arxiv/q-bio.PE](https://rsshub.app/papers/category/arxiv/q-bio.PE)        | [arxiv/q-bio.QM](https://rsshub.app/papers/category/arxiv/q-bio.QM)   | [arxiv/q-bio.SC](https://rsshub.app/papers/category/arxiv/q-bio.SC)    |

| [Tissues and Organs (q-bio.TO)](https://papers.cool/arxiv/q-bio.TO) |
| ------------------------------------------------------------------- |
| [arxiv/q-bio.TO](https://rsshub.app/papers/category/arxiv/q-bio.TO) |

#### [Quantitative Finance (q-fin)](https://papers.cool/arxiv/q-fin)

| [Quantitative Finance (q-fin)](https://papers.cool/arxiv/q-fin) | [Computational Finance (q-fin.CP)](https://papers.cool/arxiv/q-fin.CP) | [Economics (q-fin.EC)](https://papers.cool/arxiv/q-fin.EC)          | [General Finance (q-fin.GN)](https://papers.cool/arxiv/q-fin.GN)    | [Mathematical Finance (q-fin.MF)](https://papers.cool/arxiv/q-fin.MF) |
| --------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------- |
| [arxiv/q-fin](https://rsshub.app/papers/category/arxiv/q-fin)   | [arxiv/q-fin.CP](https://rsshub.app/papers/category/arxiv/q-fin.CP)    | [arxiv/q-fin.EC](https://rsshub.app/papers/category/arxiv/q-fin.EC) | [arxiv/q-fin.GN](https://rsshub.app/papers/category/arxiv/q-fin.GN) | [arxiv/q-fin.MF](https://rsshub.app/papers/category/arxiv/q-fin.MF)   |

| [Portfolio Management (q-fin.PM)](https://papers.cool/arxiv/q-fin.PM) | [Pricing of Securities (q-fin.PR)](https://papers.cool/arxiv/q-fin.PR) | [Risk Management (q-fin.RM)](https://papers.cool/arxiv/q-fin.RM)    | [Statistical Finance (q-fin.ST)](https://papers.cool/arxiv/q-fin.ST) | [Trading and Market Microstructure (q-fin.TR)](https://papers.cool/arxiv/q-fin.TR) |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [arxiv/q-fin.PM](https://rsshub.app/papers/category/arxiv/q-fin.PM)   | [arxiv/q-fin.PR](https://rsshub.app/papers/category/arxiv/q-fin.PR)    | [arxiv/q-fin.RM](https://rsshub.app/papers/category/arxiv/q-fin.RM) | [arxiv/q-fin.ST](https://rsshub.app/papers/category/arxiv/q-fin.ST)  | [arxiv/q-fin.TR](https://rsshub.app/papers/category/arxiv/q-fin.TR)                |

#### [Statistics (stat)](https://papers.cool/arxiv/stat)

| [Statistics (stat)](https://papers.cool/arxiv/stat)         | [Applications (stat.AP)](https://papers.cool/arxiv/stat.AP)       | [Computation (stat.CO)](https://papers.cool/arxiv/stat.CO)        | [Machine Learning (stat.ML)](https://papers.cool/arxiv/stat.ML)   | [Methodology (stat.ME)](https://papers.cool/arxiv/stat.ME)        |
| ----------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| [arxiv/stat](https://rsshub.app/papers/category/arxiv/stat) | [arxiv/stat.AP](https://rsshub.app/papers/category/arxiv/stat.AP) | [arxiv/stat.CO](https://rsshub.app/papers/category/arxiv/stat.CO) | [arxiv/stat.ML](https://rsshub.app/papers/category/arxiv/stat.ML) | [arxiv/stat.ME](https://rsshub.app/papers/category/arxiv/stat.ME) |

| [Other Statistics (stat.OT)](https://papers.cool/arxiv/stat.OT)   | [Statistics Theory (stat.TH)](https://papers.cool/arxiv/stat.TH)  |
| ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| [arxiv/stat.OT](https://rsshub.app/papers/category/arxiv/stat.OT) | [arxiv/stat.TH](https://rsshub.app/papers/category/arxiv/stat.TH) |

#### [Electrical Engineering and Systems Science (eess)](https://papers.cool/arxiv/eess)

| [Electrical Engineering and Systems Science (eess)](https://papers.cool/arxiv/eess) | [Audio and Speech Processing (eess.AS)](https://papers.cool/arxiv/eess.AS) | [Image and Video Processing (eess.IV)](https://papers.cool/arxiv/eess.IV) | [Signal Processing (eess.SP)](https://papers.cool/arxiv/eess.SP)  | [Systems and Control (eess.SY)](https://papers.cool/arxiv/eess.SY) |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| [arxiv/eess](https://rsshub.app/papers/category/arxiv/eess)                         | [arxiv/eess.AS](https://rsshub.app/papers/category/arxiv/eess.AS)          | [arxiv/eess.IV](https://rsshub.app/papers/category/arxiv/eess.IV)         | [arxiv/eess.SP](https://rsshub.app/papers/category/arxiv/eess.SP) | [arxiv/eess.SY](https://rsshub.app/papers/category/arxiv/eess.SY)  |

#### [Economics (econ)](https://papers.cool/arxiv/econ)

| [Economics (econ)](https://papers.cool/arxiv/econ)          | [Econometrics (econ.EM)](https://papers.cool/arxiv/econ.EM)       | [General Economics (econ.GN)](https://papers.cool/arxiv/econ.GN)  | [Theoretical Economics (econ.TH)](https://papers.cool/arxiv/econ.TH) |
| ----------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------- |
| [arxiv/econ](https://rsshub.app/papers/category/arxiv/econ) | [arxiv/econ.EM](https://rsshub.app/papers/category/arxiv/econ.EM) | [arxiv/econ.GN](https://rsshub.app/papers/category/arxiv/econ.GN) | [arxiv/econ.TH](https://rsshub.app/papers/category/arxiv/econ.TH)    |

</details>
`,
    categories: ['journal'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: true,
    },
    radar: [
        {
            source: ['papers.cool/:id{.+}'],
            target: '/category/:id',
        },
        {
            title: 'Astrophysics (astro-ph)',
            source: ['papers.cool/arxiv/astro-ph'],
            target: '/category/arxiv/astro-ph',
        },
        {
            title: 'Astrophysics of Galaxies (astro-ph.GA)',
            source: ['papers.cool/arxiv/astro-ph.GA'],
            target: '/category/arxiv/astro-ph.GA',
        },
        {
            title: 'Cosmology and Nongalactic Astrophysics (astro-ph.CO)',
            source: ['papers.cool/arxiv/astro-ph.CO'],
            target: '/category/arxiv/astro-ph.CO',
        },
        {
            title: 'Earth and Planetary Astrophysics (astro-ph.EP)',
            source: ['papers.cool/arxiv/astro-ph.EP'],
            target: '/category/arxiv/astro-ph.EP',
        },
        {
            title: 'High Energy Astrophysical Phenomena (astro-ph.HE)',
            source: ['papers.cool/arxiv/astro-ph.HE'],
            target: '/category/arxiv/astro-ph.HE',
        },
        {
            title: 'Instrumentation and Methods for Astrophysics (astro-ph.IM)',
            source: ['papers.cool/arxiv/astro-ph.IM'],
            target: '/category/arxiv/astro-ph.IM',
        },
        {
            title: 'Solar and Stellar Astrophysics (astro-ph.SR)',
            source: ['papers.cool/arxiv/astro-ph.SR'],
            target: '/category/arxiv/astro-ph.SR',
        },
        {
            title: 'Condensed Matter (cond-mat)',
            source: ['papers.cool/arxiv/cond-mat'],
            target: '/category/arxiv/cond-mat',
        },
        {
            title: 'Disordered Systems and Neural Networks (cond-mat.dis-nn)',
            source: ['papers.cool/arxiv/cond-mat.dis-nn'],
            target: '/category/arxiv/cond-mat.dis-nn',
        },
        {
            title: 'Materials Science (cond-mat.mtrl-sci)',
            source: ['papers.cool/arxiv/cond-mat.mtrl-sci'],
            target: '/category/arxiv/cond-mat.mtrl-sci',
        },
        {
            title: 'Mesoscale and Nanoscale Physics (cond-mat.mes-hall)',
            source: ['papers.cool/arxiv/cond-mat.mes-hall'],
            target: '/category/arxiv/cond-mat.mes-hall',
        },
        {
            title: 'Other Condensed Matter (cond-mat.other)',
            source: ['papers.cool/arxiv/cond-mat.other'],
            target: '/category/arxiv/cond-mat.other',
        },
        {
            title: 'Quantum Gases (cond-mat.quant-gas)',
            source: ['papers.cool/arxiv/cond-mat.quant-gas'],
            target: '/category/arxiv/cond-mat.quant-gas',
        },
        {
            title: 'Soft Condensed Matter (cond-mat.soft)',
            source: ['papers.cool/arxiv/cond-mat.soft'],
            target: '/category/arxiv/cond-mat.soft',
        },
        {
            title: 'Statistical Mechanics (cond-mat.stat-mech)',
            source: ['papers.cool/arxiv/cond-mat.stat-mech'],
            target: '/category/arxiv/cond-mat.stat-mech',
        },
        {
            title: 'Strongly Correlated Electrons (cond-mat.str-el)',
            source: ['papers.cool/arxiv/cond-mat.str-el'],
            target: '/category/arxiv/cond-mat.str-el',
        },
        {
            title: 'Superconductivity (cond-mat.supr-con)',
            source: ['papers.cool/arxiv/cond-mat.supr-con'],
            target: '/category/arxiv/cond-mat.supr-con',
        },
        {
            title: 'General Relativity and Quantum Cosmology (gr-qc)',
            source: ['papers.cool/arxiv/gr-qc'],
            target: '/category/arxiv/gr-qc',
        },
        {
            title: 'High Energy Physics - Experiment (hep-ex)',
            source: ['papers.cool/arxiv/hep-ex'],
            target: '/category/arxiv/hep-ex',
        },
        {
            title: 'High Energy Physics - Lattice (hep-lat)',
            source: ['papers.cool/arxiv/hep-lat'],
            target: '/category/arxiv/hep-lat',
        },
        {
            title: 'High Energy Physics - Phenomenology (hep-ph)',
            source: ['papers.cool/arxiv/hep-ph'],
            target: '/category/arxiv/hep-ph',
        },
        {
            title: 'High Energy Physics - Theory (hep-th)',
            source: ['papers.cool/arxiv/hep-th'],
            target: '/category/arxiv/hep-th',
        },
        {
            title: 'Mathematical Physics (math-ph)',
            source: ['papers.cool/arxiv/math-ph'],
            target: '/category/arxiv/math-ph',
        },
        {
            title: 'Nonlinear Sciences (nlin)',
            source: ['papers.cool/arxiv/nlin'],
            target: '/category/arxiv/nlin',
        },
        {
            title: 'Adaptation and Self-Organizing Systems (nlin.AO)',
            source: ['papers.cool/arxiv/nlin.AO'],
            target: '/category/arxiv/nlin.AO',
        },
        {
            title: 'Cellular Automata and Lattice Gases (nlin.CG)',
            source: ['papers.cool/arxiv/nlin.CG'],
            target: '/category/arxiv/nlin.CG',
        },
        {
            title: 'Chaotic Dynamics (nlin.CD)',
            source: ['papers.cool/arxiv/nlin.CD'],
            target: '/category/arxiv/nlin.CD',
        },
        {
            title: 'Exactly Solvable and Integrable Systems (nlin.SI)',
            source: ['papers.cool/arxiv/nlin.SI'],
            target: '/category/arxiv/nlin.SI',
        },
        {
            title: 'Pattern Formation and Solitons (nlin.PS)',
            source: ['papers.cool/arxiv/nlin.PS'],
            target: '/category/arxiv/nlin.PS',
        },
        {
            title: 'Nuclear Experiment (nucl-ex)',
            source: ['papers.cool/arxiv/nucl-ex'],
            target: '/category/arxiv/nucl-ex',
        },
        {
            title: 'Nuclear Theory (nucl-th)',
            source: ['papers.cool/arxiv/nucl-th'],
            target: '/category/arxiv/nucl-th',
        },
        {
            title: 'Physics (physics)',
            source: ['papers.cool/arxiv/physics'],
            target: '/category/arxiv/physics',
        },
        {
            title: 'Accelerator Physics (physics.acc-ph)',
            source: ['papers.cool/arxiv/physics.acc-ph'],
            target: '/category/arxiv/physics.acc-ph',
        },
        {
            title: 'Applied Physics (physics.app-ph)',
            source: ['papers.cool/arxiv/physics.app-ph'],
            target: '/category/arxiv/physics.app-ph',
        },
        {
            title: 'Atmospheric and Oceanic Physics (physics.ao-ph)',
            source: ['papers.cool/arxiv/physics.ao-ph'],
            target: '/category/arxiv/physics.ao-ph',
        },
        {
            title: 'Atomic and Molecular Clusters (physics.atm-clus)',
            source: ['papers.cool/arxiv/physics.atm-clus'],
            target: '/category/arxiv/physics.atm-clus',
        },
        {
            title: 'Atomic Physics (physics.atom-ph)',
            source: ['papers.cool/arxiv/physics.atom-ph'],
            target: '/category/arxiv/physics.atom-ph',
        },
        {
            title: 'Biological Physics (physics.bio-ph)',
            source: ['papers.cool/arxiv/physics.bio-ph'],
            target: '/category/arxiv/physics.bio-ph',
        },
        {
            title: 'Chemical Physics (physics.chem-ph)',
            source: ['papers.cool/arxiv/physics.chem-ph'],
            target: '/category/arxiv/physics.chem-ph',
        },
        {
            title: 'Classical Physics (physics.class-ph)',
            source: ['papers.cool/arxiv/physics.class-ph'],
            target: '/category/arxiv/physics.class-ph',
        },
        {
            title: 'Computational Physics (physics.comp-ph)',
            source: ['papers.cool/arxiv/physics.comp-ph'],
            target: '/category/arxiv/physics.comp-ph',
        },
        {
            title: 'Data Analysis, Statistics and Probability (physics.data-an)',
            source: ['papers.cool/arxiv/physics.data-an'],
            target: '/category/arxiv/physics.data-an',
        },
        {
            title: 'Fluid Dynamics (physics.flu-dyn)',
            source: ['papers.cool/arxiv/physics.flu-dyn'],
            target: '/category/arxiv/physics.flu-dyn',
        },
        {
            title: 'General Physics (physics.gen-ph)',
            source: ['papers.cool/arxiv/physics.gen-ph'],
            target: '/category/arxiv/physics.gen-ph',
        },
        {
            title: 'Geophysics (physics.geo-ph)',
            source: ['papers.cool/arxiv/physics.geo-ph'],
            target: '/category/arxiv/physics.geo-ph',
        },
        {
            title: 'History and Philosophy of Physics (physics.hist-ph)',
            source: ['papers.cool/arxiv/physics.hist-ph'],
            target: '/category/arxiv/physics.hist-ph',
        },
        {
            title: 'Instrumentation and Detectors (physics.ins-det)',
            source: ['papers.cool/arxiv/physics.ins-det'],
            target: '/category/arxiv/physics.ins-det',
        },
        {
            title: 'Medical Physics (physics.med-ph)',
            source: ['papers.cool/arxiv/physics.med-ph'],
            target: '/category/arxiv/physics.med-ph',
        },
        {
            title: 'Optics (physics.optics)',
            source: ['papers.cool/arxiv/physics.optics'],
            target: '/category/arxiv/physics.optics',
        },
        {
            title: 'Physics and Society (physics.soc-ph)',
            source: ['papers.cool/arxiv/physics.soc-ph'],
            target: '/category/arxiv/physics.soc-ph',
        },
        {
            title: 'Physics Education (physics.ed-ph)',
            source: ['papers.cool/arxiv/physics.ed-ph'],
            target: '/category/arxiv/physics.ed-ph',
        },
        {
            title: 'Plasma Physics (physics.plasm-ph)',
            source: ['papers.cool/arxiv/physics.plasm-ph'],
            target: '/category/arxiv/physics.plasm-ph',
        },
        {
            title: 'Popular Physics (physics.pop-ph)',
            source: ['papers.cool/arxiv/physics.pop-ph'],
            target: '/category/arxiv/physics.pop-ph',
        },
        {
            title: 'Space Physics (physics.space-ph)',
            source: ['papers.cool/arxiv/physics.space-ph'],
            target: '/category/arxiv/physics.space-ph',
        },
        {
            title: 'Quantum Physics (quant-ph)',
            source: ['papers.cool/arxiv/quant-ph'],
            target: '/category/arxiv/quant-ph',
        },
        {
            title: 'Mathematics (math)',
            source: ['papers.cool/arxiv/math'],
            target: '/category/arxiv/math',
        },
        {
            title: 'Algebraic Geometry (math.AG)',
            source: ['papers.cool/arxiv/math.AG'],
            target: '/category/arxiv/math.AG',
        },
        {
            title: 'Algebraic Topology (math.AT)',
            source: ['papers.cool/arxiv/math.AT'],
            target: '/category/arxiv/math.AT',
        },
        {
            title: 'Analysis of PDEs (math.AP)',
            source: ['papers.cool/arxiv/math.AP'],
            target: '/category/arxiv/math.AP',
        },
        {
            title: 'Category Theory (math.CT)',
            source: ['papers.cool/arxiv/math.CT'],
            target: '/category/arxiv/math.CT',
        },
        {
            title: 'Classical Analysis and ODEs (math.CA)',
            source: ['papers.cool/arxiv/math.CA'],
            target: '/category/arxiv/math.CA',
        },
        {
            title: 'Combinatorics (math.CO)',
            source: ['papers.cool/arxiv/math.CO'],
            target: '/category/arxiv/math.CO',
        },
        {
            title: 'Commutative Algebra (math.AC)',
            source: ['papers.cool/arxiv/math.AC'],
            target: '/category/arxiv/math.AC',
        },
        {
            title: 'Complex Variables (math.CV)',
            source: ['papers.cool/arxiv/math.CV'],
            target: '/category/arxiv/math.CV',
        },
        {
            title: 'Differential Geometry (math.DG)',
            source: ['papers.cool/arxiv/math.DG'],
            target: '/category/arxiv/math.DG',
        },
        {
            title: 'Dynamical Systems (math.DS)',
            source: ['papers.cool/arxiv/math.DS'],
            target: '/category/arxiv/math.DS',
        },
        {
            title: 'Functional Analysis (math.FA)',
            source: ['papers.cool/arxiv/math.FA'],
            target: '/category/arxiv/math.FA',
        },
        {
            title: 'General Mathematics (math.GM)',
            source: ['papers.cool/arxiv/math.GM'],
            target: '/category/arxiv/math.GM',
        },
        {
            title: 'General Topology (math.GN)',
            source: ['papers.cool/arxiv/math.GN'],
            target: '/category/arxiv/math.GN',
        },
        {
            title: 'Geometric Topology (math.GT)',
            source: ['papers.cool/arxiv/math.GT'],
            target: '/category/arxiv/math.GT',
        },
        {
            title: 'Group Theory (math.GR)',
            source: ['papers.cool/arxiv/math.GR'],
            target: '/category/arxiv/math.GR',
        },
        {
            title: 'History and Overview (math.HO)',
            source: ['papers.cool/arxiv/math.HO'],
            target: '/category/arxiv/math.HO',
        },
        {
            title: 'Information Theory (math.IT)',
            source: ['papers.cool/arxiv/math.IT'],
            target: '/category/arxiv/math.IT',
        },
        {
            title: 'K-Theory and Homology (math.KT)',
            source: ['papers.cool/arxiv/math.KT'],
            target: '/category/arxiv/math.KT',
        },
        {
            title: 'Logic (math.LO)',
            source: ['papers.cool/arxiv/math.LO'],
            target: '/category/arxiv/math.LO',
        },
        {
            title: 'Mathematical Physics (math.MP)',
            source: ['papers.cool/arxiv/math.MP'],
            target: '/category/arxiv/math.MP',
        },
        {
            title: 'Metric Geometry (math.MG)',
            source: ['papers.cool/arxiv/math.MG'],
            target: '/category/arxiv/math.MG',
        },
        {
            title: 'Number Theory (math.NT)',
            source: ['papers.cool/arxiv/math.NT'],
            target: '/category/arxiv/math.NT',
        },
        {
            title: 'Numerical Analysis (math.NA)',
            source: ['papers.cool/arxiv/math.NA'],
            target: '/category/arxiv/math.NA',
        },
        {
            title: 'Operator Algebras (math.OA)',
            source: ['papers.cool/arxiv/math.OA'],
            target: '/category/arxiv/math.OA',
        },
        {
            title: 'Optimization and Control (math.OC)',
            source: ['papers.cool/arxiv/math.OC'],
            target: '/category/arxiv/math.OC',
        },
        {
            title: 'Probability (math.PR)',
            source: ['papers.cool/arxiv/math.PR'],
            target: '/category/arxiv/math.PR',
        },
        {
            title: 'Quantum Algebra (math.QA)',
            source: ['papers.cool/arxiv/math.QA'],
            target: '/category/arxiv/math.QA',
        },
        {
            title: 'Representation Theory (math.RT)',
            source: ['papers.cool/arxiv/math.RT'],
            target: '/category/arxiv/math.RT',
        },
        {
            title: 'Rings and Algebras (math.RA)',
            source: ['papers.cool/arxiv/math.RA'],
            target: '/category/arxiv/math.RA',
        },
        {
            title: 'Spectral Theory (math.SP)',
            source: ['papers.cool/arxiv/math.SP'],
            target: '/category/arxiv/math.SP',
        },
        {
            title: 'Statistics Theory (math.ST)',
            source: ['papers.cool/arxiv/math.ST'],
            target: '/category/arxiv/math.ST',
        },
        {
            title: 'Symplectic Geometry (math.SG)',
            source: ['papers.cool/arxiv/math.SG'],
            target: '/category/arxiv/math.SG',
        },
        {
            title: 'Computer Science (cs)',
            source: ['papers.cool/arxiv/cs'],
            target: '/category/arxiv/cs',
        },
        {
            title: 'Artificial Intelligence (cs.AI)',
            source: ['papers.cool/arxiv/cs.AI'],
            target: '/category/arxiv/cs.AI',
        },
        {
            title: 'Computation and Language (cs.CL)',
            source: ['papers.cool/arxiv/cs.CL'],
            target: '/category/arxiv/cs.CL',
        },
        {
            title: 'Computational Complexity (cs.CC)',
            source: ['papers.cool/arxiv/cs.CC'],
            target: '/category/arxiv/cs.CC',
        },
        {
            title: 'Computational Engineering, Finance, and Science (cs.CE)',
            source: ['papers.cool/arxiv/cs.CE'],
            target: '/category/arxiv/cs.CE',
        },
        {
            title: 'Computational Geometry (cs.CG)',
            source: ['papers.cool/arxiv/cs.CG'],
            target: '/category/arxiv/cs.CG',
        },
        {
            title: 'Computer Science and Game Theory (cs.GT)',
            source: ['papers.cool/arxiv/cs.GT'],
            target: '/category/arxiv/cs.GT',
        },
        {
            title: 'Computer Vision and Pattern Recognition (cs.CV)',
            source: ['papers.cool/arxiv/cs.CV'],
            target: '/category/arxiv/cs.CV',
        },
        {
            title: 'Computers and Society (cs.CY)',
            source: ['papers.cool/arxiv/cs.CY'],
            target: '/category/arxiv/cs.CY',
        },
        {
            title: 'Cryptography and Security (cs.CR)',
            source: ['papers.cool/arxiv/cs.CR'],
            target: '/category/arxiv/cs.CR',
        },
        {
            title: 'Data Structures and Algorithms (cs.DS)',
            source: ['papers.cool/arxiv/cs.DS'],
            target: '/category/arxiv/cs.DS',
        },
        {
            title: 'Databases (cs.DB)',
            source: ['papers.cool/arxiv/cs.DB'],
            target: '/category/arxiv/cs.DB',
        },
        {
            title: 'Digital Libraries (cs.DL)',
            source: ['papers.cool/arxiv/cs.DL'],
            target: '/category/arxiv/cs.DL',
        },
        {
            title: 'Discrete Mathematics (cs.DM)',
            source: ['papers.cool/arxiv/cs.DM'],
            target: '/category/arxiv/cs.DM',
        },
        {
            title: 'Distributed, Parallel, and Cluster Computing (cs.DC)',
            source: ['papers.cool/arxiv/cs.DC'],
            target: '/category/arxiv/cs.DC',
        },
        {
            title: 'Emerging Technologies (cs.ET)',
            source: ['papers.cool/arxiv/cs.ET'],
            target: '/category/arxiv/cs.ET',
        },
        {
            title: 'Formal Languages and Automata Theory (cs.FL)',
            source: ['papers.cool/arxiv/cs.FL'],
            target: '/category/arxiv/cs.FL',
        },
        {
            title: 'General Literature (cs.GL)',
            source: ['papers.cool/arxiv/cs.GL'],
            target: '/category/arxiv/cs.GL',
        },
        {
            title: 'Graphics (cs.GR)',
            source: ['papers.cool/arxiv/cs.GR'],
            target: '/category/arxiv/cs.GR',
        },
        {
            title: 'Hardware Architecture (cs.AR)',
            source: ['papers.cool/arxiv/cs.AR'],
            target: '/category/arxiv/cs.AR',
        },
        {
            title: 'Human-Computer Interaction (cs.HC)',
            source: ['papers.cool/arxiv/cs.HC'],
            target: '/category/arxiv/cs.HC',
        },
        {
            title: 'Information Retrieval (cs.IR)',
            source: ['papers.cool/arxiv/cs.IR'],
            target: '/category/arxiv/cs.IR',
        },
        {
            title: 'Information Theory (cs.IT)',
            source: ['papers.cool/arxiv/cs.IT'],
            target: '/category/arxiv/cs.IT',
        },
        {
            title: 'Logic in Computer Science (cs.LO)',
            source: ['papers.cool/arxiv/cs.LO'],
            target: '/category/arxiv/cs.LO',
        },
        {
            title: 'Machine Learning (cs.LG)',
            source: ['papers.cool/arxiv/cs.LG'],
            target: '/category/arxiv/cs.LG',
        },
        {
            title: 'Mathematical Software (cs.MS)',
            source: ['papers.cool/arxiv/cs.MS'],
            target: '/category/arxiv/cs.MS',
        },
        {
            title: 'Multiagent Systems (cs.MA)',
            source: ['papers.cool/arxiv/cs.MA'],
            target: '/category/arxiv/cs.MA',
        },
        {
            title: 'Multimedia (cs.MM)',
            source: ['papers.cool/arxiv/cs.MM'],
            target: '/category/arxiv/cs.MM',
        },
        {
            title: 'Networking and Internet Architecture (cs.NI)',
            source: ['papers.cool/arxiv/cs.NI'],
            target: '/category/arxiv/cs.NI',
        },
        {
            title: 'Neural and Evolutionary Computing (cs.NE)',
            source: ['papers.cool/arxiv/cs.NE'],
            target: '/category/arxiv/cs.NE',
        },
        {
            title: 'Numerical Analysis (cs.NA)',
            source: ['papers.cool/arxiv/cs.NA'],
            target: '/category/arxiv/cs.NA',
        },
        {
            title: 'Operating Systems (cs.OS)',
            source: ['papers.cool/arxiv/cs.OS'],
            target: '/category/arxiv/cs.OS',
        },
        {
            title: 'Other Computer Science (cs.OH)',
            source: ['papers.cool/arxiv/cs.OH'],
            target: '/category/arxiv/cs.OH',
        },
        {
            title: 'Performance (cs.PF)',
            source: ['papers.cool/arxiv/cs.PF'],
            target: '/category/arxiv/cs.PF',
        },
        {
            title: 'Programming Languages (cs.PL)',
            source: ['papers.cool/arxiv/cs.PL'],
            target: '/category/arxiv/cs.PL',
        },
        {
            title: 'Robotics (cs.RO)',
            source: ['papers.cool/arxiv/cs.RO'],
            target: '/category/arxiv/cs.RO',
        },
        {
            title: 'Social and Information Networks (cs.SI)',
            source: ['papers.cool/arxiv/cs.SI'],
            target: '/category/arxiv/cs.SI',
        },
        {
            title: 'Software Engineering (cs.SE)',
            source: ['papers.cool/arxiv/cs.SE'],
            target: '/category/arxiv/cs.SE',
        },
        {
            title: 'Sound (cs.SD)',
            source: ['papers.cool/arxiv/cs.SD'],
            target: '/category/arxiv/cs.SD',
        },
        {
            title: 'Symbolic Computation (cs.SC)',
            source: ['papers.cool/arxiv/cs.SC'],
            target: '/category/arxiv/cs.SC',
        },
        {
            title: 'Systems and Control (cs.SY)',
            source: ['papers.cool/arxiv/cs.SY'],
            target: '/category/arxiv/cs.SY',
        },
        {
            title: 'Quantitative Biology (q-bio)',
            source: ['papers.cool/arxiv/q-bio'],
            target: '/category/arxiv/q-bio',
        },
        {
            title: 'Biomolecules (q-bio.BM)',
            source: ['papers.cool/arxiv/q-bio.BM'],
            target: '/category/arxiv/q-bio.BM',
        },
        {
            title: 'Cell Behavior (q-bio.CB)',
            source: ['papers.cool/arxiv/q-bio.CB'],
            target: '/category/arxiv/q-bio.CB',
        },
        {
            title: 'Genomics (q-bio.GN)',
            source: ['papers.cool/arxiv/q-bio.GN'],
            target: '/category/arxiv/q-bio.GN',
        },
        {
            title: 'Molecular Networks (q-bio.MN)',
            source: ['papers.cool/arxiv/q-bio.MN'],
            target: '/category/arxiv/q-bio.MN',
        },
        {
            title: 'Neurons and Cognition (q-bio.NC)',
            source: ['papers.cool/arxiv/q-bio.NC'],
            target: '/category/arxiv/q-bio.NC',
        },
        {
            title: 'Other Quantitative Biology (q-bio.OT)',
            source: ['papers.cool/arxiv/q-bio.OT'],
            target: '/category/arxiv/q-bio.OT',
        },
        {
            title: 'Populations and Evolution (q-bio.PE)',
            source: ['papers.cool/arxiv/q-bio.PE'],
            target: '/category/arxiv/q-bio.PE',
        },
        {
            title: 'Quantitative Methods (q-bio.QM)',
            source: ['papers.cool/arxiv/q-bio.QM'],
            target: '/category/arxiv/q-bio.QM',
        },
        {
            title: 'Subcellular Processes (q-bio.SC)',
            source: ['papers.cool/arxiv/q-bio.SC'],
            target: '/category/arxiv/q-bio.SC',
        },
        {
            title: 'Tissues and Organs (q-bio.TO)',
            source: ['papers.cool/arxiv/q-bio.TO'],
            target: '/category/arxiv/q-bio.TO',
        },
        {
            title: 'Quantitative Finance (q-fin)',
            source: ['papers.cool/arxiv/q-fin'],
            target: '/category/arxiv/q-fin',
        },
        {
            title: 'Computational Finance (q-fin.CP)',
            source: ['papers.cool/arxiv/q-fin.CP'],
            target: '/category/arxiv/q-fin.CP',
        },
        {
            title: 'Economics (q-fin.EC)',
            source: ['papers.cool/arxiv/q-fin.EC'],
            target: '/category/arxiv/q-fin.EC',
        },
        {
            title: 'General Finance (q-fin.GN)',
            source: ['papers.cool/arxiv/q-fin.GN'],
            target: '/category/arxiv/q-fin.GN',
        },
        {
            title: 'Mathematical Finance (q-fin.MF)',
            source: ['papers.cool/arxiv/q-fin.MF'],
            target: '/category/arxiv/q-fin.MF',
        },
        {
            title: 'Portfolio Management (q-fin.PM)',
            source: ['papers.cool/arxiv/q-fin.PM'],
            target: '/category/arxiv/q-fin.PM',
        },
        {
            title: 'Pricing of Securities (q-fin.PR)',
            source: ['papers.cool/arxiv/q-fin.PR'],
            target: '/category/arxiv/q-fin.PR',
        },
        {
            title: 'Risk Management (q-fin.RM)',
            source: ['papers.cool/arxiv/q-fin.RM'],
            target: '/category/arxiv/q-fin.RM',
        },
        {
            title: 'Statistical Finance (q-fin.ST)',
            source: ['papers.cool/arxiv/q-fin.ST'],
            target: '/category/arxiv/q-fin.ST',
        },
        {
            title: 'Trading and Market Microstructure (q-fin.TR)',
            source: ['papers.cool/arxiv/q-fin.TR'],
            target: '/category/arxiv/q-fin.TR',
        },
        {
            title: 'Statistics (stat)',
            source: ['papers.cool/arxiv/stat'],
            target: '/category/arxiv/stat',
        },
        {
            title: 'Applications (stat.AP)',
            source: ['papers.cool/arxiv/stat.AP'],
            target: '/category/arxiv/stat.AP',
        },
        {
            title: 'Computation (stat.CO)',
            source: ['papers.cool/arxiv/stat.CO'],
            target: '/category/arxiv/stat.CO',
        },
        {
            title: 'Machine Learning (stat.ML)',
            source: ['papers.cool/arxiv/stat.ML'],
            target: '/category/arxiv/stat.ML',
        },
        {
            title: 'Methodology (stat.ME)',
            source: ['papers.cool/arxiv/stat.ME'],
            target: '/category/arxiv/stat.ME',
        },
        {
            title: 'Other Statistics (stat.OT)',
            source: ['papers.cool/arxiv/stat.OT'],
            target: '/category/arxiv/stat.OT',
        },
        {
            title: 'Statistics Theory (stat.TH)',
            source: ['papers.cool/arxiv/stat.TH'],
            target: '/category/arxiv/stat.TH',
        },
        {
            title: 'Electrical Engineering and Systems Science (eess)',
            source: ['papers.cool/arxiv/eess'],
            target: '/category/arxiv/eess',
        },
        {
            title: 'Audio and Speech Processing (eess.AS)',
            source: ['papers.cool/arxiv/eess.AS'],
            target: '/category/arxiv/eess.AS',
        },
        {
            title: 'Image and Video Processing (eess.IV)',
            source: ['papers.cool/arxiv/eess.IV'],
            target: '/category/arxiv/eess.IV',
        },
        {
            title: 'Signal Processing (eess.SP)',
            source: ['papers.cool/arxiv/eess.SP'],
            target: '/category/arxiv/eess.SP',
        },
        {
            title: 'Systems and Control (eess.SY)',
            source: ['papers.cool/arxiv/eess.SY'],
            target: '/category/arxiv/eess.SY',
        },
        {
            title: 'Economics (econ)',
            source: ['papers.cool/arxiv/econ'],
            target: '/category/arxiv/econ',
        },
        {
            title: 'Econometrics (econ.EM)',
            source: ['papers.cool/arxiv/econ.EM'],
            target: '/category/arxiv/econ.EM',
        },
        {
            title: 'General Economics (econ.GN)',
            source: ['papers.cool/arxiv/econ.GN'],
            target: '/category/arxiv/econ.GN',
        },
        {
            title: 'Theoretical Economics (econ.TH)',
            source: ['papers.cool/arxiv/econ.TH'],
            target: '/category/arxiv/econ.TH',
        },
    ],
    view: ViewType.Articles,

    zh: {
        path: '/category/:id{.+}?',
        name: 'Category',
        url: 'papers.cool',
        maintainers: ['nczitzk'],
        handler,
        example: '/papers/arxiv/cs.AI',
        parameters: {
            id: {
                description: '分类 id，可在对应分类页 URL 中找到',
            },
        },
        description: `:::tip
订阅 [人工智能 (cs.AI)](https://papers.cool/arxiv/cs.AI)（<https://papers.cool/arxiv/cs.AI>），请从 URL 中提取 \`arxiv/cs.AI\` 作为 \`category\` 参数，得到的路由将是 [\`/papers/category/arxiv/cs.AI\`](https://rsshub.app/papers/category/arxiv/cs.AI)。
:::
`,
    },
};
