import {
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  Input,
  Link,
  Spinner,
  Text,
} from '@chakra-ui/react';
import axios from 'axios';
import { DateTime } from 'luxon';
import React, { useEffect, useState } from 'react';

function App() {
  const [isLoading, setIsLoading] = useState(false); // Spinner loading status
  const [addressInput, setAddressInput] = useState(
    '9555 Kings Charter Drive, Ashland, VA 23005',
  ); // Text input for address
  const [addressCoords, setAddressCoords] = useState({
    latitude: null,
    longitude: null,
  }); // Address coordinates
  const [forecastUrl, setForecastUrl] = useState(
    'https://api.weather.gov/gridpoints/AKQ/44,83/forecast/hourly',
  ); // Forecast URL to grab data from
  const [forecastTimeZone, setForecastTimeZone] = useState('America/New_York'); // Forecast timezone.
  const [forecastInfo, setForecastInfo] = useState(null); // Forecast information to display

  // Send request to node server to get coordinates.
  // (This was needed to bypass CORS issue with geocoder)
  const geocodeAddress = () => {
    axios
      .post('http://localhost:3001/getCoordinates', {
        address: addressInput,
      })
      .then((response) => setAddressCoords(response.data));
  };

  // Retrieve weather station information based on coordinates.
  // Uses forecast url from weather station for forecast information.
  const retrieveWeatherStation = () => {
    // Retrieve weather station information.
    if (addressCoords.latitude && addressCoords.longitude) {
      axios
        .get(
          `https://api.weather.gov/points/${addressCoords.latitude},${addressCoords.longitude}`,
        )
        .then((response) => {
          const { forecastHourly, timeZone } = response.data.properties;

          setForecastUrl(forecastHourly);
          setForecastTimeZone(timeZone);
        })
        .catch((error) => console.error(error));
    }
  };

  // Retrieve forecast information from URL based on address.
  // Used for initial and automatic updates.
  const retrieveForecast = () => {
    axios(forecastUrl)
      .then((response) => {
        const curTime = DateTime.now().setZone(forecastTimeZone);

        let nextDayStart;
        let nextDayEnd;

        // It's still the "current" day
        // If not, get the next day.
        if (curTime.hour < 6) {
          nextDayStart = curTime.set({
            hour: 6,
            minute: 0,
            second: 0,
            millisecond: 0,
          });
          nextDayEnd = nextDayStart.plus({ hours: 24 });
        } else {
          nextDayStart = curTime
            .set({ hour: 6, minute: 0, second: 0, millisecond: 0 })
            .plus({ day: 1 });
          nextDayEnd = nextDayStart.plus({ hours: 24 });
        }

        // Filter out the hourly periods for just the next day.
        const forecastWindow = response.data.properties.periods.filter(
          (period) => {
            // Comparing times to be in the next day range.
            const startTime = DateTime.fromISO(period.startTime);
            return startTime >= nextDayStart && startTime < nextDayEnd;
          },
        );

        setForecastInfo(forecastWindow);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // Submit address for geocoding.
  const submitAddress = (e) => {
    e.preventDefault();
    setIsLoading(true);

    geocodeAddress();
  };

  // When geocoding is complete, retrieve weather station information.
  useEffect(() => {
    retrieveWeatherStation();
  }, [addressCoords]);

  // When forecast url changes, retrieve forecast information.
  useEffect(() => {
    retrieveForecast();
  }, [forecastUrl]);

  // Auto-update retreiving forecast every 10 minutes.
  useEffect(() => {
    const interval = setInterval(() => {
      retrieveForecast();
    }, 600000);

    return () => clearInterval(interval); // Unmount interval.
  }, []);

  return (
    <Flex direction="column" minHeight="100vh">
      <Flex direction="column" flexGrow="1" flexShrink="0" p={3}>
        <Container maxW="container.md" centerContent>
          <Heading as="h1" size="xl" mb={3}>
            Tomorrow&apos;s Weather Forecast
          </Heading>

          <form style={{ width: '100%' }} onSubmit={submitAddress}>
            <Input
              placeholder="Enter address"
              size="lg"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
            />
          </form>
        </Container>

        <Box>
          {!isLoading && forecastInfo ? (
            <Box>
              {forecastInfo.map((period) => (
                <Box key={period.number}>{period.shortForecast}</Box>
              ))}
            </Box>
          ) : (
            <Spinner size="xl" />
          )}
        </Box>
      </Flex>

      <Flex justifyContent="center" flexShrink="0">
        <HStack spacing={10}>
          <Text>Developed by Joseph Oh</Text>
          <Link
            href="https://github.com/L-Dragon5/first-arriving-code-challenge-react"
            isExternal
          >
            Github Repository
          </Link>
        </HStack>
      </Flex>
    </Flex>
  );
}

export default App;
