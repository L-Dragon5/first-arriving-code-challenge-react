const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(express.json());
app.use(cors());

// Basic route to make sure server is live.
app.get('/', (req, res) => {
  res.send('Hello!');
});

/**
 * POST route to get forecast based on address input.
 *
 * @param address   one line address
 */
app.post('/getCoordinates', (req, res) => {
  const { address } = req.body;

  // Check to make sure data sent is not undefined or empty.
  if (address) {
    // Submit address to census api for geocoding and retrieve coordinates.
    axios(
      'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress',
      {
        params: {
          benchmark: '2020',
          address,
          format: 'json',
        },
      },
    )
      .then((response) => {
        const { data } = response;
        const { x, y } = data.result.addressMatches[0].coordinates;

        res.status(200).json({
          latitude: y,
          longitude: x,
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(400).json({
          message: 'Something went wrong trying to geocode address.',
        });
      });
  } else {
    res.status(400).json({
      message: 'Address input is incorrect!',
    });
  }
});

// Node server will listen on port 3001.
app.listen(3001, () => {
  console.log('Listening on port 3001');
});
