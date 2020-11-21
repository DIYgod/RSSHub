const got = require('@/utils/got');

module.exports = async (ctx) => {
    const category = ctx.params.category || 'daily'; // daily, emerging-tech, retail, marketing
    const title = {
        daily: 'MORNING',
        'emerging-tech': 'EMERGING TECH',
        retail: 'RETAIL',
        marketing: 'MARKETING',
    };
    const queryLang = `
         query IssuesSearch($issuesSearchPhrase: String!, $issuesSearchVerticalSlug: String, $issuesSearchFirst: Int, $issuesSearchAfter: String) {
             issuesSearch(
                 phrase: $issuesSearchPhrase
                 verticalSlug: $issuesSearchVerticalSlug
                 first: $issuesSearchFirst
                 after: $issuesSearchAfter
             ) {
                 ...ListGroupFragment
               }
         }
         
         fragment ListGroupFragment on IssueConnection {
           nodes {
               date
               subjectLine
               thumbnailText
               slug
               vertical {
                   slug
               }
           }
         }`;

    const response = await got({
        method: 'post',
        url: `https://api.morningbrew.com/graphql`,
        json: {
            operationName: 'IssuesSearch',
            variables: {
                issuesSearchPhrase: '',
                issuesSearchFirst: 20,
                issuesSearchVerticalSlug: category,
            },
            query: queryLang.replace(/\n/g, '\n'),
        },
    });

    const item = response.data.data.issuesSearch.nodes.map((item) => ({
        title: item.subjectLine,
        link: `https://www.morningbrew.com/${category}/${item.slug}`,
    }));

    ctx.state.data = {
        title: `morning brew - ${title[category]}`,
        link: `https://www.morningbrew.com/archive`,
        item,
    };
};
