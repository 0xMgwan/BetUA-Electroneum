import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  Text,
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
  Button,
  useToast,
  Spinner,
  Badge,
  HStack,
} from '@chakra-ui/react';
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
  won: boolean;
  claimed: boolean;
  canClaim: boolean;
  timestamp: number;
}

const sampleStats: UserStats = {
  totalBets: 5,
  totalWins: 3,
  totalAmount: '1.5',
  betGameIds: [1, 2, 3]
};

const sampleBetHistory: BetHistory[] = [
  {
    gameId: 1,
    amount: '0.5',
    prediction: 1,
    won: true,
    claimed: true,
    canClaim: false,
    timestamp: Date.now() - 86400000
  },
  {
    gameId: 2,
    amount: '0.5',
    prediction: 2,
    won: true,
    claimed: false,
    canClaim: true,
    timestamp: Date.now() - 172800000
  },
  {
    gameId: 3,
    amount: '0.5',
    prediction: 3,
    won: false,
    claimed: false,
    canClaim: false,
    timestamp: Date.now() - 259200000
  }
];

const Profile = () => {
  const { contract, address, connectWallet } = useContract();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>(sampleStats);
  const [betHistory, setBetHistory] = useState<BetHistory[]>(sampleBetHistory);
  const [claimingGameId, setClaimingGameId] = useState<number | null>(null);
  const toast = useToast();

  const handleClaimWinnings = async (gameId: number) => {
    if (!contract || !address) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setClaimingGameId(gameId);
      const tx = await contract.claimWinnings(gameId);
      await tx.wait();
      
      toast({
        title: 'Success',
        description: 'Successfully claimed winnings!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Refresh the profile data
      fetchProfileData();
    } catch (error) {
      console.error('Error claiming winnings:', error);
      toast({
        title: 'Error',
        description: 'Failed to claim winnings',
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
      if (!contract || !address) {
        setStats(sampleStats);
        setBetHistory(sampleBetHistory);
        setIsLoading(false);
        return;
      }

      // Get user stats
      const userStats = await contract.getUserStats(address);
      if (!userStats) {
        throw new Error('Failed to fetch user stats');
      }

      // Format stats
      const formattedStats: UserStats = {
        totalBets: parseInt(userStats.totalBets.toString()),
        totalWins: parseInt(userStats.totalWins.toString()),
        totalAmount: ethers.utils.formatEther(userStats.totalAmount),
        betGameIds: userStats.betGameIds
          .map((id: ethers.BigNumber) => parseInt(id.toString()))
          .filter((id: number) => id !== 0)
      };

      setStats(formattedStats);

      // Get bet history
      const history: BetHistory[] = [];
      for (const gameId of formattedStats.betGameIds) {
        const game = await contract.games(gameId);
        if (!game || game.id.isZero()) continue;

        // Find user's bet
        for (let outcome = 1; outcome <= 3; outcome++) {
          const betAmount = await contract.bets(gameId, outcome, address);
          if (!betAmount.isZero()) {
            const isFinished = game.status.toNumber() === 2;
            const won = isFinished && game.result && game.result.result.toNumber() === outcome;
            const claimed = isFinished && await contract.hasClaimed(address, gameId);

            history.push({
              gameId,
              amount: ethers.utils.formatEther(betAmount),
              prediction: outcome,
              won,
              claimed,
              canClaim: won && !claimed,
              timestamp: game.startTime.toNumber() * 1000
            });
            break;
          }
        }
      }

      setBetHistory(history.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Error fetching profile data:', error);
      // Use sample data as fallback
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

  useEffect(() => {
    fetchProfileData();
  }, [address, contract]);

  const getPredictionText = (prediction: number) => {
    switch (prediction) {
      case 1: return 'Home Win';
      case 2: return 'Away Win';
      case 3: return 'Draw';
      default: return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <Box p={4} display="flex" justifyContent="center" alignItems="center" minH="200px">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <VStack spacing={8} align="stretch">
        {!address ? (
          <VStack spacing={4} align="stretch">
            <Text fontSize="lg" textAlign="center">Please connect your wallet to view your profile</Text>
            <Button colorScheme="blue" onClick={connectWallet}>
              Connect Wallet
            </Button>
          </VStack>
        ) : (
          <>
            <Box>
              <Text fontSize="2xl" mb={4}>Your Betting Stats</Text>
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
            </Box>

            <Box>
              <Text fontSize="2xl" mb={4}>Betting History</Text>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Game ID</Th>
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
                      <Td>{bet.gameId}</Td>
                      <Td>{bet.amount} ETN</Td>
                      <Td>{getPredictionText(bet.prediction)}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <Badge colorScheme={bet.won ? 'green' : 'red'}>
                            {bet.won ? 'Won' : 'Lost'}
                          </Badge>
                          {bet.won && (
                            <Badge colorScheme={bet.claimed ? 'gray' : 'yellow'}>
                              {bet.claimed ? 'Claimed' : 'Unclaimed'}
                            </Badge>
                          )}
                        </HStack>
                      </Td>
                      <Td>{new Date(bet.timestamp).toLocaleString()}</Td>
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
            </Box>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default Profile;
