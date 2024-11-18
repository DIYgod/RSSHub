export interface CreatorData {
    meta: {
        desc: string;
        height: null;
        imageUrl: string;
        isPrivate: boolean;
        key: string;
        openGraph: OpenGraph;
        title: string;
        url: string;
        videoHeight: null;
        videoUrl: null;
        videoWidth: null;
        viewport: string;
    };
    id: string;
    attributes: IncludedAttributes;
}

interface OpenGraph {
    desc: null;
    imageUrl: null;
    title: null;
}

export interface PostData {
    data: Datum[];
    included: IncludedItem[];
    links: Links;
    meta: Meta;
}

interface Datum {
    attributes: Attributes;
    id: string;
    relationships: Relationships;
    type: string;
}

interface Attributes {
    change_visibility_at: null;
    comment_count: number;
    commenter_count: number;
    created_at: string;
    current_user_can_comment: boolean;
    current_user_can_delete: boolean;
    current_user_can_report: boolean;
    current_user_can_view: boolean;
    current_user_comment_disallowed_reason: string;
    has_ti_violation: boolean;
    image: Image;
    is_new_to_current_user: boolean;
    is_paid: boolean;
    like_count: number;
    meta_image_url: string;
    min_cents_pledged_to_view: number | null;
    moderation_status: string;
    patreon_url: string;
    pledge_url: string;
    pls_one_liners_by_category: any[]; // Items are `false`, so an empty array
    post_level_suspension_removal_date: null;
    post_metadata: PostMetadata;
    post_type: string;
    preview_asset_type: string | null;
    published_at: string;
    teaser_text: string | null;
    title: string;
    upgrade_url: string;
    url: string;
    video_preview: VideoPreview | null;
    was_posted_by_campaign_owner: boolean;
    thumbnail?: Thumbnail;
    content?: string;
    embed?: null;
    post_file?: PostFile;
}

interface Image {
    height: number;
    url: string;
    width: number;
    large_url?: string;
    thumb_square_large_url?: string;
    thumb_square_url?: string;
    thumb_url?: string;
}

interface PostMetadata {
    image_order?: string[];
    platform?: object;
}

interface VideoPreview {
    closed_captions_enabled: boolean;
    default_thumbnail: DefaultThumbnail;
    duration: number;
    expires_at: string;
    full_content_duration: number;
    full_duration: number;
    height: number;
    media_id: number;
    progress: Progress;
    state: string;
    url: string;
    video_issues: object;
    width: number;
}

interface DefaultThumbnail {
    url: string;
}

interface Progress {
    is_watched: boolean;
    watch_state: string;
}

interface PostFile {
    height: number;
    image_colors: ImageColors;
    media_id: number;
    state: string;
    url: string;
    width: number;
}

interface ImageColors {
    average_colors_of_corners: AverageColorsOfCorners;
    dominant_color: string;
    palette: string[];
    text_color: string;
}

interface AverageColorsOfCorners {
    bottom_left: string;
    bottom_right: string;
    top_left: string;
    top_right: string;
}

interface Thumbnail {
    url: string;
    large?: string;
    large_2?: string;
    square?: string;
    gif_url?: string;
    height?: number;
    width?: number;
}

interface Relationships {
    access_rules: AccessRules;
    audio: MediaRelation;
    audio_preview: MediaRelation;
    campaign: CampaignRelation;
    content_unlock_options: ContentUnlockOptions;
    drop: Drop;
    images: Images;
    media: Media;
    poll: Poll;
    user: UserRelation;
    user_defined_tags: UserDefinedTags;
    video: MediaRelation;
    attachments_media?: AttachmentsMedia;
    // Custom relationships
    video_preview?: MediaRelation;
}

interface AccessRules {
    data: AccessRuleData[];
}

interface AccessRuleData {
    id: string;
    type: string;
}

export interface MediaRelation {
    data: MediaData | null;
    links?: RelatedLink;
}

