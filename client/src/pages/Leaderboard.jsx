// import React, { useState, useEffect } from 'react';
// import { useAppContext } from "../App";
// import { leaderboardService } from "../services/leaderboardService";

// const Leaderboard = ({ user, globalStats }) => {
//   // Access user from props or from context
//   const { user: contextUser } = useAppContext();
//   const currentUser = user || contextUser;
  
//   // State for Daily Challenge section
//   const [dailyLeaderboard, setDailyLeaderboard] = useState([]);
//   const [dailyLoading, setDailyLoading] = useState(true);
//   const [dailyError, setDailyError] = useState(null);
//   const [dailyPagination, setDailyPagination] = useState({
//     page: 1,
//     limit: 10
//   });
  
//   // State for All-time Users section
//   const [userRankings, setUserRankings] = useState([]);
//   const [userRankingsLoading, setUserRankingsLoading] = useState(true);
//   const [userRankingsError, setUserRankingsError] = useState(null);
//   const [userRankingsPagination, setUserRankingsPagination] = useState({
//     page: 1,
//     limit: 10
//   });
  
//   // State for active tab
//   const [activeTab, setActiveTab] = useState('daily');
  
//   // User's own rank
//   const [userRank, setUserRank] = useState(null);
  
//   // Fetch Daily Challenge leaderboard
//   useEffect(() => {
//     async function fetchDailyLeaderboard() {
//       try {
//         setDailyLoading(true);
//         const response = await leaderboardService.getDailyChallengeLeaderboard({
//           page: dailyPagination.page,
//           limit: dailyPagination.limit
//         });
        
//         if (response.success) {
//           setDailyLeaderboard(response.data);
//           setDailyError(null);
//         } else {
//           setDailyError(response.message || 'Failed to load daily challenge leaderboard');
//         }
//       } catch (err) {
//         console.error('Failed to fetch daily challenge leaderboard:', err);
//         setDailyError('Failed to load daily challenge data. Please try again later.');
//       } finally {
//         setDailyLoading(false);
//       }
//     }
    
//     fetchDailyLeaderboard();
//   }, [dailyPagination]);
  
//   // Fetch All-time User rankings
//   useEffect(() => {
//     async function fetchUserRankings() {
//       try {
//         setUserRankingsLoading(true);
//         const response = await leaderboardService.getAllTimeUserRankings({
//           page: userRankingsPagination.page,
//           limit: userRankingsPagination.limit
//         });
        
//         if (response.success) {
//           setUserRankings(response.data);
//           setUserRankingsError(null);
//         } else {
//           setUserRankingsError(response.message || 'Failed to load user rankings');
//         }
//       } catch (err) {
//         console.error('Failed to fetch user rankings:', err);
//         setUserRankingsError('Failed to load user rankings data. Please try again later.');
//       } finally {
//         setUserRankingsLoading(false);
//       }
//     }
    
//     fetchUserRankings();
//   }, [userRankingsPagination]);
  
//   // Fetch user's own ranking
//   useEffect(() => {
//     async function fetchUserRanking() {
//       if (!currentUser) return;
      
//       try {
//         const response = await leaderboardService.getUserRanking(currentUser.uid);
//         if (response.success) {
//           setUserRank(response.data);
//         }
//       } catch (err) {
//         console.error('Failed to fetch user ranking:', err);
//       }
//     }
    
//     fetchUserRanking();
//   }, [currentUser]);
  
//   // Handle page change for Daily Challenge
//   const handleDailyPageChange = (newPage) => {
//     setDailyPagination({
//       ...dailyPagination,
//       page: newPage
//     });
//   };
  
//   // Handle page change for User Rankings
//   const handleUserRankingsPageChange = (newPage) => {
//     setUserRankingsPagination({
//       ...userRankingsPagination,
//       page: newPage
//     });
//   };

//   return (
//     <div className="container mx-auto px-4 py-8 ">
//       <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 mt-12">Leaderboard</h1>
      
