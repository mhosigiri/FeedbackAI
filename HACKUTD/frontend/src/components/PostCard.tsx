import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Heart, Share2, TrendingUp, TrendingDown } from 'lucide-react';

export interface Post {
  id: string;
  source: 'twitter' | 'reddit' | 'app';
  author: string;
  authorHandle?: string;
  avatar?: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares?: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  verified?: boolean;
}

interface PostCardProps {
  post: Post;
  index: number;
}

const PostCard: React.FC<PostCardProps> = ({ post, index }) => {
  const getSourceIcon = () => {
    switch (post.source) {
      case 'twitter':
        return '𝕏';
      case 'reddit':
        return 'r/';
      case 'app':
        return '📱';
      default:
        return '';
    }
  };

  const getSourceColor = () => {
    switch (post.source) {
      case 'twitter':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'reddit':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
      case 'app':
        return 'bg-[#E20074]/10 text-[#E20074] dark:text-[#E20074]';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  const getSentimentIcon = () => {
    switch (post.sentiment) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getSentimentColor = () => {
    switch (post.sentiment) {
      case 'positive':
        return 'border-l-green-500';
      case 'negative':
        return 'border-l-red-500';
      default:
        return 'border-l-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`bg-white dark:bg-[#121212] rounded-xl shadow-md p-5 border-l-4 ${getSentimentColor()} border-t border-r border-b border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E20074] to-[#FF0066] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">
              {post.author.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                {post.author}
              </h4>
              {post.verified && (
                <span className="text-blue-500 text-xs">✓</span>
              )}
              {post.authorHandle && (
                <span className="text-gray-500 dark:text-gray-400 text-xs truncate">
                  @{post.authorHandle}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getSourceColor()}`}>
                {getSourceIcon()} {post.source.charAt(0).toUpperCase() + post.source.slice(1)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {post.timestamp}
              </span>
            </div>
          </div>
        </div>
        {getSentimentIcon()}
      </div>

      {/* Content */}
      <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed mb-4">
        {post.content}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-[#E20074] transition-colors">
            <Heart className="w-4 h-4" />
            <span className="text-xs">{post.likes}</span>
          </button>
          <button className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-[#E20074] transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">{post.comments}</span>
          </button>
          {post.shares !== undefined && (
            <button className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-[#E20074] transition-colors">
              <Share2 className="w-4 h-4" />
              <span className="text-xs">{post.shares}</span>
            </button>
          )}
        </div>
        <div className={`text-xs px-2 py-1 rounded-full font-medium ${
          post.sentiment === 'positive' 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            : post.sentiment === 'negative'
            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
        }`}>
          {post.sentiment.charAt(0).toUpperCase() + post.sentiment.slice(1)}
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard;

