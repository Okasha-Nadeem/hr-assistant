import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listJobs } from "../api";

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  createdAt?: string;
}

export default function JobList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, selectedCategory]);

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      const jobsData = await listJobs();
      setJobs(jobsData);
    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.requirements.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category (mock categories based on job titles)
    if (selectedCategory !== "all") {
      filtered = filtered.filter(job => {
        const title = job.title.toLowerCase();
        switch (selectedCategory) {
          case "development":
            return title.includes("developer") || title.includes("engineer") || title.includes("programmer");
          case "design":
            return title.includes("designer") || title.includes("ui") || title.includes("ux");
          case "marketing":
            return title.includes("marketing") || title.includes("sales") || title.includes("business");
          case "management":
            return title.includes("manager") || title.includes("lead") || title.includes("director");
          default:
            return true;
        }
      });
    }

    setFilteredJobs(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getJobCategory = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("developer") || lowerTitle.includes("engineer") || lowerTitle.includes("programmer")) {
      return { name: "Development", color: "bg-blue-100 text-blue-800" };
    } else if (lowerTitle.includes("designer") || lowerTitle.includes("ui") || lowerTitle.includes("ux")) {
      return { name: "Design", color: "bg-purple-100 text-purple-800" };
    } else if (lowerTitle.includes("marketing") || lowerTitle.includes("sales") || lowerTitle.includes("business")) {
      return { name: "Marketing", color: "bg-green-100 text-green-800" };
    } else if (lowerTitle.includes("manager") || lowerTitle.includes("lead") || lowerTitle.includes("director")) {
      return { name: "Management", color: "bg-yellow-100 text-yellow-800" };
    } else {
      return { name: "Other", color: "bg-gray-100 text-gray-800" };
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Dream Job</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover exciting opportunities and take the next step in your career journey
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search jobs by title, description, or requirements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Categories</option>
                <option value="development">Development</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="management">Management</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Clear search
              </button>
            )}
          </div>
        </div>

        {/* Jobs Grid */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedCategory !== "all" 
                ? "Try adjusting your search or filter criteria."
                : "No jobs are currently available. Check back later!"
              }
            </p>
            {(searchTerm || selectedCategory !== "all") && (
              <div className="mt-6">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => {
              const category = getJobCategory(job.title);
              return (
                <div
                  key={job.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden"
                >
                  <div className="p-6">
                    {/* Job Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {job.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${category.color}`}>
                          {category.name}
                        </span>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </div>
                    </div>

                    {/* Job Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {truncateText(job.description, 150)}
                    </p>

                    {/* Requirements Preview */}
                    <div className="mb-4">
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Requirements
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {truncateText(job.requirements, 100)}
                      </p>
                    </div>

                    {/* Job Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {job.createdAt ? formatDate(job.createdAt) : "Recently posted"}
                      </div>
                      <Link
                        to={`/apply?job=${job.id}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                      >
                        Apply Now
                        <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Button (if needed) */}
        {filteredJobs.length > 0 && filteredJobs.length < jobs.length && (
          <div className="mt-8 text-center">
            <button className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Load More Jobs
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
