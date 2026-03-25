// src/api/jobs.ts
import { scrapeBossJobs, formatSearchKeyword } from '../utils/bossSpider';

export interface JobSearchParams {
  keyword: string;
  city?: string;
  page?: number;
  pageSize?: number;
}

export interface JobSearchResult {
  jobs: any[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 搜索职位
 * @param params 搜索参数
 * @returns 职位搜索结果
 */
export const searchJobs = async (params: JobSearchParams): Promise<JobSearchResult> => {
  try {
    const { keyword, city, page = 1, pageSize = 20 } = params;
    
    // 格式化搜索关键词
    const formattedKeyword = formatSearchKeyword(keyword);
    
    // 如果关键词为空，返回默认结果
    if (!formattedKeyword) {
      return {
        jobs: [],
        total: 0,
        page: page,
        pageSize: pageSize,
        totalPages: 0
      };
    }
    
    // 抓取职位数据
    const allJobs = await scrapeBossJobs(formattedKeyword, city);
    
    // 分页处理
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedJobs = allJobs.slice(startIndex, endIndex);
    
    const total = allJobs.length;
    const totalPages = Math.ceil(total / pageSize);
    
    return {
      jobs: paginatedJobs,
      total,
      page,
      pageSize,
      totalPages
    };
  } catch (error) {
    console.error('搜索职位失败:', error);
    throw error;
  }
};