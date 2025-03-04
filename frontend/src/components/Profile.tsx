import { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
  useToast,
  Button,
  HStack,
} from '@chakra-ui/react';
import { useAccount } from 'wagmi';
import { useContract } from '../hooks/useContract';
import { ethers } from 'ethers';

interface UserStats {
  totalBets: number;
  totalWins: number;
  totalAmount: string;
  betGameIds: number[];
}

interface BetHistory {
  gameId: number;
  amount: string;
  prediction: number;
  claimed: boolean;
  won: boolean;
  timestamp: number;
  canClaim: boolean;
}

// Sample data for fallback
const sampleStats = {
  totalBets: 15,
  totalWins: 8,
  totalAmount: '250.5',
  betGameIds: [1, 2, 3]
};

const sampleBetHistory: BetHistory[] = [
  {
    gameId: 1,
    amount: '50.0',
    prediction: 1,
    claimed: true,
    won: true,
    timestamp: Date.now() - 86400000, // 1 day ago
    canClaim: false
  },
  {
    gameId: 2,
    amount: '30.0',
    prediction: 2,
    claimed: true,
    won: false,
    timestamp: Date.now() - 172800000, // 2 days ago
    canClaim: false
  },
  {
    gameId: 3,
    amount: '25.5',
    prediction: 3,
    claimed: false,
    won: false,
    timestamp: Date.now() - 259200000, // 3 days ago
    canClaim: false
  }
];

