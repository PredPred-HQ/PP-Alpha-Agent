// src/api/jobsApi.ts
import { scrapeBossJobs, formatSearchKeyword } from '../utils/bossSpider';
import { Job, JobSearchParams, JobSearchResult } from '../pages/jobs/types';

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
    
    // 如果关键词为空，返回空结果
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

/**
 * 获取特定职位详情
 * @param jobId 职位ID
 * @returns 职位详情
 */
export const getJobDetail = async (jobId: string): Promise<Job | null> => {
  try {
    // 在实际应用中，这里是获取特定职位的详细信息
    // 这里暂时返回null，需要根据实际的API实现
    console.log(`获取职位详情: ${jobId}`);
    return null;
  } catch (error) {
    console.error('获取职位详情失败:', error);
    return null;
  }
};