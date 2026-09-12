import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

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
    const author = item.reporter ? item.reporter.username : 'Someone';
    const vendor = item.team.name;
    const state = item.report.substate.replaceAll(/^[a-z]/g, (L) => L.toUpperCase());
    const severity = item.severity_rating ? item.severity_rating.replaceAll(/^[a-z]/g, (L) => L.toUpperCase()) : 'No Rating';
    const awarded = item.total_awarded_amount ?? 0;

    return {
        title: item.report.title,
        description: `By ${author} to ${vendor} | ${state} | ${severity} | $${awarded}`,
        author,
        pubDate: parseDate(item.latest_disclosable_activity_at),
        link: `https://hackerone.com/reports/${item.report.databaseId}`,
    };
}
