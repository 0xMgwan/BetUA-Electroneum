const { Requester, Validator } = require('@chainlink/external-adapter')

// Define custom error scenarios for the API.
// Return true for successful verification, false for unsuccessful.
const customError = (data) => {
  if (data.Response === 'Error') return false
  return true
}

// Define custom parameters to be used by the adapter.
// The adapter will call the API with these parameters.
const customParams = {
  gameId: ['gameId'],
  homeTeam: ['homeTeam', 'home'],
  awayTeam: ['awayTeam', 'away'],
  endpoint: false
}

// Export function to integrate with Chainlink node
const createRequest = (input, callback) => {
  // The Validator helps you validate the Chainlink request data
  const validator = new Validator(input, customParams)
  const jobRunID = validator.validated.id
  const homeTeam = validator.validated.data.homeTeam
  const awayTeam = validator.validated.data.awayTeam
  const gameId = validator.validated.data.gameId

  // Use SportRadar API (you'll need to sign up for an API key)
  const url = `https://api.sportradar.us/soccer/trial/v4/en/matches/${gameId}/summary.json`
  const apiKey = process.env.SPORTRADAR_API_KEY

  const params = {
    api_key: apiKey
  }

  // This is where you would add method and headers
  // This example assumes default
  const config = {
    url,
    params
  }

  // The Requester allows API calls be retry in case of timeout
  // or connection failure
  Requester.request(config, customError)
    .then(response => {
      // Parse the response to get match result
      const match = response.data
      let result
      
      if (match.sport_event_status.winner_id === match.sport_event.competitors[0].id) {
        result = 0 // Home win
      } else if (match.sport_event_status.winner_id === match.sport_event.competitors[1].id) {
        result = 1 // Away win
      } else {
        result = 2 // Draw
      }

      response.data.result = result

      callback(response.status, {
        jobRunID,
        data: response.data,
        result,
        statusCode: response.status
      })
    })
    .catch(error => {
      callback(500, {
        jobRunID,
        status: 'errored',
        error,
        statusCode: 500
      })
    })
}

// Export function to integrate with Chainlink node
exports.gcpservice = (req, res) => {
  createRequest(req.body, (statusCode, data) => {
    res.status(statusCode).send(data)
  })
}

exports.handler = (event, context, callback) => {
  createRequest(event, (statusCode, data) => {
    callback(null, data)
  })
}

exports.handlerv2 = (event, context, callback) => {
  createRequest(JSON.parse(event.body), (statusCode, data) => {
    callback(null, {
      statusCode: statusCode,
      body: JSON.stringify(data),
      isBase64Encoded: false
    })
  })
}

module.exports.createRequest = createRequest
