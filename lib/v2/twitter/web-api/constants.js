// https://abs.twimg.com/responsive-web/client-web/main.3923c98a.js
const auth = 'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';

// https://abs.twimg.com/responsive-web/client-web/api.93c9167a.js
const graphQLEndpointsPlain = [
    '/graphql/SAMkL5y_N9pmahSw8yy6gw/UserByScreenName',
    '/graphql/i_0UQ54YrCyqLUvgGzXygA/UserByRestId',
    '/graphql/q94uRCEn65LZThakYcPT6g/TweetDetail',
    '/graphql/XicnWRbyQ3WgVY__VataBQ/UserTweets',
    '/graphql/uYU5M2i12UhDvDTzN6hZPg/UserTweetsAndReplies',
    '/graphql/fswZGPS7zuksnISWCMvz3Q/UserMedia',
    '/graphql/P_BKPwbhf2pWGbVaoBo7fg/Likes',
    '/graphql/NA567V_8AFwu0cZEkAAKcw/SearchTimeline',
    '/graphql/U7zYrkPyIa-iMORBINHzXw/ListLatestTweetsTimeline',
];

const graphQLMap = Object.fromEntries(graphQLEndpointsPlain.map((endpoint) => [endpoint.split('/')[3], endpoint]));

// captured from Twitter web
const featuresMap = {
    UserByScreenName: JSON.stringify({
        hidden_profile_likes_enabled: false,
        hidden_profile_subscriptions_enabled: true,
        responsive_web_graphql_exclude_directive_enabled: true,
        verified_phone_label_enabled: false,
        subscriptions_verification_info_is_identity_verified_enabled: false,
        subscriptions_verification_info_verified_since_enabled: true,
        highlights_tweets_tab_ui_enabled: true,
        creator_subscriptions_tweet_preview_api_enabled: true,
        responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
        responsive_web_graphql_timeline_navigation_enabled: true,
    }),
    UserByRestId: JSON.stringify({
        hidden_profile_likes_enabled: false,
        hidden_profile_subscriptions_enabled: true,
        responsive_web_graphql_exclude_directive_enabled: true,
        verified_phone_label_enabled: true,
        highlights_tweets_tab_ui_enabled: true,
        creator_subscriptions_tweet_preview_api_enabled: true,
        responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
        responsive_web_graphql_timeline_navigation_enabled: true,
    }),
    UserTweets: JSON.stringify({
        rweb_lists_timeline_redesign_enabled: true,
        responsive_web_graphql_exclude_directive_enabled: true,
        verified_phone_label_enabled: false,
        creator_subscriptions_tweet_preview_api_enabled: true,
        responsive_web_graphql_timeline_navigation_enabled: true,
        responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
        tweetypie_unmention_optimization_enabled: true,
        responsive_web_edit_tweet_api_enabled: true,
        graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
        view_counts_everywhere_api_enabled: true,
        longform_notetweets_consumption_enabled: true,
        responsive_web_twitter_article_tweet_consumption_enabled: false,
        tweet_awards_web_tipping_enabled: false,
        freedom_of_speech_not_reach_fetch_enabled: true,
        standardized_nudges_misinfo: true,
        tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
        longform_notetweets_rich_text_read_enabled: true,
        longform_notetweets_inline_media_enabled: true,
        responsive_web_media_download_video_enabled: false,
        responsive_web_enhance_cards_enabled: false,
    }),
};

module.exports = {
    auth,
    graphQLMap,
    featuresMap,
};
