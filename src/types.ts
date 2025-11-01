import { z, ZodSchema } from "zod";

// Image URL schemas
const ImageUrlSchema = z.object({
  url: z.string().nullable().optional(),
  original: z.string().nullable().optional(),
  default: z.string().nullable().optional(),
  default_blurred: z.string().nullable().optional(),
  default_small: z.string().nullable().optional(),
  default_large: z.string().nullable().optional(),
  default_blurred_small: z.string().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  thumbnail_large: z.string().nullable().optional(),
  thumbnail_small: z.string().nullable().optional(),
});

const ImageWithDimensionsSchema = z.object({
  url: z.string().nullable().optional(),
  thumb_url: z.string().nullable().optional(),
  large_url: z.string().nullable().optional(),
  thumb_square_url: z.string().nullable().optional(),
  thumb_square_large_url: z.string().nullable().optional(),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
});

const ThumbnailSchema = z.object({
  original: z.string().nullable().optional(),
  default: z.string().nullable().optional(),
  default_blurred: z.string().nullable().optional(),
  default_small: z.string().nullable().optional(),
  default_large: z.string().nullable().optional(),
  default_blurred_small: z.string().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  thumbnail_large: z.string().nullable().optional(),
  thumbnail_small: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
});

// Post Metadata
const PostMetadataSchema = z.object({
  platform: z.record(z.string(), z.unknown()).nullable().optional(),
  image_order: z.array(z.string()).nullable().optional(),
});

