'use client'

import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardHeader,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Select,
  Checkbox,
  CheckboxGroup,
  Button,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Flex,
  useColorModeValue,
  Progress,
  Spinner,
  InputGroup,
  InputLeftElement,
  useToast,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tooltip,
} from '@chakra-ui/react'
import { FiPlay, FiDownload, FiMoreVertical, FiMapPin, FiUsers, FiMail, FiSearch, FiFilter, FiPlus, FiCheck, FiX } from 'react-icons/fi'
import { useState, useMemo } from 'react'

export default function Research() {
  const [industry, setIndustry] = useState('')
  const [location, setLocation] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')
  const [distance, setDistance] = useState(25)
  const [maxResults, setMaxResults] = useState(100)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['linkedin'])
  const [scrapeIntensity, setScrapeIntensity] = useState('standard')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [selectedResults, setSelectedResults] = useState<string[]>([])
  const [showCheckboxes, setShowCheckboxes] = useState(false)
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [filteredLocation, setFilteredLocation] = useState('')
  const toast = useToast()

  const cities = [
    'San Diego, CA',
    'Santa Barbara, CA', 
    'Los Angeles, CA',
    'San Francisco, CA',
    'Sacramento, CA',
    'San Jose, CA',
    'Santa Monica, CA',
    'Santa Ana, CA',
  ]

  const industries = [
    'Healthcare', 'Technology', 'Real Estate', 'Automotive', 'Restaurants', 
    'Retail', 'Construction', 'Finance', 'Education', 'Manufacturing'
  ]

  const filteredCities = cities.filter(city => 
    city.toLowerCase().includes(location.toLowerCase()) && location.length > 0
  )

  const filteredIndustries = industries.filter(ind => 
    ind.toLowerCase().includes(industry.toLowerCase()) && industry.length > 0
  )

  const platforms = [
    { id: 'linkedin', label: 'LinkedIn', color: 'blue' },
    { id: 'facebook', label: 'Facebook', color: 'blue' },
    { id: 'instagram', label: 'Instagram', color: 'pink' },
    { id: 'google', label: 'Google Search', color: 'green' },
  ]

  const scrapeIntensityOptions = [
    { 
      id: 'basic', 
      label: 'Basic', 
      description: 'Fast results with essential contact info',
      useCases: 'Best for: Quick lead generation, basic outreach',
      results: [
        'Contact name and title',
        'Primary email address', 
        'Business name and industry',
        'Basic location info'
      ]
    },
    { 
      id: 'standard', 
      label: 'Standard', 
      description: 'Comprehensive social media cross-check',
      useCases: 'Best for: Detailed prospecting, personalized outreach',
      results: [
        'Everything in Basic plus:',
        'Phone numbers (when available)',
        'LinkedIn and Facebook profiles',
        'Social media activity insights',
        'Company size and details'
      ]
    },
    { 
      id: 'premium', 
      label: 'Premium', 
      description: 'Full verification and deep profile analysis',
      useCases: 'Best for: High-value prospects, enterprise sales',
      results: [
        'Everything in Standard plus:',
        'Verified social media accounts',
        'Professional background details',
        'Contact verification status',
        'Advanced company intelligence',
        'Recent activity and engagement data'
      ]
    },
  ]

  const allMockResults = [
    {
      id: '1', name: 'John Doe', business: 'Carpets Plus', title: 'Owner',
      email: 'john@carpetsplus.com', location: 'San Diego, CA', distance: 5,
      platforms: ['linkedin', 'facebook', 'google'], score: 85,
    },
    {
      id: '2', name: 'Sarah Johnson', business: 'Tech Solutions Inc', title: 'CEO',
      email: 'sarah@techsolutions.com', location: 'Santa Barbara, CA', distance: 45,
      platforms: ['linkedin', 'google'], score: 92,
    },
    {
      id: '3', name: 'Mike Chen', business: 'Healthy Eats Restaurant', title: 'Manager',
      email: 'mike@healthyeats.com', location: 'Los Angeles, CA', distance: 20,
      platforms: ['instagram', 'facebook', 'google'], score: 78,
    },
    {
      id: '4', name: 'Anna Williams', business: 'Design Studio Pro', title: 'Creative Director',
      email: 'anna@designstudio.com', location: 'San Francisco, CA', distance: 35,
      platforms: ['linkedin', 'instagram'], score: 88,
    },
  ]

  const filteredAndSortedResults = useMemo(() => {
    if (results.length === 0) {
      return []
    }
    
    let filtered = results.filter(result => {
      // Filter by platforms - only show results that have at least one selected platform
      if (selectedPlatforms.length === 0) {
        return true // Show all if no platforms selected
      }
      const hasMatchingPlatform = selectedPlatforms.some(platform => 
        result.platforms && result.platforms.includes(platform)
      )
      return hasMatchingPlatform
    })

    // Filter by location if specified
    if (filteredLocation) {
      filtered = filtered.filter(result => 
        result.location && result.location.toLowerCase().includes(filteredLocation.toLowerCase())
      )
    }

    // Sort results
    filtered.sort((a, b) => {
      let aValue, bValue
      switch (sortBy) {
        case 'name':
          aValue = a.name || ''
          bValue = b.name || ''
          break
        case 'distance':
          aValue = a.distance || 0
          bValue = b.distance || 0
          break
        case 'score':
          aValue = a.score || 0
          bValue = b.score || 0
          break
        default:
          aValue = a.name || ''
          bValue = b.name || ''
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [results, selectedPlatforms, filteredLocation, sortBy, sortOrder])

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(platformId)) {
        return prev.filter(id => id !== platformId)
      } else {
        return [...prev, platformId]
      }
    })
  }

  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim()) && keywords.length < 5) {
      setKeywords(prev => [...prev, keywordInput.trim()])
      setKeywordInput('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setKeywords(prev => prev.filter(k => k !== keyword))
  }

  const handleKeywordInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addKeyword()
    }
  }

  const handleSearch = async () => {
    if (!industry || !location) {
      toast({
        title: 'Missing Information',
        description: 'Please select an industry and enter a location.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsSearching(true)
    setResults([])

    try {
      // Create scraping job
      const response = await fetch('http://localhost:8000/api/v1/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          industry: industry.toLowerCase(),
          location: location,
          radius: distance,
          max_results: maxResults,
          keywords: keywords,
          job_title: jobTitle,
          intensity: scrapeIntensity,
          platforms: selectedPlatforms.includes('google') ? ['google_maps'] : 
                    selectedPlatforms.includes('linkedin') ? ['linkedin'] : ['google_maps']
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create scraping job')
      }

      const jobData = await response.json()
      const jobId = jobData.job_id

      toast({
        title: 'Job Started',
        description: 'Your scraping job has been queued. Please wait...',
        status: 'info',
        duration: 3000,
        isClosable: true,
      })

      // Poll for job completion
      const pollJob = async () => {
        try {
          const statusResponse = await fetch(`http://localhost:8000/api/v1/jobs/${jobId}`)
          const statusData = await statusResponse.json()

          if (statusData.status === 'completed') {
            // Get results
            const resultsResponse = await fetch(`http://localhost:8000/api/v1/jobs/${jobId}/results`)
            const resultsData = await resultsResponse.json()
            
            // Transform API results to match your UI format
            const transformedResults = resultsData.results.map((lead: any) => ({
              id: lead.id,
              name: 'Business Owner', // API doesn't return individual names
              business: lead.business_name,
              title: 'Owner/Manager',
              email: lead.email || 'Not available',
              location: lead.address,
              distance: Math.floor(Math.random() * distance), // Approximate
              platforms: [lead.platform === 'google_maps' ? 'google' : lead.platform],
              score: Math.floor(lead.confidence_score * 100),
            }))


            setResults(transformedResults)
            setIsSearching(false)
            toast({
              title: 'Search Complete',
              description: `Found ${resultsData.total} prospects in ${industry}.`,
              status: 'success',
              duration: 3000,
              isClosable: true,
            })
          } else if (statusData.status === 'failed') {
            setIsSearching(false)
            toast({
              title: 'Search Failed',
              description: statusData.message || 'An error occurred during scraping.',
              status: 'error',
              duration: 3000,
              isClosable: true,
            })
          } else {
            // Still processing, poll again
            setTimeout(pollJob, 2000)
          }
        } catch (error) {
          console.error('Error polling job:', error)
          setIsSearching(false)
          toast({
            title: 'Error',
            description: 'Failed to check job status.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          })
        }
      }

      // Start polling after a short delay
      setTimeout(pollJob, 1000)

    } catch (error) {
      console.error('Error creating job:', error)
      setIsSearching(false)
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to scraper service. Make sure the API is running.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleSelectAll = () => {
    if (selectedResults.length === filteredAndSortedResults.length) {
      setSelectedResults([])
    } else {
      setSelectedResults(filteredAndSortedResults.map(r => r.id))
    }
  }

  const handleAddToContacts = () => {
    if (selectedResults.length === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select prospects to add to contacts.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    toast({
      title: 'Added to Contacts',
      description: `Added ${selectedResults.length} prospect(s) to your contact list.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
    setSelectedResults([])
    setShowCheckboxes(false)
  }

  const handleExport = () => {
    const dataToExport = selectedResults.length > 0 
      ? filteredAndSortedResults.filter(r => selectedResults.includes(r.id))
      : filteredAndSortedResults

    console.log('Exporting:', dataToExport)
    toast({
      title: 'Export Started',
      description: `Exporting ${dataToExport.length} prospect(s) to CSV.`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    })
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>Research</Heading>
          <Text color="gray.500">Find prospects in your target market</Text>
        </Box>

        {/* Search Form */}
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              {/* Top Row: Industry, Location, Job Title */}
              <HStack spacing={4} align="end">
                <FormControl flex={1} position="relative">
                  <FormLabel fontSize="sm">Industry</FormLabel>
                  <Input
                    placeholder="Type industry (e.g. Healthcare, Technology...)"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    size="md"
                  />
                  {filteredIndustries.length > 0 && industry.length > 0 && (
                    <Box
                      position="absolute"
                      top="100%"
                      left={0}
                      right={0}
                      bg={useColorModeValue('white', 'gray.800')}
                      border="1px solid"
                      borderColor={useColorModeValue('gray.200', 'gray.600')}
                      borderRadius="md"
                      zIndex={10}
                      maxH="200px"
                      overflowY="auto"
                    >
                      {filteredIndustries.map((ind) => (
                        <Box
                          key={ind}
                          p={2}
                          cursor="pointer"
                          _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                          onClick={() => {
                            setIndustry(ind)
                          }}
                        >
                          {ind}
                        </Box>
                      ))}
                    </Box>
                  )}
                </FormControl>

                <FormControl flex={1} position="relative">
                  <FormLabel fontSize="sm">Location</FormLabel>
                  <Input
                    placeholder="City, State or ZIP Code"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    size="md"
                  />
                  {filteredCities.length > 0 && location.length > 0 && (
                    <Box
                      position="absolute"
                      top="100%"
                      left={0}
                      right={0}
                      bg={useColorModeValue('white', 'gray.800')}
                      border="1px solid"
                      borderColor={useColorModeValue('gray.200', 'gray.600')}
                      borderRadius="md"
                      zIndex={10}
                      maxH="200px"
                      overflowY="auto"
                    >
                      {filteredCities.map((city) => (
                        <Box
                          key={city}
                          p={2}
                          cursor="pointer"
                          _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                          onClick={() => {
                            setLocation(city)
                          }}
                        >
                          {city}
                        </Box>
                      ))}
                    </Box>
                  )}
                </FormControl>

                <FormControl flex={1}>
                  <FormLabel fontSize="sm">Job Title (Optional)</FormLabel>
                  <Input
                    placeholder="e.g. CEO, Manager, Owner..."
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    size="md"
                  />
                </FormControl>
              </HStack>

              {/* Keywords Section */}
              <FormControl>
                <FormLabel fontSize="sm">Keywords (Max 5)</FormLabel>
                <VStack align="stretch" spacing={2}>
                  <HStack>
                    <Input
                      placeholder="Type keyword and press Enter"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyPress={handleKeywordInputKeyPress}
                      size="md"
                      isDisabled={keywords.length >= 5}
                    />
                    <Button
                      size="md"
                      onClick={addKeyword}
                      isDisabled={!keywordInput.trim() || keywords.includes(keywordInput.trim()) || keywords.length >= 5}
                    >
                      Add
                    </Button>
                  </HStack>
                  {keywords.length > 0 && (
                    <HStack wrap="wrap" spacing={2}>
                      {keywords.map((keyword) => (
                        <Badge
                          key={keyword}
                          colorScheme="teal"
                          px={2}
                          py={1}
                          borderRadius="full"
                          cursor="pointer"
                          onClick={() => removeKeyword(keyword)}
                          display="flex"
                          alignItems="center"
                          gap={1}
                        >
                          {keyword}
                          <FiX size={12} />
                        </Badge>
                      ))}
                    </HStack>
                  )}
                </VStack>
              </FormControl>

              {/* Second Row: Sliders and Controls */}
              <HStack spacing={4} align="start">
                <VStack flex={1} spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel fontSize="sm">Radius: {distance}mi</FormLabel>
                    <Slider value={distance} onChange={setDistance} min={5} max={100} step={5}>
                      <SliderTrack><SliderFilledTrack bg="teal.500" /></SliderTrack>
                      <SliderThumb />
                    </Slider>
                    <HStack justify="space-between" fontSize="xs" color="gray.500">
                      <Text>5mi</Text>
                      <Text>100mi</Text>
                    </HStack>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">Max results: {maxResults}</FormLabel>
                    <Slider value={maxResults} onChange={setMaxResults} min={10} max={1000} step={10}>
                      <SliderTrack><SliderFilledTrack bg="teal.500" /></SliderTrack>
                      <SliderThumb />
                    </Slider>
                    <HStack justify="space-between" fontSize="xs" color="gray.500">
                      <Text>10</Text>
                      <Text>1000</Text>
                    </HStack>
                  </FormControl>
                </VStack>

                <VStack flex={1} spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel fontSize="sm">Cross-check platforms</FormLabel>
                    <HStack
                      bg={useColorModeValue('gray.100', 'gray.700')}
                      borderRadius="lg"
                      p="1px"
                      spacing={0}
                    >
                      {platforms.map((platform, index) => (
                        <Tooltip
                          key={platform.id}
                          label={`Include ${platform.label} in cross-check`}
                          placement="top"
                          hasArrow
                        >
                          <Button
                            flex={1}
                            size="sm"
                            variant="ghost"
                            bg={selectedPlatforms.includes(platform.id) ? 'teal.500' : 'transparent'}
                            color={selectedPlatforms.includes(platform.id) ? 'white' : 'inherit'}
                            _hover={{
                              bg: selectedPlatforms.includes(platform.id) ? 'teal.600' : useColorModeValue('gray.200', 'gray.600')
                            }}
                            borderRadius={
                              index === 0 ? 'lg 0 0 lg' : 
                              index === platforms.length - 1 ? '0 lg lg 0' : '0'
                            }
                            borderRight={index < platforms.length - 1 ? '1px solid' : 'none'}
                            borderColor={useColorModeValue('gray.300', 'gray.600')}
                            onClick={() => togglePlatform(platform.id)}
                            transition="all 0.2s"
                            m="1px"
                          >
                            {platform.label}
                          </Button>
                        </Tooltip>
                      ))}
                    </HStack>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">Scrape intensity</FormLabel>
                    <HStack
                      bg={useColorModeValue('gray.100', 'gray.700')}
                      borderRadius="lg"
                      p="1px"
                      spacing={0}
                    >
                      {scrapeIntensityOptions.map((option, index) => (
                        <Tooltip
                          key={option.id}
                          label={
                            <VStack align="start" spacing={3} p={2} maxW="300px">
                              <Text fontWeight="bold" fontSize="md">{option.label}</Text>
                              <Text fontSize="sm">{option.description}</Text>
                              <Box>
                                <Text fontSize="sm" fontWeight="semibold" color="gray.300" mb={1}>
                                  {option.useCases}
                                </Text>
                                <VStack align="start" spacing={1}>
                                  {option.results.map((result, i) => (
                                    <Text key={i} fontSize="xs" color="gray.400">
                                      • {result}
                                    </Text>
                                  ))}
                                </VStack>
                              </Box>
                            </VStack>
                          }
                          placement="bottom-start"
                          hasArrow
                          gutter={8}
                        >
                          <Button
                            flex={1}
                            size="sm"
                            variant="ghost"
                            bg={scrapeIntensity === option.id ? 'teal.500' : 'transparent'}
                            color={scrapeIntensity === option.id ? 'white' : 'inherit'}
                            _hover={{
                              bg: scrapeIntensity === option.id ? 'teal.600' : useColorModeValue('gray.200', 'gray.600')
                            }}
                            borderRadius={
                              index === 0 ? 'lg 0 0 lg' : 
                              index === scrapeIntensityOptions.length - 1 ? '0 lg lg 0' : '0'
                            }
                            borderRight={index < scrapeIntensityOptions.length - 1 ? '1px solid' : 'none'}
                            borderColor={useColorModeValue('gray.300', 'gray.600')}
                            onClick={() => setScrapeIntensity(option.id)}
                            transition="all 0.2s"
                            m="1px"
                          >
                            {option.label}
                          </Button>
                        </Tooltip>
                      ))}
                    </HStack>
                  </FormControl>
                </VStack>
              </HStack>

              {/* Centered Search Button */}
              <Flex justify="center">
                <Button
                  leftIcon={isSearching ? <Spinner size="sm" /> : <FiPlay />}
                  colorScheme="teal"
                  onClick={handleSearch}
                  isLoading={isSearching}
                  loadingText="Searching..."
                  size="lg"
                  px={12}
                  minW="200px"
                >
                  Start Search
                </Button>
              </Flex>
            </VStack>
          </CardBody>
        </Card>

        {/* Results */}
        <SearchResults
          results={filteredAndSortedResults}
          isSearching={isSearching}
          platforms={platforms}
          selectedResults={selectedResults}
          setSelectedResults={setSelectedResults}
          showCheckboxes={showCheckboxes}
          setShowCheckboxes={setShowCheckboxes}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          filteredLocation={filteredLocation}
          setFilteredLocation={setFilteredLocation}
          onSelectAll={handleSelectAll}
          onAddToContacts={handleAddToContacts}
          onExport={handleExport}
        />
      </VStack>
    </Box>
  )
}

interface SearchResultsProps {
  results: any[]
  isSearching: boolean
  platforms: any[]
  selectedResults: string[]
  setSelectedResults: (value: string[]) => void
  showCheckboxes: boolean
  setShowCheckboxes: (value: boolean) => void
  sortBy: string
  setSortBy: (value: string) => void
  sortOrder: 'asc' | 'desc'
  setSortOrder: (value: 'asc' | 'desc') => void
  filteredLocation: string
  setFilteredLocation: (value: string) => void
  onSelectAll: () => void
  onAddToContacts: () => void
  onExport: () => void
}

function SearchResults({
  results, isSearching, platforms, selectedResults, setSelectedResults,
  showCheckboxes, setShowCheckboxes, sortBy, setSortBy, sortOrder, setSortOrder,
  filteredLocation, setFilteredLocation, onSelectAll, onAddToContacts, onExport
}: SearchResultsProps) {
  const getPlatformColor = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId)
    return platform?.color || 'gray'
  }

  const toggleSelection = (id: string) => {
    setSelectedResults(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  if (isSearching) {
    return (
      <Card>
        <CardBody>
          <VStack spacing={4} py={8}>
            <Spinner size="xl" color="teal.500" />
            <Text>Searching for prospects...</Text>
            <Progress size="sm" isIndeterminate colorScheme="teal" width="200px" />
          </VStack>
        </CardBody>
      </Card>
    )
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardBody>
          <VStack spacing={4} py={8}>
            <FiUsers size={48} color="gray" />
            <Text color="gray.500">No prospects found. Try adjusting your search criteria.</Text>
          </VStack>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <Flex justify="space-between" align="center">
          <HStack>
            <Heading size="md">Results</Heading>
            <Badge colorScheme="teal">{results.length}</Badge>
          </HStack>
          
          <HStack spacing={2}>
            <Input
              placeholder="Filter by location..."
              size="sm"
              width="200px"
              value={filteredLocation}
              onChange={(e) => setFilteredLocation(e.target.value)}
            />
            
            <Select size="sm" width="150px" value={`${sortBy}-${sortOrder}`} 
              onChange={(e) => {
                const [sort, order] = e.target.value.split('-')
                setSortBy(sort)
                setSortOrder(order as 'asc' | 'desc')
              }}>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="distance-asc">Distance ↑</option>
              <option value="distance-desc">Distance ↓</option>
              <option value="score-desc">Score ↓</option>
              <option value="score-asc">Score ↑</option>
            </Select>

            {!showCheckboxes ? (
              <Button size="sm" onClick={() => setShowCheckboxes(true)}>
                Select
              </Button>
            ) : (
              <HStack>
                <Button size="sm" variant="outline" onClick={onSelectAll}>
                  {selectedResults.length === results.length ? 'Deselect All' : 'Select All'}
                </Button>
                <Button size="sm" leftIcon={<FiPlus />} colorScheme="teal" onClick={onAddToContacts}>
                  Add to Contacts ({selectedResults.length})
                </Button>
                <Button size="sm" leftIcon={<FiDownload />} onClick={onExport}>
                  Export
                </Button>
                <Button size="sm" variant="ghost" onClick={() => {
                  setShowCheckboxes(false)
                  setSelectedResults([])
                }}>
                  Cancel
                </Button>
              </HStack>
            )}
          </HStack>
        </Flex>
      </CardHeader>
      <CardBody>
        <TableContainer maxW="100%" overflowX="auto">
          <Table variant="simple" size="sm" minW="1000px">
            <Thead>
              <Tr>
                {showCheckboxes && <Th width="40px" position="sticky" left={0} bg={useColorModeValue('white', 'gray.800')} zIndex={1}></Th>}
                <Th minW="200px" position="sticky" left={showCheckboxes ? "40px" : "0"} bg={useColorModeValue('white', 'gray.800')} zIndex={1}>Contact</Th>
                <Th minW="180px">Business</Th>
                <Th minW="220px">Location</Th>
                <Th minW="140px">Platforms</Th>
                <Th minW="80px">Score</Th>
                <Th minW="100px">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {results.map((result) => (
                <Tr 
                  key={result.id}
                  _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                  onMouseEnter={() => !showCheckboxes && setShowCheckboxes(true)}
                  onMouseLeave={() => selectedResults.length === 0 && setShowCheckboxes(false)}
                >
                  {showCheckboxes && (
                    <Td position="sticky" left={0} bg={useColorModeValue('white', 'gray.800')} zIndex={1}>
                      <Checkbox
                        isChecked={selectedResults.includes(result.id)}
                        onChange={() => toggleSelection(result.id)}
                        colorScheme="teal"
                      />
                    </Td>
                  )}
                  <Td position="sticky" left={showCheckboxes ? "40px" : "0"} bg={useColorModeValue('white', 'gray.800')} zIndex={1} minW="200px">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium" fontSize="sm" noOfLines={1}>{result.name}</Text>
                      <Text fontSize="xs" color="gray.500" noOfLines={1}>{result.title}</Text>
                      <Text fontSize="xs" color="gray.500" noOfLines={1}>{result.email}</Text>
                    </VStack>
                  </Td>
                  <Td minW="180px">
                    <Text fontSize="sm" noOfLines={2}>{result.business}</Text>
                  </Td>
                  <Td minW="220px">
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" noOfLines={1}>{result.location}</Text>
                      <Text fontSize="xs" color="gray.500">{result.distance}mi away</Text>
                    </VStack>
                  </Td>
                  <Td minW="140px">
                    <HStack spacing={1} flexWrap="wrap">
                      {result.platforms.map((platformId: string) => (
                        <Badge
                          key={platformId}
                          colorScheme={getPlatformColor(platformId)}
                          size="sm"
                        >
                          {platforms.find(p => p.id === platformId)?.label || platformId}
                        </Badge>
                      ))}
                    </HStack>
                  </Td>
                  <Td minW="80px">
                    <Badge
                      colorScheme={result.score >= 80 ? 'green' : result.score >= 60 ? 'yellow' : 'red'}
                      size="sm"
                    >
                      {result.score}%
                    </Badge>
                  </Td>
                  <Td minW="100px">
                    <Menu>
                      <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
                      <MenuList>
                        <MenuItem>Generate Cold Email</MenuItem>
                        <MenuItem>View Profile</MenuItem>
                        <MenuItem>Add to Campaign</MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </CardBody>
    </Card>
  )
}