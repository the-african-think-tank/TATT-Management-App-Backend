export type ResourceType = "GUIDE" | "DOCUMENT" | "VIDEO" | "PARTNERSHIP";

export interface ResourceCard {
  id: string;
  title: string;
  type: ResourceType;
  description: string | null;
  thumbnailUrl: string | null;
  chapterId: string | null;
  visibility: string;
  minTier: string;
  tags: string[];
  createdAt: string;
  isPartnership?: boolean;
  isLocked?: boolean;
  redemptionLink?: string;
  buttonLabel?: string;
}

export interface ResourcesListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ResourcesListResponse {
  data: ResourceCard[];
  meta: ResourcesListMeta;
}

export interface ResourceDetail extends ResourceCard {
  contentUrl: string | null;
  metadata: Record<string, unknown> | null;
}