// Post Attributes
const PostAttributesSchema = z.object({
  post_type: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  comment_count: z.number().nullable().optional(),
  commenter_count: z.number().nullable().optional(),
  meta_image_url: z.string().nullable().optional(),
  min_cents_pledged_to_view: z.number().nullable().optional(),
  like_count: z.number().nullable().optional(),
  video_preview: z.unknown().nullable().optional(),
  image: ImageWithDimensionsSchema.nullable().optional(),
  thumbnail: ThumbnailSchema.nullable().optional(),
  is_paid: z.boolean().nullable().optional(),
  was_posted_by_campaign_owner: z.boolean().nullable().optional(),
  published_at: z.string().nullable().optional(),
  change_visibility_at: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  pledge_url: z.string().nullable().optional(),
  patreon_url: z.string().nullable().optional(),
  current_user_can_comment: z.boolean().nullable().optional(),
  current_user_can_view: z.boolean().nullable().optional(),
  current_user_can_delete: z.boolean().nullable().optional(),
  upgrade_url: z.string().nullable().optional(),
  teaser_text: z.string().nullable().optional(),
  post_metadata: PostMetadataSchema.nullable().optional(),
  has_ti_violation: z.boolean().nullable().optional(),
  moderation_status: z.string().nullable().optional(),
  post_level_suspension_removal_date: z.string().nullable().optional(),
  pls_one_liners_by_category: z.array(z.unknown()).nullable().optional(),
  preview_asset_type: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  embed: z.unknown().nullable().optional(),
  insights_last_updated_at: z.string().nullable().optional(),
  post_file: z
    .object({
      url: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  current_user_has_liked: z.boolean().nullable().optional(),
  view_count: z.number().nullable().optional(),
});

// Relationship data
const RelationshipDataSchema = z.object({
  id: z.string(),
  type: z.string(),
});

const RelationshipSchema = z.object({
  data: z.union([
    RelationshipDataSchema,
    z.array(RelationshipDataSchema),
    z.null(),
  ]),
  links: z
    .object({
      related: z.string().nullable().optional(),
    })
    .optional(),
});

// Post Relationships
const PostRelationshipsSchema = z.object({
  user: RelationshipSchema.optional(),
  campaign: RelationshipSchema.optional(),
  audio: RelationshipSchema.optional(),
  images: RelationshipSchema.optional(),
  user_defined_tags: RelationshipSchema.optional(),
  poll: RelationshipSchema.optional(),
  access_rules: RelationshipSchema.optional(),
  media: RelationshipSchema.optional(),
});

// Post
const PostSchema = z.object({
  id: z.string(),
  type: z.literal("post"),
  attributes: PostAttributesSchema,
  relationships: PostRelationshipsSchema.optional(),
});

// User Attributes
const UserAttributesSchema = z.object({
  full_name: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
});

// User
const UserSchema = z.object({
  id: z.string(),
  type: z.literal("user"),
  attributes: UserAttributesSchema,
  relationships: z
    .object({
      campaign: RelationshipSchema.optional(),
    })
    .optional(),
});

// Campaign Attributes
const CampaignAttributesSchema = z.object({
  avatar_photo_image_urls: ImageUrlSchema.nullable().optional(),
  avatar_photo_url: z.string().nullable().optional(),
  currency: z.string().nullable().optional(),
  earnings_visibility: z.string().nullable().optional(),
  is_monthly: z.boolean().nullable().optional(),
  is_nsfw: z.boolean().nullable().optional(),
  name: z.string().nullable().optional(),
  show_audio_post_download_links: z.boolean().nullable().optional(),
  url: z.string().nullable().optional(),
});

// Campaign
const CampaignSchema = z.object({
  id: z.string(),
  type: z.literal("campaign"),
  attributes: CampaignAttributesSchema,
  relationships: z
    .object({
      creator: RelationshipSchema.optional(),
      goals: RelationshipSchema.optional(),
      rewards: RelationshipSchema.optional(),
    })
    .optional(),
});

// Media Attributes
const MediaAttributesSchema = z.object({
  file_name: z.string().nullable().optional(),
  metadata: z
    .object({
      duration_s: z.number().nullable().optional(),
      dimensions: z
        .object({
          h: z.number().nullable().optional(),
          w: z.number().nullable().optional(),
        })
        .nullable()
        .optional(),
      duration: z.number().nullable().optional(),
      start_position: z.number().nullable().optional(),
    })
    .nullable()
    .optional(),
  image_urls: ImageUrlSchema.nullable().optional(),
  download_url: z.string().nullable().optional(),
});

// Media
const MediaSchema = z.object({
  id: z.string(),
  type: z.literal("media"),
  attributes: MediaAttributesSchema,
});

// Post Tag Attributes
const PostTagAttributesSchema = z.object({
  value: z.string().nullable().optional(),
  tag_type: z.string().nullable().optional(),
});

// Post Tag
const PostTagSchema = z.object({
  id: z.string(),
  type: z.literal("post_tag"),
  attributes: PostTagAttributesSchema,
});

// Access Rule Attributes
const AccessRuleAttributesSchema = z.object({
  access_rule_type: z.string().nullable().optional(),
  amount_cents: z.number().nullable().optional(),
  post_count: z.number().nullable().optional(),
  currency: z.string().nullable().optional(),
});

// Access Rule
const AccessRuleSchema = z.object({
  id: z.string(),
  type: z.literal("access-rule"),
  attributes: AccessRuleAttributesSchema,
});

// Reward Attributes
const RewardAttributesSchema = z.object({
  amount: z.number().nullable().optional(),
  amount_cents: z.number().nullable().optional(),
  description: z.string().nullable().optional(),
  user_limit: z.number().nullable().optional(),
  remaining: z.number().nullable().optional(),
  requires_shipping: z.boolean().nullable().optional(),
  created_at: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  patron_currency: z.string().nullable().optional(),
  declined_patron_count: z.number().nullable().optional(),
  patron_count: z.number().nullable().optional(),
  post_count: z.number().nullable().optional(),
  discord_role_ids: z.array(z.string()).nullable().optional(),
  title: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  edited_at: z.string().nullable().optional(),
  published: z.boolean().nullable().optional(),
  published_at: z.string().nullable().optional(),
  unpublished_at: z.string().nullable().optional(),
  currency: z.string().nullable().optional(),
  patron_amount_cents: z.number().nullable().optional(),
  is_free_tier: z.boolean().nullable().optional(),
});

// Reward
const RewardSchema = z.object({
  id: z.string(),
  type: z.literal("reward"),
  attributes: RewardAttributesSchema,
  relationships: z
    .object({
      campaign: RelationshipSchema.optional(),
    })
    .optional(),
});

// Included items (union of all possible types)
const IncludedItemSchema = z.union([
  UserSchema,
  CampaignSchema,
  MediaSchema,
  PostTagSchema,
  AccessRuleSchema,
  RewardSchema,
]);

// Pagination
const PaginationSchema = z.object({
  total: z.number().nullable().optional(),
  cursors: z
    .object({
      next: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

// Links
const LinksSchema = z.object({
  next: z.string().nullable().optional(),
});

// Meta
const MetaSchema = z.object({
  pagination: PaginationSchema.optional(),
});

// Main Response Schema
const PostsResponseSchema = z.object({
  data: z.array(PostSchema),
  included: z.array(IncludedItemSchema).optional(),
  links: LinksSchema.optional(),
  meta: MetaSchema.optional(),
});

function jsonApiSchema(opts: {
  data?: ZodSchema;
  included?: ZodSchema;
  links?: ZodSchema;
  meta?: ZodSchema;
}) {
  return z.object({
    data: opts.data,
    included: opts.included,
    links: opts.links,
    meta: opts.meta,
  });
}

const CurrentUserResponseSchema = jsonApiSchema({
  data: z.object({
    id: z.string(),
    type: z.literal("user"),
    attributes: UserAttributesSchema,
  }),
  links: z.object({
    self: z.string().nullable().optional(),
  }),
});

// Export types
export type Post = z.infer<typeof PostSchema>;
export type PostAttributes = z.infer<typeof PostAttributesSchema>;
export type User = z.infer<typeof UserSchema>;
export type Campaign = z.infer<typeof CampaignSchema>;
export type Media = z.infer<typeof MediaSchema>;
export type PostTag = z.infer<typeof PostTagSchema>;
export type AccessRule = z.infer<typeof AccessRuleSchema>;
export type Reward = z.infer<typeof RewardSchema>;
export type IncludedItem = z.infer<typeof IncludedItemSchema>;
export type PostsResponse = z.infer<typeof PostsResponseSchema>;
export type CurrentUserResponse = z.infer<typeof CurrentUserResponseSchema>;

// Export schemas
export {
  PostSchema,
  UserSchema,
  CampaignSchema,
  MediaSchema,
  PostTagSchema,
  AccessRuleSchema,
  RewardSchema,
  PostsResponseSchema,
  CurrentUserResponseSchema,
};
