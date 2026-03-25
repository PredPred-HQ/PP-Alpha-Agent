// src/pages/jobs/types.ts
export interface Job {
  id: string;
  title: string;
  company: string;
  salary: string;
  location: string;
  experience: string;
  education: string;
  description: string;
  url: string;
  postedDate: string;
  tags: string[];
}

export interface JobSearchParams {
  keyword: string;
  city?: string;
  page?: number;
  pageSize?: number;
}

export interface JobSearchResult {
  jobs: Job[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}