//       {/* User's personal ranking card */}
//       {userRank && (
//         <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-lg shadow-md mb-6">
//           <div className="flex justify-between items-center">
//             <div>
//               <h2 className="text-lg font-semibold">Your Ranking</h2>
//               <p className="text-3xl font-bold">{userRank.ranking}</p>
//             </div>
//             <div className="text-right">
//               <p className="text-sm">Best Performance</p>
//               <p className="text-xl font-bold">{userRank.bestWpm} WPM</p>
//               <p className="text-sm">{userRank.bestAccuracy}% accuracy</p>
//             </div>
//           </div>
//         </div>
//       )}
      
//       {/* Tab navigation */}
//       <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
//         <button
//           className={`py-2 px-4 font-medium text-sm ${
//             activeTab === 'daily'
//               ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
//               : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
//           }`}
//           onClick={() => setActiveTab('daily')}
//         >
//           Daily Challenge
//         </button>
//         <button
//           className={`py-2 px-4 font-medium text-sm ${
//             activeTab === 'alltime'
//               ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
//               : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
//           }`}
//           onClick={() => setActiveTab('alltime')}
//         >
//           All-Time Rankings
//         </button>
//       </div>
      
//       {/* Daily Challenge Leaderboard */}
//       {activeTab === 'daily' && (
//         <div>
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-xl font-bold text-gray-800 dark:text-white">Today's Daily Challenge</h2>
//             {/* <div className="text-sm text-gray-500 dark:text-gray-400">
//               Updated in real-time
//             </div> */}
//           </div>
          
//           {dailyLoading && (
//             <div className="flex justify-center items-center py-12">
//               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
//             </div>
//           )}
          
//           {dailyError && (
//             <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-md mb-6">
//               <p>{dailyError}</p>
//               <button 
//                 onClick={() => setDailyPagination({...dailyPagination, page: 1})}
//                 className="mt-2 text-sm underline"
//               >
//                 Try Again
//               </button>
//             </div>
//           )}
          
//           {!dailyLoading && dailyLeaderboard.length === 0 && (
//             <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
//               <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//               </svg>
//               <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No Daily Challenge Results</h3>
//               <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
//                 No one has completed today's daily challenge yet. Be the first one!
//               </p>
//             </div>
//           )}
          
//           {!dailyLoading && dailyLeaderboard.length > 0 && (
//             <>
//               <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
//                 <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
//                   <thead className="bg-gray-50 dark:bg-gray-900/50">
//                     <tr>
//                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
//                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
//                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Average WPM</th>
//                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Average Accuracy</th>
//                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tests</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
//                     {dailyLeaderboard.map((entry, index) => (
//                       <tr key={entry._id} className={currentUser && entry.userInfo.firebaseUid === currentUser.uid ? "bg-indigo-50 dark:bg-indigo-900/20" : ""}>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
//                           {(dailyPagination.page - 1) * dailyPagination.limit + index + 1}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center">
//                             {entry.userInfo.picture ? (
//                               <img 
//                                 src={entry.userInfo.picture} 
//                                 alt={entry.userInfo.name} 
//                                 className="h-8 w-8 rounded-full mr-3"
//                               />
//                             ) : (
//                               <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center mr-3">
//                                 <span className="text-white text-sm font-medium">
//                                   {entry.userInfo.name[0].toUpperCase()}
//                                 </span>
//                               </div>
//                             )}
//                             <div className="text-sm font-medium text-gray-900 dark:text-white">
//                               {entry.userInfo.name}
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
//                           <span className="font-semibold text-green-600 dark:text-green-400">
//                             {entry.averageWpm}
//                           </span> WPM
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
//                           {entry.averageAccuracy}%
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
//                           {entry.testCount}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
              
