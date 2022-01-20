import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import {
  Box,
  Center,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Image,
  Input,
  Link,
  Spinner,
  Text,
  useBreakpointValue,
  useToast,
  VStack,
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

  const toast = useToast(); // Creating toast popups.

  const periodsColumns = useBreakpointValue({
    base: '1fr 1fr',
    md: '120px 60px 1fr 0.25fr',
  });

  const periodsRows = useBreakpointValue({
    base: '60px 1fr',
    md: '1fr',
  });

  // Send request to node server to get coordinates.
  // (This was needed to bypass CORS issue with geocoder)
  const geocodeAddress = () => {
    axios
      .post('http://localhost:3001/getCoordinates', {
        address: addressInput,
      })
      .then((response) => setAddressCoords(response.data));
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

          // If it's the same as the existing url, just retrieve manually.
          // If not, set forecast url and timezone.
          if (forecastUrl === forecastHourly) {
            retrieveForecast();
          } else {
            setForecastUrl(forecastHourly);
            setForecastTimeZone(timeZone);
          }
        })
        .catch((error) => console.error(error));
    }
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

      // Send notification that forecast data has been refreshed.
      toast({
        title: 'Forecast refreshed.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }, 600000);

    return () => clearInterval(interval); // Unmount interval.
  }, []);

  return (
    <Grid templateRows="0.35fr auto 50px" height="100vh">
      <GridItem as={Flex} direction="column" flexGrow="1" flexShrink="0" p={3}>
        <Container maxW="container.md" centerContent>
          <Heading as="h1" size="xl" mb={1}>
            Tomorrow&apos;s Weather Forecast
          </Heading>
          <Heading as="h4" size="sm" mb={3}>
            24-hour time period from 6am to 6am
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
      </GridItem>

      <GridItem mt={6} overflow="auto">
        {!isLoading && forecastInfo ? (
          <Container maxW="container.lg">
            <VStack alignItems="flex-start" spacing={5}>
              {forecastInfo.map((period) => {
                const periodTime = DateTime.fromISO(period.startTime);

                return (
                  <Grid
                    key={period.number}
                    templateColumns={periodsColumns}
                    templateRows={periodsRows}
                    gap={4}
                    px={4}
                    py={2}
                    width="full"
                    bgColor={period.isDaytime ? 'gray.100' : 'gray.300'}
                    alignItems="center"
                    borderRadius="sm"
                  >
                    <GridItem>
                      <Text fontWeight="bold" fontSize="md">
                        {periodTime.toLocaleString(DateTime.DATE_SHORT)}
                      </Text>
                      <Text fontSize="2xl">
                        {periodTime.toLocaleString(DateTime.TIME_SIMPLE)}
                      </Text>
                    </GridItem>

                    <GridItem>
                      {period.isDaytime ? (
                        <SunIcon boxSize={10} />
                      ) : (
                        <MoonIcon boxSize={10} />
                      )}
                    </GridItem>

                    <GridItem as={HStack}>
                      <Image src={period.icon} boxSize="84px" />
                      <Text fontSize="lg">{period.shortForecast}</Text>
                    </GridItem>

                    <GridItem>
                      <Box mb={3}>
                        <Text fontWeight="bold">Temperature</Text>
                        <Text fontSize="lg">{`${period.temperature} ${period.temperatureUnit}`}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold">Wind</Text>
                        <Text fontSize="lg">{`${period.windSpeed} ${period.windDirection}`}</Text>
                      </Box>
                    </GridItem>
                  </Grid>
                );
              })}
            </VStack>
          </Container>
        ) : (
          <Center>
            <Spinner size="xl" />
          </Center>
        )}
      </GridItem>

      <GridItem as={Flex} justifyContent="center">
        <HStack spacing={10}>
          <Text>Developed by Joseph Oh</Text>
          <Link
            href="https://github.com/L-Dragon5/first-arriving-code-challenge-react"
            isExternal
          >
            Github Repository
          </Link>
        </HStack>
      </GridItem>
    </Grid>
  );
}

export default App;