export function Profile() {
  const { address } = useAccount();
  const { contract } = useContract();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>(sampleStats);
  const [betHistory, setBetHistory] = useState<BetHistory[]>(sampleBetHistory);
  const [claimingGameId, setClaimingGameId] = useState<number | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (!address) {
      setStats(sampleStats);
      setBetHistory(sampleBetHistory);
      setIsLoading(false);
      return;
    }

    fetchProfileData();
  }, [address, contract]);

  const handleClaimWinnings = async (gameId: number) => {
    if (!contract || !address) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setClaimingGameId(gameId);
    try {
      const tx = await contract.claimWinnings(gameId);
      
      toast({
        title: 'Claiming winnings...',
        description: 'Please wait for the transaction to be confirmed',
        status: 'info',
        duration: null,
        isClosable: true,
      });

      await tx.wait();
      
      toast({
        title: 'Success',
        description: 'Successfully claimed winnings!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Refresh profile data
      await fetchProfileData();
    } catch (error) {
      console.error('Error claiming winnings:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to claim winnings',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setClaimingGameId(null);
    }
  };

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);

      if (!contract || !address) {
        console.log('Contract or address not available, using sample data');
        setStats(sampleStats);
        setBetHistory(sampleBetHistory);
        setIsLoading(false);
        return;
      }

      try {
        // Get user's betting stats
        const userStats = await contract.getUserStats(address);
        console.log('Raw user stats:', userStats);

        // Format stats
        const formattedStats: UserStats = {
          totalBets: userStats?.totalBets ? parseInt(userStats.totalBets.toString()) : 0,
          totalWins: userStats?.totalWins ? parseInt(userStats.totalWins.toString()) : 0,
          totalAmount: userStats?.totalAmount ? ethers.utils.formatEther(userStats.totalAmount) : '0',
          betGameIds: userStats?.betGameIds ? 
            userStats.betGameIds
              .map((id: ethers.BigNumber) => parseInt(id.toString()))
              .filter((id: number) => id !== 0)
            : []
        };

        console.log('Formatted stats:', formattedStats);
        setStats(formattedStats);

        // Get bet history for each game
        const history: BetHistory[] = [];
        
        if (formattedStats.betGameIds && formattedStats.betGameIds.length > 0) {
          for (const gameId of formattedStats.betGameIds) {
            try {
              // Get game data
              const game = await contract.games(gameId);
              if (!game || !game.id || game.id.isZero()) continue;

              // Find the user's bet in this game
              let betAmount = ethers.BigNumber.from(0);
              let prediction = 0;

              // Check bets for each possible outcome (1: Home Win, 2: Away Win, 3: Draw)
              for (let i = 1; i <= 3; i++) {
                try {
                  const amount = await contract.bets(gameId, i, address);
                  if (amount && !amount.isZero()) {
                    betAmount = amount;
                    prediction = i;
                    break;
                  }
                } catch (error) {
                  console.error(`Error checking bet for game ${gameId} outcome ${i}:`, error);
                }
              }

              if (!betAmount.isZero()) {
                const isFinished = parseInt(game.status.toString()) === 2; // GameStatus.FINISHED = 2
                const gameResult = game.result ? parseInt(game.result.result.toString()) : 0;
                const won = isFinished && gameResult === prediction;
                const claimed = isFinished && await contract.hasClaimed(address, gameId);
                const canClaim = isFinished && won && !claimed;

                history.push({
                  gameId,
                  amount: ethers.utils.formatEther(betAmount),
                  prediction,
                  claimed,
                  won,
                  timestamp: parseInt(game.startTime.toString()) * 1000,
                  canClaim
                });
              }
            } catch (error) {
              console.error(`Error processing bet for game ${gameId}:`, error);
            }
          }
        }

        console.log('Bet history:', history);
        setBetHistory(history.sort((a, b) => b.timestamp - a.timestamp));
      } catch (error) {
        console.error('Contract error:', error);
        setStats(sampleStats);
        setBetHistory(sampleBetHistory);
        toast({
          title: 'Note',
          description: 'Using sample data while connecting to blockchain',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setStats(sampleStats);
      setBetHistory(sampleBetHistory);
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

  return (
    <Box p={4}>
      {!address ? (
        <VStack spacing={4} align="stretch">
          <Text>Please connect your wallet to view your profile</Text>
          <Button colorScheme="blue" onClick={() => {}}>
            Connect Wallet
          </Button>
        </VStack>
      ) : isLoading ? (
        <VStack spacing={4} align="center">
          <Spinner />
          <Text>Loading profile data...</Text>
        </VStack>
      ) : (
        <VStack spacing={6} align="stretch">
          <Heading size="lg">My Profile</Heading>
          
          <StatGroup>
            <Stat>
              <StatLabel>Total Bets</StatLabel>
              <StatNumber>{stats.totalBets}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Wins</StatLabel>
              <StatNumber>{stats.totalWins}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Total Amount Wagered</StatLabel>
              <StatNumber>{stats.totalAmount} ETN</StatNumber>
            </Stat>
          </StatGroup>

          <Box>
            <Heading size="md" mb={4}>Betting History</Heading>
            {betHistory.length > 0 ? (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Game</Th>
                    <Th>Amount</Th>
                    <Th>Prediction</Th>
                    <Th>Status</Th>
                    <Th>Date</Th>
                    <Th>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {betHistory.map((bet) => (
                    <Tr key={bet.gameId}>
                      <Td>Game #{bet.gameId}</Td>
                      <Td>{bet.amount} ETN</Td>
                      <Td>
                        {bet.prediction === 1 ? 'Home Win' :
                         bet.prediction === 2 ? 'Away Win' : 'Draw'}
                      </Td>
                      <Td>
                        {bet.claimed ? (
                          bet.won ? (
                            <Badge colorScheme="green">Won</Badge>
                          ) : (
                            <Badge colorScheme="red">Lost</Badge>
                          )
                        ) : bet.won ? (
                          <Badge colorScheme="green">Won - Unclaimed</Badge>
                        ) : (
                          <Badge colorScheme="yellow">Pending</Badge>
                        )}
                      </Td>
                      <Td>{new Date(bet.timestamp).toLocaleDateString()}</Td>
                      <Td>
                        {bet.canClaim && (
                          <Button
                            colorScheme="green"
                            size="sm"
                            isLoading={claimingGameId === bet.gameId}
                            onClick={() => handleClaimWinnings(bet.gameId)}
                          >
                            Claim Winnings
                          </Button>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <Text>No betting history available</Text>
            )}
          </Box>
        </VStack>
      )}
    </Box>
  );
}
