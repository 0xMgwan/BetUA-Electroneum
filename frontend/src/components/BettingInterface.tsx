import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  Input,
  VStack,
  Text,
  useToast,
  RadioGroup,
  Radio,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  HStack,
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import { useContract } from '../hooks/useContract';
import { BetOutcome } from '../types/contracts';

interface BettingInterfaceProps {
  gameId: number;
}

export function BettingInterface({ gameId }: BettingInterfaceProps) {
  const { contract, address, connectWallet } = useContract();
  const [amount, setAmount] = useState('');
  const [outcome, setOutcome] = useState<BetOutcome>(BetOutcome.HOME);
  const [isLoading, setIsLoading] = useState(false);
  const [odds, setOdds] = useState({ home: 1.95, away: 1.95, draw: 3.5 });
  const toast = useToast();

  // Calculate potential winnings based on selected outcome and amount
  const calculateWinnings = () => {
    if (!amount || isNaN(parseFloat(amount))) return 0;
    const selectedOdds = outcome === BetOutcome.HOME ? odds.home :
                        outcome === BetOutcome.AWAY ? odds.away : odds.draw;
    return parseFloat(amount) * selectedOdds;
  };

  const handleBet = async () => {
    try {
      if (!contract || !address) {
        toast({
          title: 'Wallet Not Connected',
          description: 'Please connect your wallet to place a bet',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        await connectWallet();
        return;
      }

      if (!amount || parseFloat(amount) <= 0) {
        toast({
          title: 'Invalid Amount',
          description: 'Please enter a valid betting amount',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      setIsLoading(true);

      try {
        // Convert amount to wei and create transaction
        const amountInWei = ethers.utils.parseEther(amount);
        const tx = await contract.placeBet(gameId, outcome, { value: amountInWei });

        toast({
          title: 'Transaction Pending',
          description: 'Processing your bet...',
          status: 'info',
          duration: null,
          isClosable: true,
        });

        await tx.wait();

        toast({
          title: 'Success',
          description: 'Your bet has been placed!',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        setAmount('');
      } catch (error) {
        console.error('Contract error:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to place bet',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error placing bet:', error);
      toast({
        title: 'Error',
        description: 'Failed to place bet',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="whiteAlpha.50">
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="bold" color="white">Place Your Bet</Text>

        <FormControl>
          <RadioGroup value={outcome.toString()} onChange={(value) => setOutcome(parseInt(value) as BetOutcome)}>
            <Stack direction="row" spacing={4}>
              <Radio value={BetOutcome.HOME.toString()} colorScheme="blue">
                <Text color="white">Home Win ({odds.home}x)</Text>
              </Radio>
              <Radio value={BetOutcome.AWAY.toString()} colorScheme="blue">
                <Text color="white">Away Win ({odds.away}x)</Text>
              </Radio>
              <Radio value={BetOutcome.DRAW.toString()} colorScheme="blue">
                <Text color="white">Draw ({odds.draw}x)</Text>
              </Radio>
            </Stack>
          </RadioGroup>
        </FormControl>

        <FormControl>
          <Input
            type="number"
            placeholder="Amount in ETN"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            color="white"
            borderColor="whiteAlpha.300"
            _hover={{ borderColor: "whiteAlpha.400" }}
            _focus={{ borderColor: "blue.300" }}
          />
        </FormControl>

        {amount && parseFloat(amount) > 0 && (
          <Stat>
            <StatLabel color="gray.300">Potential Winnings</StatLabel>
            <StatNumber color="green.300">{calculateWinnings().toFixed(2)} ETN</StatNumber>
            <StatHelpText color="gray.400">
              at {outcome === BetOutcome.HOME ? odds.home :
                  outcome === BetOutcome.AWAY ? odds.away : odds.draw}x odds
            </StatHelpText>
          </Stat>
        )}

        <Button
          colorScheme="blue"
          onClick={handleBet}
          isLoading={isLoading}
          loadingText="Placing Bet..."
        >
          Place Bet
        </Button>
      </VStack>
    </Box>
  );
}
