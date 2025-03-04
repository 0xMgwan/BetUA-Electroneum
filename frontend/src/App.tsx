import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { ContractProvider } from './hooks/useContract';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { GameList } from './components/GameList';
import Leaderboard from './pages/Leaderboard';
import HowItWorks from './pages/HowItWorks';
import Profile from './pages/Profile';

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: '#0A1929',
        color: 'white',
      },
    },
  },
  colors: {
    navy: {
      900: '#0A1929',
      800: '#132F4C',
      700: '#1E4976',
    },
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <ContractProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-navy-900">
            <Navbar />
            <main className="flex-grow py-6">
              <Routes>
                <Route path="/" element={<GameList />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ContractProvider>
    </ChakraProvider>
  );
}

export default App;
