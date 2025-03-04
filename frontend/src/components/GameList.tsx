import { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  VStack,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  Divider,
  Badge,
  useToast,
  Button
} from '@chakra-ui/react';
import { useContract } from '../hooks/useContract';
import { Game, GameStatus } from '../types/contracts';
import { BettingInterface } from './BettingInterface';
import { Comments } from './Comments';
import { ethers } from 'ethers';

interface LeaderboardEntry {
  address: string;
  totalWinnings: number;
  gamesWon: number;
}

interface FormattedGame {
  id: number;
  homeTeam: string;
  awayTeam: string;
  startTime: number;
  league: string;
  season: string;
  matchDay: string;
  status: GameStatus;
  totalBets: string;
  pools: string[];
  result: {
    result: number;
    homeScore: number;
    awayScore: number;
    submittedAt: number;
    confirmations: number;
    dataSource: string;
  } | null;
  finalizedAt: number;
}

// Sample games data for fallback
const sampleGames: FormattedGame[] = [
  {
    id: 1,
    homeTeam: 'Arsenal',
    awayTeam: 'Manchester City',
    startTime: Date.now() + 3600000, // 1 hour from now
    league: 'Premier League',
    season: '2024/2025',
    matchDay: 'Round 28',
    status: GameStatus.ACTIVE,
    totalBets: '0',
    pools: ['0', '0', '0'],
    result: null
  },
  {
    id: 2,
    homeTeam: 'Liverpool',
    awayTeam: 'Manchester United',
    startTime: Date.now() + 7200000, // 2 hours from now
    league: 'Premier League',
    season: '2024/2025',
    matchDay: 'Round 28',
    status: GameStatus.ACTIVE,
    totalBets: '0',
    pools: ['0', '0', '0'],
    result: null
  },
  {
    id: 3,
    homeTeam: 'Chelsea',
    awayTeam: 'Tottenham',
    startTime: Date.now() + 10800000, // 3 hours from now
    league: 'Premier League',
    season: '2024/2025',
    matchDay: 'Round 28',
    status: GameStatus.ACTIVE,
    totalBets: '0',
    pools: ['0', '0', '0'],
    result: null
  }
];

const sampleLeaderboard = [
  { address: '0x1234...5678', totalWinnings: 25.5, gamesWon: 8 },
  { address: '0x8765...4321', totalWinnings: 22.2, gamesWon: 7 },
  { address: '0x9876...0123', totalWinnings: 18.7, gamesWon: 6 },
  { address: '0xabcd...efgh', totalWinnings: 15.3, gamesWon: 5 },
  { address: '0xijkl...mnop', totalWinnings: 12.8, gamesWon: 4 },
  { address: '0xqrst...uvwx', totalWinnings: 10.5, gamesWon: 4 },
  { address: '0x2468...1357', totalWinnings: 8.9, gamesWon: 3 },
  { address: '0x1357...2468', totalWinnings: 7.2, gamesWon: 3 },
  { address: '0xaaaa...bbbb', totalWinnings: 5.5, gamesWon: 2 },
  { address: '0xcccc...dddd', totalWinnings: 3.8, gamesWon: 1 }
];

