import React from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useContract } from '../hooks/useContract';

interface FeatureProps {
  title: string;
  description: string;
}

function Feature({ title, description }: FeatureProps) {
  return (
    <Stack spacing={2} flex="1" textAlign="center">
      <Text fontWeight="bold" fontSize="lg">
        {title}
      </Text>
      <Text color={useColorModeValue('gray.600', 'gray.400')}>
        {description}
      </Text>
    </Stack>
  );
}

const Hero: React.FC = () => {
  const { connectWallet, isConnecting } = useContract();
  const bgGradient = useColorModeValue(
    'linear(to-r, blue.400, purple.500)',
    'linear(to-r, blue.600, purple.700)'
  );

  return (
    <Box
      as="section"
      pt={{ base: '4rem', md: '6rem' }}
      pb={{ base: '0', md: '2rem' }}
    >
      <Container maxW="container.xl">
        <Stack
          spacing={{ base: 8, md: 10 }}
          textAlign="center"
          alignItems="center"
        >
          <Heading
            fontSize={{ base: '3xl', sm: '4xl', md: '6xl' }}
            lineHeight="1.2"
            fontWeight="bold"
          >
            <Text
              as="span"
              position="relative"
              bgGradient={bgGradient}
              bgClip="text"
            >
              Decentralized Sports Betting
            </Text>
          </Heading>

          <Text
            maxW="3xl"
            fontSize={{ base: 'lg', md: 'xl' }}
            color={useColorModeValue('gray.600', 'gray.400')}
          >
            Place bets on your favorite sports using cryptocurrency. Secure,
            transparent, and powered by smart contracts on the blockchain.
          </Text>

          <Stack
            direction={{ base: 'column', sm: 'row' }}
            spacing={4}
            justify="center"
          >
            <Button
              size="lg"
              colorScheme="blue"
              onClick={connectWallet}
              isLoading={isConnecting}
              loadingText="Connecting..."
            >
              Start Betting
            </Button>
            <Button
              as="a"
              size="lg"
              href="#how-it-works"
              variant="outline"
              colorScheme="blue"
            >
              Learn More
            </Button>
          </Stack>

          <Box
            rounded="2xl"
            p={{ base: 4, sm: 8 }}
            bg={useColorModeValue('gray.50', 'gray.800')}
            width="full"
            maxW="4xl"
          >
            <Stack
              direction={{ base: 'column', md: 'row' }}
              spacing={{ base: 4, md: 8 }}
              justify="center"
            >
              <Feature
                title="Secure"
                description="Smart contracts ensure fair and transparent betting"
              />
              <Feature
                title="Fast"
                description="Instant payouts directly to your wallet"
              />
              <Feature
                title="Low Fees"
                description="Minimal fees compared to traditional betting"
              />
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default Hero;
