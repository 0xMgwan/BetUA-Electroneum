import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Input,
  VStack,
  Text,
  useToast,
  Avatar,
  HStack,
  Divider,
  IconButton,
  Collapse,
  useDisclosure,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { useContract } from '../hooks/useContract';

interface Comment {
  id: number;
  author: string;
  content: string;
  timestamp: number;
}

interface CommentsProps {
  gameId: number;
}

export function Comments({ gameId }: CommentsProps) {
  const { commentHub, address, connectWallet } = useContract();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onToggle } = useDisclosure();
  const toast = useToast();

  const fetchComments = async () => {
    if (!commentHub) {
      console.log('CommentHub contract not initialized yet, using sample comments');
      setComments([
        {
          id: 1,
          author: '0x1234...5678',
          content: 'Great match!',
          timestamp: Date.now() - 3600000,
        },
        {
          id: 2,
          author: '0x8765...4321',
          content: 'Exciting game so far!',
          timestamp: Date.now() - 1800000,
        },
      ]);
      return;
    }

    try {
      const count = await commentHub.commentCounts(gameId);
      console.log('Comment count:', count.toNumber());
      
      const comments = await commentHub.gameComments(gameId);
      console.log('Comments result:', comments);
      
      const formattedComments = comments.map((comment: any, index: number) => ({
        id: comment.id.toNumber(),
        author: comment.author,
        content: comment.content,
        timestamp: comment.timestamp.toNumber() * 1000,
      }));
      setComments(formattedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      // Use sample comments as fallback
      setComments([
        {
          id: 1,
          author: '0x1234...5678',
          content: 'Great match!',
          timestamp: Date.now() - 3600000,
        },
        {
          id: 2,
          author: '0x8765...4321',
          content: 'Exciting game so far!',
          timestamp: Date.now() - 1800000,
        },
      ]);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [commentHub, gameId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a comment',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!commentHub || !address) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to comment',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      await connectWallet();
      return;
    }

    setIsLoading(true);

    try {
      // Add comment to contract
      console.log('Adding comment:', { gameId, content: newComment.trim() });
      const tx = await commentHub.addComment(gameId, newComment.trim());

      // Optimistically update UI
      const newCommentObj = {
        id: comments.length + 1,
        author: address,
        content: newComment.trim(),
        timestamp: Date.now(),
      };
      setComments(prev => [...prev, newCommentObj]);
      setNewComment('');

      // Wait for transaction confirmation
      toast({
        title: 'Posting comment...',
        description: 'Please wait for confirmation',
        status: 'info',
        duration: null,
        isClosable: true,
      });

      await tx.wait();

      toast({
        title: 'Success',
        description: 'Comment added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Refresh comments
      await fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      // Remove optimistic update
      setComments(prev => prev.slice(0, -1));
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add comment. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Box p={2}>
      <HStack justify="space-between" onClick={onToggle} cursor="pointer" p={2}>
        <Text fontSize="md" fontWeight="bold" color="white">
          Comments ({comments.length})
        </Text>
        <IconButton
          aria-label="Toggle comments"
          icon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          variant="ghost"
          color="white"
          size="sm"
          onClick={onToggle}
        />
      </HStack>

      <Collapse in={isOpen} animateOpacity>
        <Box pt={2}>
          <VStack spacing={4} align="stretch">
            <VStack spacing={3} align="stretch" maxH="200px" overflowY="auto">
              {comments.map((comment) => (
                <Box key={comment.id} p={2} borderWidth="1px" borderRadius="md" bg="whiteAlpha.100">
                  <HStack spacing={3} mb={1}>
                    <Avatar size="xs" name={comment.author} />
                    <Text color="gray.300" fontSize="sm">{shortenAddress(comment.author)}</Text>
                    <Text color="gray.400" fontSize="xs">{formatTimestamp(comment.timestamp)}</Text>
                  </HStack>
                  <Text color="white" pl={8}>{comment.content}</Text>
                </Box>
              ))}
            </VStack>

            <Divider />

            <HStack>
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                color="white"
                borderColor="whiteAlpha.300"
                _hover={{ borderColor: "whiteAlpha.400" }}
                _focus={{ borderColor: "blue.300" }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />
              <Button
                colorScheme="blue"
                onClick={handleAddComment}
                isLoading={isLoading}
                loadingText="Posting..."
              >
                Post
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Collapse>
    </Box>
  );
}
