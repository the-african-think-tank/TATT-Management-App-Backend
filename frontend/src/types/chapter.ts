/** Chapter from GET /chapters/:id */
export interface ChapterDetail {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  cities: string[];
  regionalManagerId?: string | null;
  regionalManager?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string | null;
    professionTitle?: string | null;
  } | null;
}

/** Member from GET /chapters/:id/members */
export interface ChapterMember {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string | null;
  professionTitle?: string | null;
}

export interface ChapterMembersResponse {
  members: ChapterMember[];
  total: number;
}
