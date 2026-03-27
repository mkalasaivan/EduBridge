import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface ExternalSearchResult {
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  platform: string;
  type: string;
}

@Injectable()
export class ExternalSearchService {
  private readonly youtubeApiKey: string | undefined;

  constructor(private config: ConfigService) {
    this.youtubeApiKey = this.config.get<string>('YOUTUBE_API_KEY');
  }

  async searchAll(query: string): Promise<ExternalSearchResult[]> {
    const results = await Promise.all([
      this.searchYouTube(query),
      this.searchGitHub(query),
      this.searchGeneral(query),
    ]);

    // Flatten and limit to top results
    return results.flat().slice(0, 30);
  }

  async searchYouTube(query: string): Promise<ExternalSearchResult[]> {
    if (!this.youtubeApiKey) {
      // Demo Fallback for YouTube if API key is missing
      return [
        {
          title: `[Demo] Introduction to ${query} on YouTube`,
          description: "Learn the basics from world-class experts in this comprehensive tutorial series.",
          url: "https://youtube.com/results?search_query=" + encodeURIComponent(query),
          thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
          platform: "YOUTUBE",
          type: "VIDEO"
        }
      ];
    }

    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: query + ' education tutorial',
          maxResults: 10,
          type: 'video',
          key: this.youtubeApiKey,
        },
      });

      return response.data.items.map(item => ({
        title: item.snippet.title,
        description: item.snippet.description,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        thumbnail: item.snippet.thumbnails.high?.url,
        platform: 'YOUTUBE',
        type: 'VIDEO',
      }));
    } catch (error) {
      console.error('YouTube API error:', error.response?.data || error.message);
      return [];
    }
  }

  async searchGitHub(query: string): Promise<ExternalSearchResult[]> {
    try {
      const response = await axios.get('https://api.github.com/search/repositories', {
        params: {
          q: `${query} topic:education topic:course`,
          sort: 'stars',
          order: 'desc',
          per_page: 10,
        },
      });

      return response.data.items.map(item => ({
        title: item.full_name,
        description: item.description || "Educational repository with resources and examples.",
        url: item.html_url,
        thumbnail: item.owner.avatar_url,
        platform: 'GITHUB',
        type: 'REPOSITORY',
      }));
    } catch (error) {
      console.error('GitHub API error:', error.message);
      return [];
    }
  }

  async searchGeneral(query: string): Promise<ExternalSearchResult[]> {
    // Simulated Smart Scraper for Udemy/Coursera/Medium etc.
    // In a real scenario, this would use RSS feeds or a specialized aggregator.
    return [
      {
        title: `Comprehensive ${query} Course`,
        description: "Bestselling course with thousands of students and 5-star ratings.",
        url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(query)}`,
        thumbnail: "https://www.udemy.com/staticx/udemy/images/v7/logo-udemy.svg",
        platform: "UDEMY",
        type: "COURSE"
      },
      {
        title: `${query} Specialization`,
        description: "Professional certification from top-tier universities.",
        url: `https://www.coursera.org/search?query=${encodeURIComponent(query)}`,
        thumbnail: "https://brand.coursera.org/wp-content/uploads/2021/08/coursera-logo-blue.png",
        platform: "COURSERA",
        type: "COURSE"
      },
      {
        title: `Understanding ${query} in depth`,
        description: "Expert insights and research articles on the latest trends and methodologies.",
        url: `https://medium.com/search?q=${encodeURIComponent(query)}`,
        thumbnail: "https://miro.medium.com/v2/resize:fit:80/1*9unA-TzK7eWdJqK1uofW6Q.png",
        platform: "MEDIUM",
        type: "ARTICLE"
      }
    ];
  }
}