interface MediaData {
    id: string;
    type: string;
}

interface CampaignRelation {
    data: CampaignData;
    links: RelatedLink;
}

interface CampaignData {
    id: string;
    type: string;
}

interface RelatedLink {
    related: string;
}

interface ContentUnlockOptions {
    data: any[]; // Empty array
}

interface Drop {
    data: null;
}

interface Images {
    data: MediaData[];
}

interface Media {
    data: MediaData[];
}

interface Poll {
    data: null;
}

interface UserRelation {
    data: UserData;
    links: RelatedLink;
}

interface UserData {
    id: string;
    type: string;
}

interface UserDefinedTags {
    data: UserDefinedTagData[];
    attributes: IncludedAttributes;
}

interface UserDefinedTagData {
    id: string;
    type: string;
}

interface AttachmentsMedia {
    data: AttachmentMediaData[];
}

interface AttachmentMediaData {
    id: string;
    type: string;
}

interface IncludedItem {
    attributes: IncludedAttributes;
    id: string;
    type: string;
    relationships?: IncludedRelationships;
}

interface IncludedAttributes {
    // Depending on the `type`, attributes vary
    // For example, if `type` is 'user', attributes include:
    full_name?: string;
    image_url?: string | null;
    avatar_photo_image_urls?: Image;
    avatar_photo_url?: string;
    currency?: string;
    earnings_visibility?: string;
    is_monthly?: boolean;
    is_nsfw?: boolean;
    name?: string;
    show_audio_post_download_links?: boolean;
    url?: string;
    // Additional properties for other types
    // For 'post_tag' type
    tag_type?: string;
    value?: string;
    // For 'display'
    display?: Display;
    // For 'file'
    file_name?: string | null;
    image_urls?: Image | null;
    metadata?: Metadata;
    download_url?: string;
    // For 'tier'
    access_rule_type?: string;
    amount_cents?: number | null;
    post_count?: number;
    amount?: number;
    created_at?: string;
    declined_patron_count?: number;
    description?: string;
    discord_role_ids?: null;
    edited_at?: string;
    is_free_tier?: boolean;
    patron_amount_cents?: number;
    patron_currency?: string;
    published?: boolean;
    published_at?: string;
    remaining?: null;
    requires_shipping?: boolean;
    title?: string;
    unpublished_at?: null;
}

interface Display {
    default_thumbnail?: DefaultThumbnail & { position?: number };
    url?: string;
    closed_captions_enabled?: boolean;
    expires_at?: string;
    height?: number;
    video_issues?: VideoIssues;
    width?: number;
    duration?: number;
    full_content_duration?: number;
    media_id?: number;
    progress?: Progress;
    state?: string;
    image_colors?: ImageColors;
}

interface VideoIssues {
    processing_warning?: {
        video_bitrate?: string;
        video_codec?: string;
        video_resolution?: string;
    };
}

interface Image {
    thumbnail: string;
    url: string;
    default?: string;
    default_blurred?: string;
    default_blurred_small?: string;
    default_small?: string;
    original?: string;
    thumbnail_large?: string;
    thumbnail_small?: string;
}

interface Metadata {
    audio_preview_duration?: number;
    audio_preview_start_time?: number;
    video_preview_end_ms?: number | null;
    video_preview_start_ms?: number | null;
    duration?: number;
    start_position?: number;
    duration_s?: number;
    orientation?: string;
    variant?: string;
    dimensions?: Dimensions;
}

interface Dimensions {
    h: number;
    w: number;
}

interface IncludedRelationships {
    tier?: TierRelation;
}

interface TierRelation {
    data: TierData | null;
    links?: RelatedLink;
}

interface TierData {
    id: string;
    type: string;
}

interface Links {
    next: string;
}

interface Meta {
    pagination: Pagination;
}

interface Pagination {
    cursors: Cursors;
    total: number;
}

interface Cursors {
    next: string;
}
