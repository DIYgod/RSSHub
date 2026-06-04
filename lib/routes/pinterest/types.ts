export interface BoardsFeedResource {
    node_id: string;
    name: string;
    created_at: string;
    section_count: number;
    images: BoardImages;
    image_cover_hd_url: string;
    archived_by_me_at: null;
    access: any[];
    image_cover_url: string;
    follower_count: number;
    event_date: null;
    should_show_shop_feed: boolean;
    should_show_board_collaborators: boolean;
    collaborator_requests_enabled: boolean;
    is_temporarily_disabled: boolean;
    collaborating_users: any[];
    followed_by_me: boolean;
    viewer_collaborator_join_requested: boolean;
    cover_pin: CoverPin;
    place_saves_count: number;
    board_order_modified_at: string;
    owner: Owner;
    allow_homefeed_recommendations: boolean;
    pin_count: number;
    collaborator_count: number;
    has_custom_cover: boolean;
    privacy: string;
    should_show_more_ideas: boolean;
    event_start_date: null;
    url: string;
    collaborated_by_me: boolean;
    is_collaborative: boolean;
    cover_images: CoverImages;
    is_ads_only: boolean;
    type: string;
    description: string;
}

interface BoardImages {
    '170x': ImageItem[];
}

interface Images {
    orig: ImageItem;
    [x: string]: ImageItem;
}

interface ImageItem {
    url: string;
    width: number;
    height: number;
    dominant_color: string;
}

interface CoverPin {
    pin_id: string;
    timestamp: number;
    image_signature: string;
    crop?: number[];
    size?: number[];
    scale?: number;
    image_url?: string;
    custom_cover?: boolean;
    image_size?: number[] | null;
}

interface Owner {
    node_id: string;
    explicitly_followed_by_me: boolean;
    is_partner: boolean;
    is_ads_only_profile: boolean;
    is_private_profile: boolean;
    ads_only_profile_site: null;
    domain_verified: boolean;
    type: string;
    image_medium_url: string;
    is_default_image: boolean;
    id: string;
    full_name: string;
    username: string;
    is_verified_merchant: boolean;
    verified_identity: object;
}

interface Pinner extends Owner {
    image_large_url: string;
    image_small_url: string;
}

interface CoverImages {
    '200x150': ImageItem;
    '222x': ImageItem;
}

export interface UserActivityPinsResource {
    node_id: string;
    is_stale_product: boolean;
    attribution: null;
    access: any[];
    images: Images;
    comment_count: number;
    digital_media_source_type: null;
    promoted_is_removable: boolean;
    is_eligible_for_pdp: boolean;
    sponsorship: null;
    story_pin_data_id: string;
    description_html: string;
    shopping_flags: any[];
    is_uploaded: boolean;
    campaign_id: null;
    is_playable: boolean;
    manual_interest_tags: null;
    video_status: null;
    seo_url: string;
    image_signature: string;
    is_eligible_for_web_closeup: boolean;
    ad_match_reason: number;
    is_oos_product: boolean;
    dominant_color: string;
    aggregated_pin_data: AggregatedPinData;
    creator_analytics: null;
    is_repin: boolean;
    done_by_me: boolean;
    board: Board;
    view_tags: any[];
    video_status_message: null;
    description: string;
    domain: string;
    is_downstream_promotion: boolean;
    is_video: boolean;
    promoter: null;
    embed: null;
    comments: Comments;
    collection_pin: null;
    is_promoted: boolean;
    grid_title: string;
    is_whitelisted_for_tried_it: boolean;
    promoted_is_lead_ad: boolean;
    debug_info_html: null;
    link: null;
    is_native: boolean;
    id: string;
    promoted_lead_form: null;
    type: string;
    rich_summary: null;
    title: string;
    alt_text: null;
    created_at: string;
    is_quick_promotable: boolean;
    pinner: Pinner;
    image_crop: ImageCrop;
    reaction_counts: object;
    tracking_params: string;
    is_eligible_for_related_products: boolean;
    product_pin_data: null;
    privacy: string;
    price_currency: string;
    has_required_attribution_provider: boolean;
    seo_title: string;
    price_value: number;
    insertion_id: null;
    seo_noindex_reason: null;
    carousel_data: null;
    videos: null;
    story_pin_data: StoryPinData;
    grid_description: string;
    repin_count: number;
    native_creator: Owner;
    should_open_in_stream: boolean;
    additional_hide_reasons: any[];
    method: string;
}

interface AggregatedPinData {
    node_id: string;
    is_shop_the_look: boolean;
    aggregated_stats: AggregatedStats;
    did_it_data: DidItData;
    creator_analytics: null;
    has_xy_tags: boolean;
    id: string;
}

interface AggregatedStats {
    saves: number;
    done: number;
}

interface DidItData {
    type: string;
    details_count: number;
    recommend_scores: RecommendScore[];
    rating: number;
    tags: any[];
    user_count: number;
    videos_count: number;
    images_count: number;
    recommended_count: number;
    responses_count: number;
}

interface RecommendScore {
    score: number;
    count: number;
}

interface Board {
    node_id: string;
    layout: string;
    type: string;
    privacy: string;
    followed_by_me: boolean;
    image_thumbnail_url: string;
    name: string;
    collaborated_by_me: boolean;
    owner: Owner;
    is_collaborative: boolean;
    url: string;
    id: string;
}

interface Comments {
    uri: string;
    data: any[];
    bookmark: null;
}

interface ImageCrop {
    min_y: number;
    max_y: number;
}

interface StoryPinData {
    node_id: string;
    page_count: number;
    type: string;
    has_affiliate_products: boolean;
    static_page_count: number;
    pages: Page[];
    metadata: Metadata;
    is_deleted: boolean;
    total_video_duration: number;
    pages_preview: PagePreview[];
    has_product_pins: boolean;
    id: string;
    last_edited: null;
}

interface Page {
    blocks: Block[];
}

interface Block {
    type: string;
    block_type: number;
    text: string;
    block_style: BlockStyle;
    image_signature: string;
    image: null;
    tracking_id: string;
}

interface BlockStyle {
    x_coord: number;
    corner_radius: number;
    rotation: number;
    height: number;
    width: number;
    y_coord: number;
}

interface Metadata {
    basics: null;
    is_compatible: boolean;
    root_user_id: string;
    canvas_aspect_ratio: number;
    diy_data: null;
    compatible_version: string;
    is_editable: boolean;
    root_pin_id: string;
    pin_title: string | null;
    template_type: null;
    showreel_data: null;
    recipe_data: null;
    is_promotable: boolean;
    version: string;
    pin_image_signature: string;
}

interface PagePreview {
    blocks: Block[];
}

export interface UserProfile extends Owner {
    image_xlarge_url: string;
    impressum_url: null;
    seo_canonical_domain: string;
    following_count: number;
    last_pin_save_time: string;
    first_name: string;
    eligible_profile_tabs: EligibleProfileTab[];
    seo_noindex_reason: null;
    board_count: number;
    instagram_data: null;
    profile_cover: ProfileCover;
    seo_description: string;
    follower_count: number;
    interest_following_count: null;
    is_inspirational_merchant: boolean;
    about: string;
    partner: null;
    website_url: null;
    domain_url: null;
    seo_title: string;
    indexed: boolean;
    is_primary_website_verified: boolean;
}

interface EligibleProfileTab {
    id: string;
    type: string;
    tab_type: number;
    name: string;
    is_default: boolean;
}

interface ProfileCover {
    id: string;
}