export function GameList() {
  const { contract } = useContract();
  const [games, setGames] = useState<FormattedGame[]>(sampleGames);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchGames();
  }, [contract]);

  const fetchGames = async () => {
    try {
      setIsLoading(true);

      if (!contract) {
        console.log('Contract not initialized yet, using sample data');
        setGames(sampleGames);
        setLeaderboard(sampleLeaderboard);
        setIsLoading(false);
        return;
      }

      // Fetch games
      const gameIds = [1, 2, 3]; // For now, we'll fetch first 3 games
      console.log('Fetching games:', gameIds);

      const gamesData = await Promise.all(
        gameIds.map(async (id) => {
          try {
            const game = await contract.games(id);
            console.log(`Game ${id} data:`, game);

            // Check if game exists and has valid data
            if (!game || !game.id || game.id.isZero()) {
              console.log(`Game ${id} does not exist, using sample game`);
              return sampleGames[id - 1];
            }

            // Get betting pools
            let pools = [ethers.BigNumber.from(0), ethers.BigNumber.from(0), ethers.BigNumber.from(0)];
            try {
              pools = game.pools || pools;
            } catch (error) {
              console.error(`Error getting pools for game ${id}:`, error);
            }

            // Calculate total bets
            const totalBets = pools.reduce(
              (acc: ethers.BigNumber, curr: ethers.BigNumber) => acc.add(curr),
              ethers.BigNumber.from(0)
            );

            // Format the game data
            return {
              id: parseInt(game.id.toString()),
              homeTeam: game.homeTeam || sampleGames[id - 1].homeTeam,
              awayTeam: game.awayTeam || sampleGames[id - 1].awayTeam,
              startTime: parseInt(game.startTime.toString()) * 1000,
              league: game.league || sampleGames[id - 1].league,
              season: game.season || sampleGames[id - 1].season,
              matchDay: game.matchDay || sampleGames[id - 1].matchDay,
              status: parseInt(game.status.toString()),
              result: game.result ? {
                result: parseInt(game.result.result.toString()),
                homeScore: parseInt(game.result.homeScore.toString()),
                awayScore: parseInt(game.result.awayScore.toString()),
                submittedAt: parseInt(game.result.submittedAt.toString()) * 1000,
                confirmations: parseInt(game.result.confirmations.toString()),
                dataSource: game.result.dataSource
              } : null,
              pools: pools.map(p => ethers.utils.formatEther(p)),
              totalBets: ethers.utils.formatEther(totalBets)
            };
          } catch (error) {
            console.error(`Error fetching game ${id}:`, error);
            return sampleGames[id - 1];
          }
        })
      );

      console.log('All games data:', gamesData);
      setGames(gamesData.sort((a, b) => a.startTime - b.startTime));

      // Fetch leaderboard data
      try {
        const users = await contract.getUsers();
        console.log('Users:', users);

        if (!users || users.length === 0) {
          setLeaderboard(sampleLeaderboard);
          return;
        }

        const leaderboardData = await Promise.all(
          users.map(async (userAddress: string) => {
            try {
              const stats = await contract.getUserStats(userAddress);
              return {
                address: userAddress,
                totalWinnings: parseFloat(ethers.utils.formatEther(stats.totalAmount)),
                gamesWon: parseInt(stats.totalWins.toString())
              };
            } catch (error) {
              console.error(`Error fetching stats for user ${userAddress}:`, error);
              return null;
            }
          })
        );

        const validLeaderboard = leaderboardData
          .filter((item): item is LeaderboardEntry => item !== null)
          .sort((a, b) => b.totalWinnings - a.totalWinnings)
          .slice(0, 10);

        setLeaderboard(validLeaderboard.length > 0 ? validLeaderboard : sampleLeaderboard);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setLeaderboard(sampleLeaderboard);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      setGames(sampleGames);
      setLeaderboard(sampleLeaderboard);
      toast({
        title: 'Note',
        description: 'Using sample data while connecting to blockchain',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusBadge = (status: GameStatus) => {
    switch (status) {
      case GameStatus.PENDING:
        return <Badge colorScheme="yellow">Pending</Badge>;
      case GameStatus.ACTIVE:
        return <Badge colorScheme="green">Active</Badge>;
      case GameStatus.FINISHED:
        return <Badge colorScheme="blue">Finished</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Text>Loading games...</Text>
      </Box>
    );
  }

  if (!games.length) {
    return (
      <Box textAlign="center" py={10}>
        <Text>No games available at the moment.</Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <VStack spacing={8} align="stretch">
        {/* League Filter Section */}
        <Box>
          <Heading size="md" mb={4}>Popular Leagues</Heading>
          <SimpleGrid columns={{ base: 3, md: 6 }} spacing={4}>
            <Button 
              variant="outline" 
              leftIcon={<Text>🏆</Text>}
              color="white"
              _hover={{ bg: 'whiteAlpha.200' }}
              borderColor="whiteAlpha.400"
            >
              UCL
            </Button>
            <Button 
              variant="outline" 
              leftIcon={<Text>⚽</Text>}
              color="white"
              _hover={{ bg: 'whiteAlpha.200' }}
              borderColor="whiteAlpha.400"
            >
              EPL
            </Button>
            <Button 
              variant="outline" 
              leftIcon={<Text>🏴󠁧󠁢󠁥󠁮󠁧󠁿</Text>}
              color="white"
              _hover={{ bg: 'whiteAlpha.200' }}
              borderColor="whiteAlpha.400"
            >
              Championship
            </Button>
            <Button 
              variant="outline" 
              leftIcon={<Text>🇪🇸</Text>}
              color="white"
              _hover={{ bg: 'whiteAlpha.200' }}
              borderColor="whiteAlpha.400"
            >
              La Liga
            </Button>
            <Button 
              variant="outline" 
              leftIcon={<Text>🇮🇹</Text>}
              color="white"
              _hover={{ bg: 'whiteAlpha.200' }}
              borderColor="whiteAlpha.400"
            >
              Serie A
            </Button>
            <Button 
              variant="outline" 
              leftIcon={<Text>🇫🇷</Text>}
              color="white"
              _hover={{ bg: 'whiteAlpha.200' }}
              borderColor="whiteAlpha.400"
            >
              Ligue 1
            </Button>
          </SimpleGrid>
        </Box>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
          {/* Games Section */}
          <VStack align="stretch" spacing={6}>
            <HStack justify="space-between">
              <Heading size="md">Live Games</Heading>
              <Heading size="md" color="gray.500">Upcoming</Heading>
            </HStack>
            
            {games.map((game) => (
              <Box key={game.id} p={4} borderWidth="1px" borderRadius="lg">
                <VStack align="stretch" spacing={4}>
                  <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="bold">
                      {game.homeTeam} vs {game.awayTeam}
                    </Text>
                    {getStatusBadge(game.status)}
                  </HStack>

                  <Divider />

                  <HStack justify="space-between">
                    <Text>{game.league}</Text>
                    <Text>{game.season}</Text>
                    <Text>{game.matchDay}</Text>
                  </HStack>

                  <Text>Start Time: {formatTimestamp(game.startTime)}</Text>

                  {game.status === GameStatus.FINISHED && game.result && (
                    <HStack justify="center">
                      <Text fontSize="xl" fontWeight="bold">
                        {game.result.homeScore} - {game.result.awayScore}
                      </Text>
                    </HStack>
                  )}

                  {game.status === GameStatus.ACTIVE && (
                    <BettingInterface gameId={game.id} />
                  )}
                  <Comments gameId={game.id} />
                </VStack>
              </Box>
            ))}
          </VStack>

          {/* Leaderboard Section */}
          <VStack align="stretch" spacing={6}>
            <Heading size="md">Top Players 🏆</Heading>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Player</Th>
                  <Th isNumeric>Winnings</Th>
                  <Th isNumeric>Games Won</Th>
                </Tr>
              </Thead>
              <Tbody>
                {leaderboard.map((entry, index) => (
                  <Tr key={index}>
                    <Td>{entry.address}</Td>
                    <Td isNumeric>{entry.totalWinnings} ETN</Td>
                    <Td isNumeric>{entry.gamesWon}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </VStack>
        </SimpleGrid>
      </VStack>
    </Box>
  );
}
