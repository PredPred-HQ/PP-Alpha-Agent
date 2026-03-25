// src/pages/jobs/JobsCollectionPage.tsx
import React, { useState, useEffect } from 'react';
import { searchJobs } from '../../api/jobsApi';
import { Job } from './types';

const JobsCollectionPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('AI Agent 开发');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalJobs, setTotalJobs] = useState<number>(0);
  const [selectedFilters, setSelectedFilters] = useState({
    city: '',
    experience: '',
    salary: ''
  });

  // 获取职位数据的函数
  const fetchJobs = async (query: string, page: number) => {
    try {
      setLoading(true);
      
      // 调用API获取职位数据
      const result = await searchJobs({
        keyword: query,
        city: selectedFilters.city || undefined,
        page: page,
        pageSize: 20
      });

      setJobs(result.jobs);
      setTotalPages(result.totalPages);
      setTotalJobs(result.total);
    } catch (error) {
      console.error('获取职位数据失败:', error);
      // 设置空数组以避免错误
      setJobs([]);
      setTotalPages(1);
      setTotalJobs(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(searchTerm, currentPage);
  }, [searchTerm, currentPage, selectedFilters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchJobs(searchTerm, 1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleFilterChange = (filterType: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1); // 重置到第一页
  };

  return (
    <div className="jobs-collection-container">
      <div className="header">
        <h1>Boss直聘 - AI Agent & OpenClaw 职位收集</h1>
        <p>收集最新、最热门的AI Agent开发与OpenClaw相关职位信息</p>
      </div>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索职位关键词 (如: AI Agent, OpenClaw, 龙虾)"
            className="search-input"
          />
          <button type="submit" className="search-button">搜索</button>
        </form>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>地区:</label>
          <select 
            value={selectedFilters.city} 
            onChange={(e) => handleFilterChange('city', e.target.value)}
            className="filter-select"
          >
            <option value="">不限</option>
            <option value="北京">北京</option>
            <option value="上海">上海</option>
            <option value="深圳">深圳</option>
            <option value="杭州">杭州</option>
            <option value="广州">广州</option>
            <option value="成都">成都</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>经验:</label>
          <select 
            value={selectedFilters.experience} 
            onChange={(e) => handleFilterChange('experience', e.target.value)}
            className="filter-select"
          >
            <option value="">不限</option>
            <option value="应届生">应届生</option>
            <option value="1-3年">1-3年</option>
            <option value="3-5年">3-5年</option>
            <option value="5-10年">5-10年</option>
            <option value="10年以上">10年以上</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>薪资:</label>
          <select 
            value={selectedFilters.salary} 
            onChange={(e) => handleFilterChange('salary', e.target.value)}
            className="filter-select"
          >
            <option value="">不限</option>
            <option value="5K-10K">5K-10K</option>
            <option value="10K-15K">10K-15K</option>
            <option value="15K-25K">15K-25K</option>
            <option value="25K-40K">25K-40K</option>
            <option value="40K以上">40K以上</option>
          </select>
        </div>
      </div>

      <div className="job-listings">
        {loading ? (
          <div className="loading">正在加载职位信息...</div>
        ) : (
          <>
            <div className="job-count">
              共找到 {totalJobs} 个相关职位 (显示第 {(currentPage - 1) * 20 + 1}-{Math.min(currentPage * 20, totalJobs)} 个)
            </div>
            
            {jobs.length > 0 ? (
              <div className="jobs-grid">
                {jobs.map((job) => (
                  <div key={job.id} className="job-card">
                    <div className="job-header">
                      <h3 className="job-title">{job.title}</h3>
                      <span className="salary">{job.salary}</span>
                    </div>
                    
                    <div className="company-info">
                      <span className="company-name">{job.company}</span>
                      <span className="location">{job.location}</span>
                    </div>
                    
                    <div className="job-meta">
                      <span className="experience">{job.experience}</span>
                      <span className="education">{job.education}</span>
                      <span className="posted-date">{job.postedDate}</span>
                    </div>
                    
                    <div className="job-description">
                      <p>{job.description}</p>
                    </div>
                    
                    <div className="job-tags">
                      {job.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                    
                    <div className="job-actions">
                      <a 
                        href={job.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="apply-link"
                      >
                        查看详情
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p>没有找到相关职位，请尝试其他关键词</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* 分页组件 */}
      {!loading && jobs.length > 0 && totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            上一页
          </button>
          
          <span className="page-info">
            第 {currentPage} 页，共 {totalPages} 页
          </span>
          
          <button 
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            下一页
          </button>
        </div>
      )}

      <style jsx>{`
        .jobs-collection-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #f9f9f9;
          min-height: 100vh;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding: 20px 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 10px;
        }
        
        .header h1 {
          margin-bottom: 10px;
          font-size: 28px;
        }
        
        .header p {
          font-size: 16px;
          opacity: 0.9;
        }
        
        .search-section {
          margin-bottom: 30px;
          text-align: center;
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .search-form {
          display: flex;
          justify-content: center;
          gap: 10px;
        }
        
        .search-input {
          width: 400px;
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 16px;
        }
        
        .search-button {
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
        }
        
        .search-button:hover {
          opacity: 0.9;
        }
        
        .filters {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 30px;
          flex-wrap: wrap;
          background: white;
          padding: 15px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .filter-group label {
          font-weight: bold;
          color: #333;
        }
        
        .filter-select {
          padding: 6px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .job-count {
          margin-bottom: 20px;
          font-size: 18px;
          font-weight: bold;
          color: #333;
          text-align: center;
          padding: 10px;
          background: white;
          border-radius: 5px;
        }
        
        .jobs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .job-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          background-color: white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          transition: box-shadow 0.3s ease, transform 0.2s ease;
        }
        
        .job-card:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          transform: translateY(-2px);
        }
        
        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }
        
        .job-title {
          font-size: 18px;
          font-weight: bold;
          color: #333;
          margin: 0;
          flex: 1;
          line-height: 1.4;
        }
        
        .salary {
          font-size: 18px;
          font-weight: bold;
          color: #e02d2d;
          margin-left: 10px;
          white-space: nowrap;
        }
        
        .company-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          color: #666;
          font-size: 14px;
        }
        
        .job-meta {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
          font-size: 13px;
          color: #888;
          padding: 10px 0;
          border-top: 1px dashed #eee;
          border-bottom: 1px dashed #eee;
        }
        
        .job-description {
          margin-bottom: 15px;
          color: #444;
          line-height: 1.6;
          font-size: 14px;
        }
        
        .job-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 15px;
        }
        
        .tag {
          background-color: #f0f5ff;
          color: #1890ff;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
        
        .job-actions {
          text-align: right;
          padding-top: 10px;
          border-top: 1px solid #eee;
        }
        
        .apply-link {
          display: inline-block;
          padding: 8px 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-weight: 500;
          transition: opacity 0.3s;
        }
        
        .apply-link:hover {
          opacity: 0.9;
        }
        
        .loading {
          text-align: center;
          padding: 60px 20px;
          font-size: 18px;
          color: #666;
        }
        
        .no-results {
          text-align: center;
          padding: 60px 20px;
          font-size: 18px;
          color: #666;
        }
        
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          margin-top: 30px;
          padding: 20px;
        }
        
        .pagination-btn {
          padding: 10px 20px;
          border: 1px solid #ddd;
          background-color: white;
          cursor: pointer;
          border-radius: 6px;
          font-size: 14px;
          transition: background-color 0.3s;
        }
        
        .pagination-btn:hover:not(:disabled) {
          background-color: #f5f5f5;
        }
        
        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .page-info {
          color: #666;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default JobsCollectionPage;