/** Job listing from GET /jobs */
export interface JobListing {
  id: string;
  title: string;
  companyName: string;
  companyLogoUrl?: string | null;
  location: string;
  salaryLabel?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  type: string;
  category: string;
  description?: string | null;
  isNew?: boolean;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobsResponse {
  data: JobListing[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface MarketInsights {
  topCategory: { name: string; growth: string } | null;
  salaryTrend: { avg: number; label: string };
  topEmployers: { name: string; initials: string }[];
}

export interface ApplyJobPayload {
  fullName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  coverLetter?: string;
}
