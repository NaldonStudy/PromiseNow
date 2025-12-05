// Query Keys
export const leaderboardKeys = {
  all: ['leaderboard'] as const,
  leaderboard: (roomId: number) => [...leaderboardKeys.all, 'leaderboard', roomId] as const,
}; 