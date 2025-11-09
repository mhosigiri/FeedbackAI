import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import PostCard, { Post } from '../components/PostCard';
import { Twitter, MessageSquare, Smartphone, Filter } from 'lucide-react';

const Community: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'twitter' | 'reddit' | 'app'>('all');

  // Simulated community posts data - Will be replaced by AI agent
  const allPosts: Post[] = [
    // Twitter Posts
    {
      id: '1',
      source: 'twitter',
      author: 'Sarah Johnson',
      authorHandle: 'sarahj_tmobile',
      content: 'Just upgraded to T-Mobile 5G and the speed is incredible! Streaming 4K videos without any buffering. Best decision I\'ve made this year! 🚀',
      timestamp: '2 hours ago',
      likes: 234,
      comments: 45,
      shares: 12,
      sentiment: 'positive',
      verified: true,
    },
    {
      id: '2',
      source: 'twitter',
      author: 'TechGuru_Mike',
      authorHandle: 'techguru_mike',
      content: 'T-Mobile\'s network upgrade in downtown is noticeable. Getting consistent 300+ Mbps during peak hours. Impressive work! 📶',
      timestamp: '1 hour ago',
      likes: 189,
      comments: 32,
      shares: 18,
      sentiment: 'positive',
      verified: false,
    },
    {
      id: '3',
      source: 'twitter',
      author: 'Alex Rodriguez',
      authorHandle: 'alex_rod',
      content: 'Frustrated with the recent price increase. I understand inflation, but this feels like a lot. Anyone else feeling the pinch?',
      timestamp: '3 hours ago',
      likes: 89,
      comments: 34,
      shares: 8,
      sentiment: 'negative',
    },
    {
      id: '4',
      source: 'twitter',
      author: 'David Kim',
      authorHandle: 'davidkimtech',
      content: 'T-Mobile\'s international roaming is a game changer. Used it in Europe last month and it worked flawlessly. No more hunting for WiFi!',
      timestamp: '4 hours ago',
      likes: 312,
      comments: 78,
      shares: 25,
      sentiment: 'positive',
      verified: true,
    },
    {
      id: '5',
      source: 'twitter',
      author: 'Robert Wilson',
      authorHandle: 'rob_wilson',
      content: 'Billing system needs work. Got charged twice this month and had to call multiple times to get it sorted. Very frustrating experience.',
      timestamp: '5 hours ago',
      likes: 123,
      comments: 45,
      shares: 15,
      sentiment: 'negative',
    },
    {
      id: '6',
      source: 'twitter',
      author: 'Emma Davis',
      authorHandle: 'emma_davis',
      content: 'Switched from Verizon to T-Mobile last month. Coverage is actually better in my area and I\'m saving $40/month. Win-win! 💰',
      timestamp: '6 hours ago',
      likes: 267,
      comments: 56,
      shares: 22,
      sentiment: 'positive',
    },
    {
      id: '7',
      source: 'twitter',
      author: 'James Martinez',
      authorHandle: 'james_mart',
      content: 'Customer service wait times are getting ridiculous. Spent 45 minutes on hold yesterday. This needs to be addressed ASAP.',
      timestamp: '7 hours ago',
      likes: 145,
      comments: 67,
      shares: 19,
      sentiment: 'negative',
    },
    {
      id: '8',
      source: 'twitter',
      author: 'TechReviewer',
      authorHandle: 'techreviewer',
      content: 'The new T-Mobile Home Internet is surprisingly good. Getting 150 Mbps consistently, perfect for remote work. No data caps either!',
      timestamp: '8 hours ago',
      likes: 423,
      comments: 89,
      shares: 34,
      sentiment: 'positive',
      verified: true,
    },
    {
      id: '9',
      source: 'twitter',
      author: 'MobileUser99',
      authorHandle: 'mobileuser99',
      content: 'Network keeps dropping in my neighborhood. Reported it multiple times but no fix yet. Starting to consider switching carriers.',
      timestamp: '9 hours ago',
      likes: 98,
      comments: 43,
      shares: 12,
      sentiment: 'negative',
    },
    {
      id: '10',
      source: 'twitter',
      author: 'TravelerPro',
      authorHandle: 'travelerpro',
      content: 'Used T-Mobile in 5 countries this month. Seamless connectivity everywhere. The international plan is worth every penny! 🌍',
      timestamp: '10 hours ago',
      likes: 356,
      comments: 72,
      shares: 28,
      sentiment: 'positive',
    },
    {
      id: '11',
      source: 'twitter',
      author: 'CityDweller',
      authorHandle: 'citydweller',
      content: '5G speeds in the city are amazing, but when I go to my parents\' house in the suburbs, it drops to 4G. Coverage inconsistency is real.',
      timestamp: '11 hours ago',
      likes: 112,
      comments: 38,
      shares: 9,
      sentiment: 'neutral',
    },
    {
      id: '12',
      source: 'twitter',
      author: 'GamingEnthusiast',
      authorHandle: 'gamingenth',
      content: 'Low latency on T-Mobile 5G makes mobile gaming actually playable. No more lag spikes during competitive matches! 🎮',
      timestamp: '12 hours ago',
      likes: 289,
      comments: 64,
      shares: 21,
      sentiment: 'positive',
    },
    
    // Reddit Posts
    {
      id: '13',
      source: 'reddit',
      author: 'u/NetworkEnthusiast',
      content: 'Has anyone else noticed improved coverage in rural areas? I was driving through the mountains and had full bars where I used to have nothing. T-Mobile is really stepping up their game.',
      timestamp: '5 hours ago',
      likes: 189,
      comments: 67,
      sentiment: 'positive',
    },
    {
      id: '14',
      source: 'reddit',
      author: 'u/TechReviewer',
      content: 'The new T-Mobile app update is clean and intuitive. Much better than the previous version. Props to the design team!',
      timestamp: '6 hours ago',
      likes: 278,
      comments: 42,
      sentiment: 'positive',
    },
    {
      id: '15',
      source: 'reddit',
      author: 'u/PhoneUser123',
      content: 'Wish the data speeds were more consistent. Sometimes it\'s blazing fast, other times it crawls. Not sure if it\'s my location or the network.',
      timestamp: '8 hours ago',
      likes: 67,
      comments: 29,
      sentiment: 'neutral',
    },
    {
      id: '16',
      source: 'reddit',
      author: 'u/MobileSwitcher',
      content: 'Just switched from AT&T to T-Mobile. The coverage map looked good, but reality is different. Lots of dead zones in my commute. Regretting the switch.',
      timestamp: '2 hours ago',
      likes: 134,
      comments: 89,
      sentiment: 'negative',
    },
    {
      id: '17',
      source: 'reddit',
      author: 'u/DataSaver',
      content: 'T-Mobile\'s unlimited data is actually unlimited. No throttling after 50GB like other carriers. Been using 200GB+ monthly with no issues.',
      timestamp: '3 hours ago',
      likes: 312,
      comments: 124,
      sentiment: 'positive',
    },
    {
      id: '18',
      source: 'reddit',
      author: 'u/BudgetConscious',
      content: 'The $25/month plan is perfect for my needs. Unlimited talk/text and 5GB data. Can\'t beat that price anywhere else.',
      timestamp: '4 hours ago',
      likes: 245,
      comments: 78,
      sentiment: 'positive',
    },
    {
      id: '19',
      source: 'reddit',
      author: 'u/FrustratedUser',
      content: 'Been having issues with voicemail notifications not working. Support says it\'s a known issue but no ETA on fix. Pretty annoying.',
      timestamp: '7 hours ago',
      likes: 98,
      comments: 45,
      sentiment: 'negative',
    },
    {
      id: '20',
      source: 'reddit',
      author: 'u/5GExplorer',
      content: 'T-Mobile\'s 5G UC (Ultra Capacity) is legit. Getting 600+ Mbps in downtown areas. This is what 5G should be!',
      timestamp: '9 hours ago',
      likes: 401,
      comments: 156,
      sentiment: 'positive',
    },
    {
      id: '21',
      source: 'reddit',
      author: 'u/HomeOfficeWorker',
      content: 'Using T-Mobile Home Internet as backup. It\'s not as fast as fiber, but it\'s reliable and no contract. Good for emergencies.',
      timestamp: '10 hours ago',
      likes: 167,
      comments: 52,
      sentiment: 'neutral',
    },
    {
      id: '22',
      source: 'reddit',
      author: 'u/StreamingAddict',
      content: 'Streaming 4K content on T-Mobile 5G uses a lot of data, but no throttling means I can binge watch without worry. Love it!',
      timestamp: '11 hours ago',
      likes: 223,
      comments: 67,
      sentiment: 'positive',
    },
    {
      id: '23',
      source: 'reddit',
      author: 'u/NetworkSkeptic',
      content: 'Switched to T-Mobile 3 months ago. Coverage is okay, but call quality is worse than my previous carrier. Dropped calls are frequent.',
      timestamp: '12 hours ago',
      likes: 145,
      comments: 98,
      sentiment: 'negative',
    },
    {
      id: '24',
      source: 'reddit',
      author: 'u/TechEarlyAdopter',
      content: 'T-Mobile\'s network slicing for business customers is interesting. Wonder when they\'ll roll it out for consumers.',
      timestamp: '1 day ago',
      likes: 89,
      comments: 34,
      sentiment: 'neutral',
    },
    {
      id: '25',
      source: 'reddit',
      author: 'u/FamilyPlanManager',
      content: 'Managing 5 lines on T-Mobile is easy with the app. Can see everyone\'s usage, set limits, and control features. Family controls are great!',
      timestamp: '1 day ago',
      likes: 278,
      comments: 89,
      sentiment: 'positive',
    },
    {
      id: '26',
      source: 'reddit',
      author: 'u/InternationalTraveler',
      content: 'T-Mobile\'s international data is slow (256kbps) but it\'s free in 200+ countries. Good enough for maps and messaging while traveling.',
      timestamp: '1 day ago',
      likes: 156,
      comments: 72,
      sentiment: 'neutral',
    },
    
    // App Feedback Posts
    {
      id: '27',
      source: 'app',
      author: 'Michael Chen',
      content: 'Customer service was super helpful today! Resolved my billing issue in under 10 minutes. Great experience overall.',
      timestamp: '1 day ago',
      likes: 156,
      comments: 23,
      sentiment: 'positive',
    },
    {
      id: '28',
      source: 'app',
      author: 'Jennifer Martinez',
      content: 'Had some connectivity issues in my area yesterday. Called support and they said there was maintenance. All good now though.',
      timestamp: '2 days ago',
      likes: 45,
      comments: 12,
      sentiment: 'neutral',
    },
    {
      id: '29',
      source: 'app',
      author: 'Lisa Thompson',
      content: 'Love the new family plan features! Being able to manage everyone\'s usage from one dashboard is so convenient.',
      timestamp: '1 day ago',
      likes: 198,
      comments: 56,
      sentiment: 'positive',
    },
    {
      id: '30',
      source: 'app',
      author: 'John Anderson',
      content: 'The app keeps crashing when I try to view my bill. Updated to latest version but still having issues. Please fix this bug.',
      timestamp: '2 days ago',
      likes: 67,
      comments: 34,
      sentiment: 'negative',
    },
    {
      id: '31',
      source: 'app',
      author: 'Maria Garcia',
      content: 'Love the new dark mode in the app! Much easier on the eyes, especially at night. Great update!',
      timestamp: '2 days ago',
      likes: 234,
      comments: 45,
      sentiment: 'positive',
    },
    {
      id: '32',
      source: 'app',
      author: 'Chris Brown',
      content: 'Payment processing is slow. Takes forever to process credit card payments. Other apps are much faster.',
      timestamp: '3 days ago',
      likes: 89,
      comments: 28,
      sentiment: 'negative',
    },
    {
      id: '33',
      source: 'app',
      author: 'Amanda White',
      content: 'The data usage tracker is really helpful. Can see exactly what\'s using my data and when. Helps me stay within my plan limits.',
      timestamp: '2 days ago',
      likes: 178,
      comments: 39,
      sentiment: 'positive',
    },
    {
      id: '34',
      source: 'app',
      author: 'Daniel Lee',
      content: 'App notifications are inconsistent. Sometimes I get them, sometimes I don\'t. Missed important account updates because of this.',
      timestamp: '3 days ago',
      likes: 112,
      comments: 56,
      sentiment: 'negative',
    },
    {
      id: '35',
      source: 'app',
      author: 'Rachel Green',
      content: 'The new account security features are great! Two-factor authentication and biometric login make me feel much safer.',
      timestamp: '3 days ago',
      likes: 267,
      comments: 78,
      sentiment: 'positive',
    },
    {
      id: '36',
      source: 'app',
      author: 'Kevin Park',
      content: 'Wish the app had better offline functionality. Can\'t view my account details without internet connection.',
      timestamp: '4 days ago',
      likes: 98,
      comments: 42,
      sentiment: 'neutral',
    },
  ];

  const filteredPosts = activeFilter === 'all' 
    ? allPosts 
    : allPosts.filter(post => post.source === activeFilter);

  const filterOptions = [
    { id: 'all', label: 'All', icon: Filter },
    { id: 'twitter', label: 'Twitter', icon: Twitter },
    { id: 'reddit', label: 'Reddit', icon: MessageSquare },
    { id: 'app', label: 'App Feedback', icon: Smartphone },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0B0B]">
      <Sidebar />
      <main className="min-h-screen transition-all duration-300 md:ml-[250px]">
        <div className="max-w-5xl mx-auto px-4 py-8 md:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
              Community Pulse
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Real-time sentiment from Twitter, Reddit, and customer app feedback
            </p>
          </motion.div>

          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-200 dark:border-gray-800"
          >
            {filterOptions.map((filter) => {
              const Icon = filter.icon;
              const isActive = activeFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id as typeof activeFilter)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${
                      isActive
                        ? 'bg-[#E20074] text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{filter.label}</span>
                  {filter.id !== 'all' && (
                    <span className={`
                      text-xs px-1.5 py-0.5 rounded-full
                      ${isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }
                    `}>
                      {allPosts.filter(p => p.source === filter.id).length}
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>

          {/* Posts Grid */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post, index) => (
                  <PostCard key={post.id} post={post} index={index} />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <p className="text-gray-500 dark:text-gray-400">
                    No posts found for this filter.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Load More Button (for future pagination) */}
          {filteredPosts.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-center"
            >
              <button className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                Load More Posts
              </button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Community;