//               {/* Pagination for Daily Challenge */}
//               <div className="flex items-center justify-between mt-6">
//                 <div className="text-sm text-gray-700 dark:text-gray-300">
//                   Showing page {dailyPagination.page}
//                 </div>
//                 <div className="flex space-x-2">
//                   <button
//                     onClick={() => handleDailyPageChange(dailyPagination.page - 1)}
//                     disabled={dailyPagination.page === 1}
//                     className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     Previous
//                   </button>
//                   <button
//                     onClick={() => handleDailyPageChange(dailyPagination.page + 1)}
//                     disabled={dailyLeaderboard.length < dailyPagination.limit}
//                     className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       )}
      
//       {/* All-Time User Rankings */}
//       {activeTab === 'alltime' && (
//         <div>
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-xl font-bold text-gray-800 dark:text-white">All-Time User Rankings</h2>
//             <div className="text-sm text-gray-500 dark:text-gray-400">
//               Based on average performance
//             </div>
//           </div>
          
//           {userRankingsLoading && (
//             <div className="flex justify-center items-center py-12">
//               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
//             </div>
//           )}
          
//           {userRankingsError && (
//             <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-md mb-6">
//               <p>{userRankingsError}</p>
//               <button 
//                 onClick={() => setUserRankingsPagination({...userRankingsPagination, page: 1})}
//                 className="mt-2 text-sm underline"
//               >
//                 Try Again
//               </button>
//             </div>
//           )}
          
//           {!userRankingsLoading && userRankings.length > 0 && (
//             <>
//               <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
//                 <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
//                   <thead className="bg-gray-50 dark:bg-gray-900/50">
//                     <tr>
//                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
//                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
//                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Average WPM</th>
//                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Average Accuracy</th>
//                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Best WPM</th>
//                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tests</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
//                     {userRankings.map((entry, index) => (
//                       <tr key={entry._id} className={currentUser && entry.userInfo.firebaseUid === currentUser.uid ? "bg-indigo-50 dark:bg-indigo-900/20" : ""}>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
//                           {(userRankingsPagination.page - 1) * userRankingsPagination.limit + index + 1}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center">
//                             {entry.userInfo.picture ? (
//                               <img 
//                                 src={entry.userInfo.picture} 
//                                 alt={entry.userInfo.name} 
//                                 className="h-8 w-8 rounded-full mr-3"
//                               />
//                             ) : (
//                               <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center mr-3">
//                                 <span className="text-white text-sm font-medium">
//                                   {entry.userInfo.name[0].toUpperCase()}
//                                 </span>
//                               </div>
//                             )}
//                             <div className="text-sm font-medium text-gray-900 dark:text-white">
//                               {entry.userInfo.name}
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
//                           <span className="font-semibold text-green-600 dark:text-green-400">
//                             {entry.averageWpm}
//                           </span> WPM
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
//                           {entry.averageAccuracy}%
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
//                           <span className="font-semibold text-purple-600 dark:text-purple-400">
//                             {entry.bestWpm}
//                           </span> WPM
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
//                           {entry.testCount}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
              
//               {/* Pagination for User Rankings */}
//               <div className="flex items-center justify-between mt-6">
//                 <div className="text-sm text-gray-700 dark:text-gray-300">
//                   Showing page {userRankingsPagination.page}
//                 </div>
//                 <div className="flex space-x-2">
//                   <button
//                     onClick={() => handleUserRankingsPageChange(userRankingsPagination.page - 1)}
//                     disabled={userRankingsPagination.page === 1}
//                     className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     Previous
//                   </button>
//                   <button
//                     onClick={() => handleUserRankingsPageChange(userRankingsPagination.page + 1)}
//                     disabled={userRankings.length < userRankingsPagination.limit}
//                     className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             </>
//           )}
          
//           {!userRankingsLoading && userRankings.length === 0 && (
//             <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
//               <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//               </svg>
//               <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No User Rankings</h3>
//               <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
//                 There are no users with enough tests to be ranked yet.
//               </p>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Leaderboard;

import React from 'react'

const Leaderboard = () => {
  return (
    <div>Leaderboard</div>
  )
}

export default Leaderboard