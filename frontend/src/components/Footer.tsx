import {
  Box,
  Container,
  SimpleGrid,
  Stack,
  Text,
  Link,
  Heading,
} from '@chakra-ui/react';

export default function Footer() {
  return (
    <Box as="footer" bg="gray.50" color="gray.700" py={10}>
      <Container maxW="container.xl">
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
          <Stack spacing={4}>
            <Heading size="md">About</Heading>
            <Stack>
              <Link href="#">Privacy Policy</Link>
              <Link href="#">About Us</Link>
              <Link href="#">PlayIt Docs</Link>
              <Link href="#">Terms and Conditions</Link>
              <Link href="#">SX Token Lockup</Link>
            </Stack>
          </Stack>

          <Stack spacing={4}>
            <Heading size="md">Support</Heading>
            <Stack>
              <Link href="#">API Status</Link>
              <Link href="#">Responsible Gambling</Link>
              <Link href="#">FAQ</Link>
              <Link href="#">General Betting Rules</Link>
              <Link href="#">Live Support</Link>
            </Stack>
          </Stack>

          <Stack spacing={4}>
            <Heading size="md">Community</Heading>
            <Stack>
              <Link href="#">Leaderboards</Link>
              <Link href="#">Blog</Link>
              <Link href="#">Twitter</Link>
              <Link href="#">Discord</Link>
              <Link href="#">Governance</Link>
              <Link href="#">Affiliates</Link>
            </Stack>
          </Stack>

          <Stack spacing={4}>
            <Heading size="md">Developers</Heading>
            <Stack>
              <Link href="#">API Documentation</Link>
              <Link href="#">Smart Contract GitHub</Link>
              <Link href="#">Smart Contract Audit</Link>
            </Stack>
          </Stack>
        </SimpleGrid>

        <Text pt={8} fontSize="sm" textAlign="center">
          {new Date().getFullYear()} PlayIt. All rights reserved.
        </Text>
      </Container>
    </Box>
  );
}
