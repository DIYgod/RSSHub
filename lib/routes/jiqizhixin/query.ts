export const query = `query timelineInHome($category: String!, $type: String!, $count: Int, $cursor: String) {
  timelines(category: $category, type: $type, first: $count, after: $cursor) {
    ...Timeline
    __typename
  }
}

fragment Timeline on TimelineConnection {
  edges {
    node {
      id
      content_type
      content {
        ... on Article {
          ...ArticleInfo
          __typename
        }
        ... on Report {
          ...ReportItem
          __typename
        }
        ... on Topic {
          ...TopicItem
          __typename
        }
        ... on Periodical {
          title
          cover_image_url
          path
          __typename
        }
        ... on Event {
          ...EventItem
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
  pageInfo {
    ...PageInfo
    __typename
  }
  __typename
}

fragment PageInfo on PageInfo {
  endCursor
  hasNextPage
  __typename
}

fragment TopicItem on Topic {
  id
  title
  path
  category
  likes_count
  comments_count
  cover_image_url
  author {
    id
    name
    path
    __typename
  }
  __typename
}

fragment ArticleInfo on Article {
  ...ArticleSimple
  category_name
  category_path
  author {
    name
    id
    avatar_url
    path
    __typename
  }
  __typename
}

fragment ArticleSimple on Article {
  id
  path
  title
  cover_image_url
  published_at
  likes_count
  comments_count
  description
  __typename
}

fragment ReportItem on Report {
  id
  title
  description
  likes_count
  comments_count
  path
  created_at
  __typename
}

fragment EventItem on Event {
  id
  name
  description
  likes_count
  comments_count
  cover_image_url
  path
  __typename
}`;
