// src/utils/bossSpider.ts
import axios from 'axios';

// 模拟浏览器请求头
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
};

/**
 * 从Boss直聘搜索页面抓取职位信息
 * @param keyword 搜索关键词
 * @param city 城市
 * @returns 职位列表
 */
export const scrapeBossJobs = async (keyword: string, city?: string): Promise<any[]> => {
  try {
    // 注意：真实实现中应该使用Boss直聘的API或者合法的方式抓取数据
    // 这里使用模拟数据展示功能，实际应用中需要替换为真实请求
    
    console.log(`搜索关键词: ${keyword}, 城市: ${city || '不限'}`);
    
    // 在真实应用中，这里应该是真实的HTTP请求
    // const searchParams = new URLSearchParams({
    //   query: encodeURIComponent(keyword),
    //   ...(city && {city: city})
    // });
    // 
    // const response = await axios.get(
    //   `https://www.zhipin.com/web/geek/job?${searchParams.toString()}`,
    //   { headers: HEADERS }
    // );

    // 为了演示目的，返回模拟数据
    // 实际应用中，需要解析响应内容并提取职位信息
    return getMockJobs(keyword);
  } catch (error) {
    console.error(`抓取Boss直聘职位信息失败: ${error}`);
    throw error;
  }
};

/**
 * 获取模拟的职位数据
 * @param keyword 搜索关键词
 * @returns 模拟的职位数据
 */
const getMockJobs = (keyword: string): any[] => {
  const baseJobs = [
    {
      id: 'BJ' + Date.now(),
      title: `${keyword}开发工程师`,
      company: '龙虾智能科技有限公司',
      salary: '20K-40K',
      location: '北京·海淀区',
      experience: '3-5年',
      education: '本科及以上',
      description: `负责${keyword}系统的设计与开发，使用TypeScript、JavaScript等技术栈，熟悉LlamaIndex、LangChain等框架，具备大模型应用开发经验。`,
      url: 'https://www.zhipin.com/job_detail/mock1.html',
      postedDate: new Date().toISOString().split('T')[0],
      tags: [keyword, 'TypeScript', 'AI', '大模型']
    },
    {
      id: 'SH' + (Date.now() + 1),
      title: `${keyword}算法工程师`,
      company: '前沿AI实验室',
      salary: '25K-45K',
      location: '上海·浦东新区',
      experience: '5-10年',
      education: '硕士及以上',
      description: `负责${keyword}核心算法研发，深入研究大模型技术，具备强化学习或多模态AI经验。`,
      url: 'https://www.zhipin.com/job_detail/mock2.html',
      postedDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // 昨天
      tags: [keyword, '算法', '深度学习', 'PyTorch']
    },
    {
      id: 'SZ' + (Date.now() + 2),
      title: 'AI Agent系统架构师',
      company: '智能科技集团',
      salary: '40K-70K',
      location: '深圳·南山区',
      experience: '8-10年',
      education: '硕士及以上',
      description: '设计大规模AI Agent系统架构，具备分布式系统开发经验，熟悉微服务架构设计。',
      url: 'https://www.zhipin.com/job_detail/mock3.html',
      postedDate: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 前天
      tags: ['AI Agent', '架构', '分布式', '微服务']
    },
    {
      id: 'HZ' + (Date.now() + 3),
      title: 'OpenClaw应用开发工程师',
      company: '龙虾实验室',
      salary: '18K-35K',
      location: '杭州·西湖区',
      experience: '2-4年',
      education: '本科及以上',
      description: '基于OpenClaw平台开发企业级AI应用，熟悉多智能体系统设计，具备产品化经验。',
      url: 'https://www.zhipin.com/job_detail/mock4.html',
      postedDate: new Date(Date.now() - 259200000).toISOString().split('T')[0], // 三天前
      tags: ['OpenClaw', 'AI Agent', '多智能体', 'TypeScript']
    }
  ];

  return baseJobs;
};

/**
 * 格式化搜索关键词
 * @param keyword 原始关键词
 * @returns 格式化后的关键词
 */
export const formatSearchKeyword = (keyword: string): string => {
  // 清理并标准化搜索关键词
  return keyword.trim().replace(/\s+/g, ' ').toLowerCase();
};