import MarkdownIt from 'markdown-it';
import pMap from 'p-map';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const markdownIt = new MarkdownIt();

const query = /* GraphQL */ `
    query HacktivitySearchQuery($queryString: String!, $from: Int, $size: Int, $sort: SortInput!) {
        me {
            id
            __typename
        }
        search(index: CompleteHacktivityReportIndex, query_string: $queryString, from: $from, size: $size, sort: $sort) {
            __typename
            total_count
            nodes {
                __typename
                ... on HacktivityDocument {
                    id
                    _id
                    reporter {
                        id
                        username
                        name
                        __typename
                    }
                    cve_ids
                    cwe
                    severity_rating
                    upvoted: upvoted_by_current_user
                    public
                    report {
                        id
                        databaseId: _id
                        title
                        substate
                        url
                        disclosed_at
                        report_generated_content {
                            id
                            hacktivity_summary
                            __typename
                        }
                        __typename
                    }
                    votes
                    team {
                        id
                        handle
                        name
                        medium_profile_picture: profile_picture(size: medium)
                        url
                        currency
                        __typename
                    }
                    total_awarded_amount
                    latest_disclosable_action
                    latest_disclosable_activity_at
                    submitted_at
                    disclosed
                    has_collaboration
                    collaborators {
                        id
                        username
                        name
                        __typename
                    }
                    __typename
                }
            }
        }
    }
`;

export async function fetchHacktivityEdges(querystring: string) {
    const response = await ofetch('https://hackerone.com/graphql', {
        method: 'POST',
        body: {
            operationName: 'HacktivitySearchQuery',
            variables: { queryString: querystring, size: 25, from: 0, sort: { field: 'latest_disclosable_activity_at', direction: 'DESC' }, product_area: 'hacktivity', product_feature: 'overview' },
            query,
        },
    });

    return response.data.search.nodes.filter((node) => node.report);
}

export function parseItem(item) {
    const author = item.reporter?.username;
    const summary = item.report.report_generated_content?.hacktivity_summary;
    const pubDate = item.latest_disclosable_activity_at ? parseDate(item.latest_disclosable_activity_at) : undefined;

    return {
        title: item.report.title,
        description: summary ? markdownIt.render(summary) : undefined,
        category: [item.team.name, item.report.substate, item.severity_rating, ...(item.cve_ids ?? [])].filter(Boolean),
        author,
        pubDate: pubDate && !Number.isNaN(pubDate.getTime()) ? pubDate : undefined,
        link: `https://hackerone.com/reports/${item.report.databaseId}`,
    };
}

export function parseItems(items: Array<Parameters<typeof parseItem>[0]>) {
    return pMap(
        items,
        async (item) => {
            const parsed = parseItem(item);
            if (parsed.description) {
                return parsed;
            }
            const body = await cache.tryGet(`hackerone:report-body:${item.report.databaseId}`, async () => {
                const report = await ofetch<{ vulnerability_information?: string; summaries?: Array<{ content?: string }> }>(`${parsed.link}.json`);
                const content =
                    report.vulnerability_information ||
                    report.summaries
                        ?.map((summary) => summary.content)
                        .filter(Boolean)
                        .join('\n\n');
                return { description: content ? markdownIt.render(content) : undefined };
            });
            return { ...parsed, ...body };
        },
        { concurrency: 3 }
    );
}
