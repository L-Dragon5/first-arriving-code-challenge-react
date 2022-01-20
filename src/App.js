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
import React, { useEffect, useState } from 'react';

function App() {
  const [addressInput, setAddressInput] = useState(
    '9555 Kings Charter Drive, Ashland, VA 23005',
  );

  /*
  const [addressCoords, setAddressCoords] = useState({ lng: null, lat: null });
  const [forecast, setForecast] = useState(null);
  */

  // TODO: Submit address for geocoding and retrieve longitude/latitude coords.
  const submitAddress = (e) => {
    e.preventDefault();

    axios
      .post('http://localhost:3001/getForecast', {
        address: addressInput,
      })
      .then((response) => console.log(response));
  };

  // Fetch data from API.
  useEffect(() => {}, []);

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
          <Spinner size="xl" />
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
