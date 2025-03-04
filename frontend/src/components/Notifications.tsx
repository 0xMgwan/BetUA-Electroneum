import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  VStack,
  useToast,
} from '@chakra-ui/react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationProps {
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title?: string;
  onClose?: () => void;
}

export function Notification({ message, type, title, onClose }: NotificationProps) {
  return (
    <Alert status={type} variant="solid" borderRadius="md">
      <AlertIcon />
      <VStack align="start" flex="1">
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertDescription>{message}</AlertDescription>
      </VStack>
      {onClose && <CloseButton onClick={onClose} />}
    </Alert>
  );
}

interface NotificationsContextType {
  showNotification: (type: NotificationType, message: string) => void;
}

const NotificationsContext = React.createContext<NotificationsContextType>({
  showNotification: () => {},
});

export const useNotifications = () => React.useContext(NotificationsContext);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const toast = useToast();

  const showNotification = React.useCallback((type: NotificationType, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    
    setNotifications(prev => [...prev, { id, type, message }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  useEffect(() => {
    if (notifications.length > 0) {
      const notification = notifications[notifications.length - 1];
      toast({
        title: '',
        description: notification.message,
        status: notification.type,
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    }
  }, [notifications, toast]);

  return (
    <NotificationsContext.Provider value={{ showNotification }}>
      {children}
    </NotificationsContext.Provider>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert status="error" variant="solid" borderRadius="md">
          <AlertIcon />
          <VStack align="start" flex="1">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              {this.state.error?.message || 'An unexpected error occurred'}
            </AlertDescription>
          </VStack>
        </Alert>
      );
    }

    return this.props.children;
  }
}
