export const API_CONFIGS = {
  FOOTBALL_DATA: {
    BASE_URL: 'http://api.football-data.org/v4',
    ENDPOINTS: {
      MATCHES: '/matches',
      MATCH: '/matches',
      COMPETITIONS: '/competitions'
    },
    HEADERS: {
      'X-Auth-Token': process.env.FOOTBALL_DATA_KEY
    }
  },
  SPORTS_DATA: {
    BASE_URL: 'https://api.sportsdata.io/v3/soccer',
    ENDPOINTS: {
      SCORES: '/scores/json/LiveScores',
      MATCH: '/stats/json/GamesByDate'
    },
    HEADERS: {
      'Ocp-Apim-Subscription-Key': process.env.SPORTS_DATA_KEY
    }
  }
};

export const SUPPORTED_LEAGUES = {
  'Premier League': 'PL',
  'La Liga': 'PD',
  'Serie A': 'SA',
  'Bundesliga': 'BL1',
  'Ligue 1': 'FL1'
};

export const UPDATE_INTERVAL = 60 * 1000; // 1 minute
export const CONFIRMATION_THRESHOLD = 2;   // Number of APIs that must agree
export const RETRY_ATTEMPTS = 3;
export const RETRY_DELAY = 5000; // 5 seconds
