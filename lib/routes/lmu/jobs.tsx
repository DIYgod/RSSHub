import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const apiUrl = 'https://jobs.b-ite.com/api/v1/postings/search';

// Helper: find the display label for a value.
function findLabel(value: string, options: Array<{ value: string; label: string }>): string {
    const option = options.find((option) => option.value === value);
    return option?.label ?? value; // Fall back to the raw value if no match.
}

async function handler() {
    const { data: response } = await got.post(apiUrl, {
        json: {
            key: '7d4ebad4ecdfd3e99a89596c85c5e4be21cd9c12',
            channel: 0,
            locale: 'en',
            sort: {
                by: 'custom.bereich',
                order: 'asc',
            },
            origin: 'https://www.lmu.de/en/about-lmu/working-at-lmu/job-portal/academic-staff/',
            page: {
                offset: 0,
                num: 1000,
            },
            filter: {
                locale: {
                    in: ['en'],
                },
                'custom.beschaeftigtengruppe': {
                    in: ['02_wiss'],
                },
            },
        },
        headers: {
            'content-type': 'application/json',
            'bite-jobsapi-client': 'v5-20230925-9df79de',
        },
    });

    const jobPostings = response.jobPostings;
    const bereichOptions = response.fields['custom.bereich'].options;
    const verguetungOptions = response.fields['custom.verguetung'].options;

    const items = jobPostings.map((job) => {
        const pubDate = parseDate(job.createdOn, 'YYYY-MM-DDTHH:mm:ssZ');

        // Resolve Institution label.
        const institutionLabel = findLabel(job.custom.bereich, bereichOptions);
        const RemunerationGroupLabel = findLabel(job.custom.verguetung, verguetungOptions);

        const description = renderDescription(institutionLabel, RemunerationGroupLabel, job);

        return {
            title: job.title,
            link: job.url,
            description,
            pubDate,
        };
    });

    return {
        title: 'LMU Academic Staff Job Openings',
        link: 'https://www.lmu.de/en/about-lmu/working-at-lmu/job-portal/academic-staff/',
        item: items,
    };
}

const renderDescription = (institutionLabel: string, RemunerationGroupLabel: string, job): string =>
    renderToString(
        <>
            <p>
                <strong>Institution:</strong> {institutionLabel}
            </p>
            <p>
                <strong>Remuneration:</strong> {RemunerationGroupLabel}
            </p>
            <p>
                <strong>Application deadline:</strong> {job.endsOn}
            </p>
            <p>
                <strong>Job Details:</strong>
            </p>
            <p>
                <strong>About us:</strong>
            </p>
            {job.custom?.das_sind_wir || ''}
            <br />
            <p>
                <strong>Your qualifications:</strong>
            </p>
            {job.custom?.das_sind_sie || ''}
            <br />
            <p>
                <strong>Benefits:</strong>
            </p>
            {job.custom?.das_ist_unser_angebot || ''}
            <br />
            <p>
                <strong>Contact:</strong> {job.custom?.kontakt || ''}
            </p>
        </>
    );

export const route: Route = {
    path: '/jobs',
    name: 'Job Openings',
    url: 'lmu.de',
    example: '/lmu/jobs',
    maintainers: ['StarDxxx'],
    categories: ['university', 'study'],
    radar: [
        {
            source: ['www.lmu.de/en/about-lmu/working-at-lmu/job-portal/academic-staff/'],
            target: '/lmu/jobs',
        },
    ],
    description: 'RSS feed for LMU academic staff job openings.',
    handler,
};
