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
  Input,
  Select,
  Checkbox,
  useToast,
  InputGroup,
  InputLeftElement,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Avatar,
  Divider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverHeader,
  PopoverBody,
  Circle,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  FormHelperText,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Progress,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tag,
} from '@chakra-ui/react'
import { FiMoreVertical, FiMail, FiPhone, FiMapPin, FiUsers, FiSearch, FiDownload, FiTrash2, FiEdit2, FiEye, FiPlus, FiX, FiChevronDown } from 'react-icons/fi'
import { useState, useMemo } from 'react'


interface ContactView {
  id: string
  name: string
  searchTerm: string
  statusFilter: string
  sourceFilter: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  isEditing?: boolean
  color?: string
}

export default function Contacts() {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [activeViewId, setActiveViewId] = useState('all')
  const [views, setViews] = useState<ContactView[]>([
    {
      id: 'all',
      name: 'All Contacts',
      searchTerm: '',
      statusFilter: 'all',
      sourceFilter: 'all',
      sortBy: 'name',
      sortOrder: 'asc',
      color: 'purple.500'
    },
    {
      id: 'new',
      name: 'New Contacts',
      searchTerm: '',
      statusFilter: 'new',
      sourceFilter: 'all',
      sortBy: 'addedDate',
      sortOrder: 'desc',
      color: 'blue.500'
    },
    {
      id: 'opportunities',
      name: 'Opportunities',
      searchTerm: '',
      statusFilter: 'opportunity',
      sourceFilter: 'all',
      sortBy: 'score',
      sortOrder: 'desc',
      color: 'green.500'
    }
  ])
  const [editingName, setEditingName] = useState('')
  const [editingTableHeader, setEditingTableHeader] = useState(false)
  const [isOnboarding, setIsOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState<'name' | 'filters' | 'complete'>('name')
  const { isOpen: isScraperModalOpen, onOpen: onScraperModalOpen, onClose: onScraperModalClose } = useDisclosure()
  
  // Scraper form state
  const [scraperConfig, setScraperConfig] = useState({
    location: '',
    industry: '',
    jobTitle: '',
    keywords: [] as string[],
    maxResults: 50
  })
  const [keywordInput, setKeywordInput] = useState('')
  const [isScrapingInProgress, setIsScrapingInProgress] = useState(false)
  const [scrapingProgress, setScrapingProgress] = useState(0)
  
  const toast = useToast()

  // Keyword management functions
  const addKeyword = (keyword: string) => {
    if (keyword.trim() && scraperConfig.keywords.length < 5 && !scraperConfig.keywords.includes(keyword.trim())) {
      setScraperConfig(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword.trim()]
      }))
      setKeywordInput('')
    }
  }

  const removeKeyword = (keywordToRemove: string) => {
    setScraperConfig(prev => ({
      ...prev,
      keywords: prev.keywords.filter(keyword => keyword !== keywordToRemove)
    }))
  }

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addKeyword(keywordInput)
    }
  }

  // Scraper functions
  const startScraping = async () => {
    if (!scraperConfig.location.trim()) {
      toast({
        title: 'Location Required',
        description: 'Please enter a location to search in.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsScrapingInProgress(true)
    setScrapingProgress(0)

    // Simulate scraping progress
    const progressInterval = setInterval(() => {
      setScrapingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setIsScrapingInProgress(false)
          onScraperModalClose()
          toast({
            title: 'Scraping Complete',
            description: `Found ${scraperConfig.maxResults} potential contacts.`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          })
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 800)
  }

  const colorOptions = [
    'purple.500', 'blue.500', 'green.500', 'orange.500', 'red.500', 
    'pink.500', 'cyan.500', 'yellow.500', 'teal.500'
  ]

  const currentView = views.find(v => v.id === activeViewId) || views[0]
  const searchTerm = currentView.searchTerm
  const statusFilter = currentView.statusFilter
  const sourceFilter = currentView.sourceFilter
  const sortBy = currentView.sortBy
  const sortOrder = currentView.sortOrder

  // Get count for each view based on its filters
  const getViewCount = (view: ContactView) => {
    const filtered = contacts.filter(contact => {
      const matchesSearch = contact.name.toLowerCase().includes(view.searchTerm.toLowerCase()) ||
                           contact.email.toLowerCase().includes(view.searchTerm.toLowerCase()) ||
                           contact.business.toLowerCase().includes(view.searchTerm.toLowerCase())
      
      const matchesStatus = view.statusFilter === 'all' || contact.status === view.statusFilter
      const matchesSource = view.sourceFilter === 'all' || contact.source === view.sourceFilter
      
      return matchesSearch && matchesStatus && matchesSource
    })
    return filtered.length
  }

  // Get color for each view
  const getViewColor = (viewId: string) => {
    const view = views.find(v => v.id === viewId)
    return view?.color || 'orange.500'
  }

  const contacts = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@carpetsplus.com',
      phone: '+1 (555) 123-4567',
      business: 'Carpets Plus',
      title: 'Owner',
      location: 'San Diego, CA',
      status: 'new',
      source: 'research',
      platforms: ['linkedin', 'facebook', 'google'],
      score: 85,
      addedDate: '2024-01-15',
      lastContact: null,
      notes: 'Interested in carpet cleaning automation',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@techsolutions.com',
      phone: '+1 (555) 234-5678',
      business: 'Tech Solutions Inc',
      title: 'CEO',
      location: 'Santa Barbara, CA',
      status: 'contacted',
      source: 'research',
      platforms: ['linkedin', 'google'],
      score: 92,
      addedDate: '2024-01-10',
      lastContact: '2024-01-12',
      notes: 'Needs software integration services',
    },
    {
      id: '3',
      name: 'Mike Chen',
      email: 'mike@healthyeats.com',
      phone: '+1 (555) 345-6789',
      business: 'Healthy Eats Restaurant',
      title: 'Manager',
      location: 'Los Angeles, CA',
      status: 'qualified',
      source: 'manual',
      platforms: ['instagram', 'facebook'],
      score: 78,
      addedDate: '2024-01-05',
      lastContact: '2024-01-14',
      notes: 'Looking for POS system upgrade',
    },
    {
      id: '4',
      name: 'Anna Williams',
      email: 'anna@designstudio.com',
      phone: '+1 (555) 456-7890',
      business: 'Design Studio Pro',
      title: 'Creative Director',
      location: 'San Francisco, CA',
      status: 'opportunity',
      source: 'research',
      platforms: ['linkedin', 'instagram'],
      score: 88,
      addedDate: '2024-01-08',
      lastContact: '2024-01-13',
      notes: 'Interested in design automation tools',
    },
  ]

  const platforms = [
    { id: 'linkedin', label: 'LinkedIn', color: 'blue' },
    { id: 'facebook', label: 'Facebook', color: 'blue' },
    { id: 'instagram', label: 'Instagram', color: 'pink' },
    { id: 'google', label: 'Google', color: 'green' },
  ]

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'opportunity', label: 'Opportunity' },
    { value: 'closed', label: 'Closed' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'blue'
      case 'contacted': return 'orange'
      case 'qualified': return 'purple'
      case 'opportunity': return 'green'
      case 'closed': return 'gray'
      default: return 'gray'
    }
  }

  const getPlatformColor = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId)
    return platform?.color || 'gray'
  }

  // Functions to manage views
  const updateCurrentView = (updates: Partial<ContactView>) => {
    setViews(prev => prev.map(view => 
      view.id === activeViewId ? { ...view, ...updates } : view
    ))
  }

  const createNewView = () => {
    // Complete reset of all states
    setIsOnboarding(false)
    setEditingTableHeader(false)
    setEditingName('')
    
    // Reset any editing states in existing views
    setViews(prev => prev.map(view => ({ ...view, isEditing: false })))
    
    // Create new view
    const newView: ContactView = {
      id: `view_${Date.now()}`,
      name: 'New View',
      searchTerm: '',
      statusFilter: 'all',
      sourceFilter: 'all',
      sortBy: 'name',
      sortOrder: 'asc',
      isEditing: false,
      color: 'orange.500'
    }
    
    // Add view and set as active
    setViews(prev => [...prev, newView])
    setActiveViewId(newView.id)
    
    // Start onboarding after a brief delay to ensure clean state
    setTimeout(() => {
      setOnboardingStep('name')
      setEditingName('New View')
      setEditingTableHeader(true)
      setIsOnboarding(true)
    }, 100)
  }

  const deleteView = (viewId: string) => {
    if (views.length <= 1) return // Don't delete if it's the last view
    setViews(prev => prev.filter(view => view.id !== viewId))
    if (activeViewId === viewId) {
      setActiveViewId(views[0].id)
    }
  }

  const updateViewName = (viewId: string, name: string) => {
    setViews(prev => prev.map(view => 
      view.id === viewId ? { ...view, name, isEditing: false } : view
    ))
  }

  const startEditingView = (viewId: string) => {
    setViews(prev => prev.map(view => 
      view.id === viewId ? { ...view, isEditing: true } : { ...view, isEditing: false }
    ))
  }

  const handleNameSubmit = (viewId: string) => {
    if (editingName.trim()) {
      updateViewName(viewId, editingName.trim())
      setEditingName('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent, viewId: string) => {
    if (e.key === 'Enter') {
      handleNameSubmit(viewId)
    } else if (e.key === 'Escape') {
      setEditingName('')
      updateViewName(viewId, views.find(v => v.id === viewId)?.name || 'Untitled')
    }
  }

  const filteredContacts = useMemo(() => {
    let filtered = contacts.filter(contact => {
      const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contact.business.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || contact.status === statusFilter
      const matchesSource = sourceFilter === 'all' || contact.source === sourceFilter
      
      return matchesSearch && matchesStatus && matchesSource
    })

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue
      switch (sortBy) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'addedDate':
          aValue = new Date(a.addedDate)
          bValue = new Date(b.addedDate)
          break
        case 'score':
          aValue = a.score
          bValue = b.score
          break
        default:
          aValue = a.name
          bValue = b.name
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [contacts, searchTerm, statusFilter, sourceFilter, sortBy, sortOrder])

  const handleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([])
    } else {
      setSelectedContacts(filteredContacts.map(c => c.id))
    }
  }

  const handleBulkAction = (action: string) => {
    if (selectedContacts.length === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select contacts first.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    switch (action) {
      case 'export':
        toast({
          title: 'Export Started',
          description: `Exporting ${selectedContacts.length} contact(s).`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        })
        break
      case 'delete':
        toast({
          title: 'Contacts Deleted',
          description: `Deleted ${selectedContacts.length} contact(s).`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        setSelectedContacts([])
        break
      case 'email':
        toast({
          title: 'Bulk Email',
          description: `Preparing email campaign for ${selectedContacts.length} contact(s).`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        })
        break
    }
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Page Header */}
        <Flex justify="space-between" align="center">
          <Box>
            <Heading size="xl" mb={2}>Contacts</Heading>
            <Text color="gray.500" fontSize="lg">Manage your prospects and leads</Text>
          </Box>
          <HStack spacing={3}>
            <Button leftIcon={<FiUsers />} colorScheme="blue" variant="outline" size="md">
              Import Contacts
            </Button>
            <Button leftIcon={<FiSearch />} colorScheme="teal" size="md" onClick={onScraperModalOpen}>
              Start Scraping
            </Button>
          </HStack>
        </Flex>

        {/* Stats Cards */}
        <Flex py={6} align="center">
          {/* Scrollable Views Container */}
          <Box 
            overflowX="auto" 
            flex="1"
            pb={4}
            pt={4}
            pl={6}
          >
            <HStack 
              spacing={8}
              minW="fit-content"
            >
              {views.map((view) => (
                <Card
                  key={view.id}
                  minW="200px"
                  minH="120px"
                  cursor="pointer"
                  bg={useColorModeValue('white', 'gray.800')}
                  borderWidth="2px"
                  borderColor={activeViewId === view.id ? 'teal.400' : useColorModeValue('gray.200', 'gray.600')}
                  transform={activeViewId === view.id ? 'scale(1.1)' : 'scale(1)'}
                  transformOrigin="center"
                  _hover={{
                    borderColor: activeViewId === view.id ? 'teal.400' : 'teal.300',
                    transform: 'scale(1.1)',
                    boxShadow: 'lg'
                  }}
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  position="relative"
                  onClick={() => setActiveViewId(view.id)}
                  onContextMenu={(e) => {
                    e.preventDefault()
                  }}
                  role="group"
                >
                  <CardBody display="flex" alignItems="center" justifyContent="center" h="full">
                    <VStack spacing={2}>
                      {view.isEditing ? (
                        <Input
                          value={editingName || view.name}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={() => handleNameSubmit(view.id)}
                          onKeyDown={(e) => handleKeyPress(e, view.id)}
                          size="md"
                          variant="unstyled"
                          fontWeight="medium"
                          textAlign="center"
                          autoFocus
                          onFocus={(e) => {
                            e.target.select()
                            setEditingName(view.name)
                          }}
                        />
                      ) : (
                        <>
                          <Text fontSize="3xl" fontWeight="bold" color={getViewColor(view.id)}>
                            {getViewCount(view)}
                          </Text>
                          <Text 
                            fontSize="sm" 
                            color="gray.500"
                            textAlign="center"
                            onDoubleClick={(e) => {
                              e.stopPropagation()
                              startEditingView(view.id)
                            }}
                          >
                            {view.name}
                          </Text>
                        </>
                      )}
                    </VStack>
                  </CardBody>
                  
                </Card>
              ))}
            </HStack>
          </Box>
          
          {/* Fixed New View Card */}
          <Box flexShrink={0} px={6}>
            <Card
              minW="200px"
              minH="120px"
              cursor="pointer"
              border="2px dashed"
              borderColor="gray.300"
              bg="transparent"
              _hover={{
                borderColor: 'teal.400',
                bg: useColorModeValue('gray.50', 'gray.700')
              }}
              transition="all 0.2s"
              onClick={createNewView}
            >
              <CardBody display="flex" alignItems="center" justifyContent="center" h="full">
                <VStack spacing={2}>
                  <FiPlus size={24} color="gray.500" />
                  <Text fontSize="sm" color="gray.500" fontWeight="medium" textAlign="center">
                    New View
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </Box>
        </Flex>


        {/* Contacts Table */}
        <Card>
          <CardHeader>
            <VStack spacing={4} align="stretch">
              <Flex justify="space-between" align="center">
                <HStack>
                  <Popover 
                    isOpen={isOnboarding && onboardingStep === 'name'} 
                    placement="bottom-start"
                    closeOnBlur={true}
                    onClose={() => {
                      if (isOnboarding && onboardingStep === 'name') {
                        setIsOnboarding(false)
                        if (editingName === '' || editingName === 'New View') {
                          deleteView(activeViewId)
                        }
                      }
                    }}
                  >
                    <PopoverTrigger>
                      <Box
                        border={isOnboarding && onboardingStep === 'name' ? '2px solid' : 'none'}
                        borderColor="purple.400"
                        borderRadius="md"
                        p={isOnboarding && onboardingStep === 'name' ? 2 : 0}
                      >
                        {editingTableHeader ? (
                          <HStack>
                            <Input
                              value={editingName || currentView.name}
                              onChange={(e) => setEditingName(e.target.value)}
                              onBlur={() => {
                                if (editingName.trim()) {
                                  updateViewName(activeViewId, editingName.trim())
                                }
                                setEditingTableHeader(false)
                                setEditingName('')
                                if (isOnboarding && onboardingStep === 'name') {
                                  setOnboardingStep('filters')
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  if (editingName.trim()) {
                                    updateViewName(activeViewId, editingName.trim())
                                  } else if (isOnboarding) {
                                    // If name is empty during onboarding, delete the view and cancel
                                    setIsOnboarding(false)
                                    deleteView(activeViewId)
                                    return
                                  }
                                  setEditingTableHeader(false)
                                  setEditingName('')
                                  if (isOnboarding && onboardingStep === 'name') {
                                    setOnboardingStep('filters')
                                  }
                                } else if (e.key === 'Escape') {
                                  setEditingTableHeader(false)
                                  setEditingName('')
                                  if (isOnboarding) {
                                    setIsOnboarding(false)
                                    deleteView(activeViewId)
                                  }
                                } else if (e.key === 'Backspace' && editingName === '' && isOnboarding) {
                                  // If user backspaces to empty during onboarding, cancel
                                  setIsOnboarding(false)
                                  setEditingTableHeader(false)
                                  deleteView(activeViewId)
                                }
                              }}
                              size="md"
                              variant="unstyled"
                              fontWeight="bold"
                              fontSize="lg"
                              autoFocus
                              onFocus={(e) => {
                                e.target.select()
                                setEditingName(currentView.name)
                              }}
                              maxW="200px"
                            />
                            <Menu>
                              <MenuButton as={IconButton} size="sm" variant="ghost">
                                <HStack spacing={1}>
                                  <Circle size="16px" bg={currentView.color} />
                                  <FiChevronDown size={12} />
                                </HStack>
                              </MenuButton>
                              <MenuList>
                                {colorOptions.map(color => (
                                  <MenuItem 
                                    key={color}
                                    onClick={() => {
                                      setViews(prev => prev.map(view => 
                                        view.id === activeViewId ? { ...view, color } : view
                                      ))
                                    }}
                                  >
                                    <HStack>
                                      <Circle size="16px" bg={color} />
                                      <Text textTransform="capitalize">{color.split('.')[0]}</Text>
                                    </HStack>
                                  </MenuItem>
                                ))}
                              </MenuList>
                            </Menu>
                          </HStack>
                        ) : (
                          <HStack>
                            <Heading size="md">{currentView.name}</Heading>
                            <Menu>
                              <MenuButton as={IconButton} size="sm" variant="ghost">
                                <HStack spacing={1}>
                                  <Circle size="16px" bg={currentView.color} />
                                  <FiChevronDown size={12} />
                                </HStack>
                              </MenuButton>
                              <MenuList>
                                {colorOptions.map(color => (
                                  <MenuItem 
                                    key={color}
                                    onClick={() => {
                                      setViews(prev => prev.map(view => 
                                        view.id === activeViewId ? { ...view, color } : view
                                      ))
                                    }}
                                  >
                                    <HStack>
                                      <Circle size="16px" bg={color} />
                                      <Text textTransform="capitalize">{color.split('.')[0]}</Text>
                                    </HStack>
                                  </MenuItem>
                                ))}
                              </MenuList>
                            </Menu>
                          </HStack>
                        )}
                      </Box>
                    </PopoverTrigger>
                    <PopoverContent>
                      <PopoverArrow />
                      <PopoverHeader>Name Your View</PopoverHeader>
                      <PopoverBody>
                        What do you want to name this view? Type a name and press Enter.
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                  <Badge colorScheme="teal">{filteredContacts.length}</Badge>
                </HStack>
                <HStack>
                  <IconButton
                    icon={<FiEdit2 />}
                    size="sm"
                    variant="outline"
                    aria-label="Edit current view name"
                    onClick={() => {
                      setEditingTableHeader(true)
                      setEditingName(currentView.name)
                    }}
                  />
                  {views.length > 1 && (
                    <IconButton
                      icon={<FiTrash2 />}
                      size="sm"
                      variant="outline"
                      colorScheme="red"
                      aria-label="Delete current view"
                      onClick={() => deleteView(activeViewId)}
                    />
                  )}
                  <HStack spacing={0} bg={useColorModeValue('gray.100', 'gray.700')} borderRadius="lg" p="1px">
                    <Button
                      size="sm"
                      variant="ghost"
                      borderRadius={viewMode === 'table' ? 'lg' : 'lg 0 0 lg'}
                      bg={viewMode === 'table' ? 'teal.500' : 'transparent'}
                      color={viewMode === 'table' ? 'white' : 'inherit'}
                      borderRight={viewMode === 'table' ? 'none' : '1px solid'}
                      borderColor={useColorModeValue('gray.300', 'gray.600')}
                      _hover={{
                        bg: viewMode === 'table' ? 'teal.600' : useColorModeValue('gray.200', 'gray.600')
                      }}
                      onClick={() => setViewMode('table')}
                      m="1px"
                    >
                      Table
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      borderRadius={viewMode === 'cards' ? 'lg' : '0 lg lg 0'}
                      bg={viewMode === 'cards' ? 'teal.500' : 'transparent'}
                      color={viewMode === 'cards' ? 'white' : 'inherit'}
                      _hover={{
                        bg: viewMode === 'cards' ? 'teal.600' : useColorModeValue('gray.200', 'gray.600')
                      }}
                      onClick={() => setViewMode('cards')}
                      m="1px"
                    >
                      Cards
                    </Button>
                  </HStack>
                </HStack>
              </Flex>
              
              {/* Filters Row */}
              <Popover 
                isOpen={isOnboarding && onboardingStep === 'filters'} 
                placement="bottom"
                closeOnBlur={true}
                onClose={() => {
                  if (isOnboarding && onboardingStep === 'filters') {
                    setIsOnboarding(false)
                  }
                }}
              >
                <PopoverTrigger>
                  <Box
                    border={isOnboarding && onboardingStep === 'filters' ? '2px solid' : 'none'}
                    borderColor="purple.400"
                    borderRadius="md"
                    p={isOnboarding && onboardingStep === 'filters' ? 2 : 0}
                  >
                    <HStack spacing={4} flexWrap="wrap">
                      <InputGroup maxW="300px">
                        <InputLeftElement><FiSearch /></InputLeftElement>
                        <Input
                          placeholder="Search contacts..."
                          value={searchTerm}
                          onChange={(e) => updateCurrentView({ searchTerm: e.target.value })}
                          size="sm"
                        />
                      </InputGroup>
                      
                      <Select
                        value={statusFilter}
                        onChange={(e) => {
                          updateCurrentView({ statusFilter: e.target.value })
                          if (isOnboarding && onboardingStep === 'filters') {
                            setOnboardingStep('complete')
                            setIsOnboarding(false)
                          }
                        }}
                        maxW="150px"
                        size="sm"
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>

                      <Select
                        value={sourceFilter}
                        onChange={(e) => updateCurrentView({ sourceFilter: e.target.value })}
                        maxW="150px"
                        size="sm"
                      >
                        <option value="all">All Sources</option>
                        <option value="research">Research</option>
                        <option value="manual">Manual</option>
                        <option value="import">Import</option>
                      </Select>

                      <Select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                          const [sort, order] = e.target.value.split('-')
                          updateCurrentView({ sortBy: sort, sortOrder: order as 'asc' | 'desc' })
                        }}
                        maxW="150px"
                        size="sm"
                      >
                        <option value="name-asc">Name A-Z</option>
                        <option value="name-desc">Name Z-A</option>
                        <option value="addedDate-desc">Latest First</option>
                        <option value="addedDate-asc">Oldest First</option>
                        <option value="score-desc">Score High-Low</option>
                      </Select>

                      {selectedContacts.length > 0 && (
                        <HStack spacing={2} ml="auto">
                          <Button size="sm" leftIcon={<FiMail />} onClick={() => handleBulkAction('email')}>
                            Email ({selectedContacts.length})
                          </Button>
                          <Button size="sm" leftIcon={<FiDownload />} onClick={() => handleBulkAction('export')}>
                            Export
                          </Button>
                          <Button size="sm" leftIcon={<FiTrash2 />} colorScheme="red" variant="outline" onClick={() => handleBulkAction('delete')}>
                            Delete
                          </Button>
                        </HStack>
                      )}
                    </HStack>
                  </Box>
                </PopoverTrigger>
                <PopoverContent>
                  <PopoverArrow />
                  <PopoverHeader>Configure Your View</PopoverHeader>
                  <PopoverBody>
                    {onboardingStep === 'filters' ? 
                      'Pick who shows up in this view by adjusting the filters. Try changing a filter to continue.' :
                      'All set! Your new view is ready to use.'
                    }
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </VStack>
          </CardHeader>
          <CardBody>
            {viewMode === 'table' ? (
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th width="40px">
                        <Checkbox
                          isChecked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                          isIndeterminate={selectedContacts.length > 0 && selectedContacts.length < filteredContacts.length}
                          onChange={handleSelectAll}
                          colorScheme="teal"
                        />
                      </Th>
                      <Th>Contact</Th>
                      <Th>Business</Th>
                      <Th>Status</Th>
                      <Th>Platforms</Th>
                      <Th>Score</Th>
                      <Th>Added</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredContacts.map((contact) => (
                      <Tr key={contact.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                        <Td>
                          <Checkbox
                            isChecked={selectedContacts.includes(contact.id)}
                            onChange={() => {
                              setSelectedContacts(prev =>
                                prev.includes(contact.id)
                                  ? prev.filter(id => id !== contact.id)
                                  : [...prev, contact.id]
                              )
                            }}
                            colorScheme="teal"
                          />
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium" fontSize="sm">{contact.name}</Text>
                            <Text fontSize="xs" color="gray.500">{contact.title}</Text>
                            <Text fontSize="xs" color="gray.500">{contact.email}</Text>
                          </VStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm">{contact.business}</Text>
                            <Text fontSize="xs" color="gray.500">{contact.location}</Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(contact.status)} size="sm">
                            {contact.status}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={1}>
                            {contact.platforms.map((platformId) => (
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
                        <Td>
                          <Badge
                            colorScheme={contact.score >= 80 ? 'green' : contact.score >= 60 ? 'yellow' : 'red'}
                            size="sm"
                          >
                            {contact.score}%
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontSize="xs" color="gray.500">
                            {new Date(contact.addedDate).toLocaleDateString()}
                          </Text>
                        </Td>
                        <Td>
                          <Menu>
                            <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
                            <MenuList>
                              <MenuItem icon={<FiEye />}>View Details</MenuItem>
                              <MenuItem icon={<FiEdit2 />}>Edit Contact</MenuItem>
                              <MenuItem icon={<FiMail />}>Send Email</MenuItem>
                              <MenuItem icon={<FiTrash2 />} color="red.500">Delete</MenuItem>
                            </MenuList>
                          </Menu>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {filteredContacts.map((contact) => (
                  <Card key={contact.id} size="sm">
                    <CardBody>
                      <VStack align="start" spacing={3}>
                        <HStack justify="space-between" width="100%">
                          <Checkbox
                            isChecked={selectedContacts.includes(contact.id)}
                            onChange={() => {
                              setSelectedContacts(prev =>
                                prev.includes(contact.id)
                                  ? prev.filter(id => id !== contact.id)
                                  : [...prev, contact.id]
                              )
                            }}
                            colorScheme="teal"
                          />
                          <Badge colorScheme={getStatusColor(contact.status)} size="sm">
                            {contact.status}
                          </Badge>
                        </HStack>
                        
                        <VStack align="start" spacing={1} width="100%">
                          <Text fontWeight="bold">{contact.name}</Text>
                          <Text fontSize="sm" color="gray.500">{contact.title}</Text>
                          <Text fontSize="sm">{contact.business}</Text>
                        </VStack>

                        <VStack align="start" spacing={1} fontSize="xs" color="gray.500" width="100%">
                          <HStack><FiMail /><Text>{contact.email}</Text></HStack>
                          <HStack><FiPhone /><Text>{contact.phone}</Text></HStack>
                          <HStack><FiMapPin /><Text>{contact.location}</Text></HStack>
                        </VStack>

                        <HStack spacing={1} flexWrap="wrap">
                          {contact.platforms.map((platformId) => (
                            <Badge
                              key={platformId}
                              colorScheme={getPlatformColor(platformId)}
                              size="sm"
                            >
                              {platforms.find(p => p.id === platformId)?.label || platformId}
                            </Badge>
                          ))}
                        </HStack>

                        <HStack justify="space-between" width="100%">
                          <Badge
                            colorScheme={contact.score >= 80 ? 'green' : contact.score >= 60 ? 'yellow' : 'red'}
                            size="sm"
                          >
                            {contact.score}%
                          </Badge>
                          <Text fontSize="xs" color="gray.500">
                            Added {new Date(contact.addedDate).toLocaleDateString()}
                          </Text>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </CardBody>
        </Card>
      </VStack>

      {/* Scraper Configuration Modal */}
      <Modal isOpen={isScraperModalOpen} onClose={onScraperModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <FiSearch />
              <Text>Contact Scraper</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6} align="stretch">
              {/* Basic Configuration */}
              <Box>
                <Heading size="md" mb={4}>Search Configuration</Heading>
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel>Location</FormLabel>
                    <Input
                      placeholder="e.g., San Francisco, CA or New York, NY"
                      value={scraperConfig.location}
                      onChange={(e) => setScraperConfig(prev => ({ ...prev, location: e.target.value }))}
                    />
                    <FormHelperText>City, state, or specific area to search in</FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Industry/Business Type</FormLabel>
                    <Input
                      placeholder="e.g., restaurants, dentists, plumbers"
                      value={scraperConfig.industry}
                      onChange={(e) => setScraperConfig(prev => ({ ...prev, industry: e.target.value }))}
                    />
                    <FormHelperText>Type of business to target</FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Job Title (Optional)</FormLabel>
                    <Input
                      placeholder="e.g., owner, manager, CEO"
                      value={scraperConfig.jobTitle}
                      onChange={(e) => setScraperConfig(prev => ({ ...prev, jobTitle: e.target.value }))}
                    />
                    <FormHelperText>Specific job titles to look for</FormHelperText>
                  </FormControl>
                </VStack>
              </Box>

              {/* Keywords Section */}
              <Box>
                <FormLabel>Keywords (Max 5)</FormLabel>
                <VStack spacing={3} align="stretch">
                  <Input
                    placeholder="Type a keyword and press Enter"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={handleKeywordKeyPress}
                    isDisabled={scraperConfig.keywords.length >= 5}
                  />
                  {scraperConfig.keywords.length > 0 && (
                    <Flex flexWrap="wrap" gap={2}>
                      {scraperConfig.keywords.map((keyword) => (
                        <Tag
                          key={keyword}
                          size="md"
                          borderRadius="full"
                          variant="solid"
                          colorScheme="teal"
                        >
                          <Text>{keyword}</Text>
                          <IconButton
                            icon={<FiX />}
                            size="xs"
                            variant="ghost"
                            colorScheme="teal"
                            aria-label="Remove keyword"
                            onClick={() => removeKeyword(keyword)}
                            ml={1}
                          />
                        </Tag>
                      ))}
                    </Flex>
                  )}
                  <FormHelperText>
                    Keywords to include in search. Press Enter to add each keyword.
                  </FormHelperText>
                </VStack>
              </Box>

              {/* Advanced Settings */}
              <Accordion allowToggle>
                <AccordionItem>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      <Text fontWeight="medium">Advanced Settings</Text>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <FormControl>
                      <FormLabel>Maximum Results</FormLabel>
                      <NumberInput
                        value={scraperConfig.maxResults}
                        min={10}
                        max={500}
                        onChange={(_, num) => setScraperConfig(prev => ({ ...prev, maxResults: num || 50 }))}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <FormHelperText>Number of contacts to find (10-500)</FormHelperText>
                    </FormControl>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>

              {/* Progress Bar */}
              {isScrapingInProgress && (
                <Box>
                  <Text mb={2} fontWeight="medium">Scraping in progress...</Text>
                  <Progress value={scrapingProgress} colorScheme="teal" hasStripe isAnimated />
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    {Math.round(scrapingProgress)}% complete
                  </Text>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onScraperModalClose} isDisabled={isScrapingInProgress}>
              Cancel
            </Button>
            <Button 
              colorScheme="teal" 
              onClick={startScraping}
              isLoading={isScrapingInProgress}
              loadingText="Scraping..."
            >
              Start Scraping
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

interface ViewCardsProps {
  views: ContactView[]
  activeViewId: string
  onViewSelect: (viewId: string) => void
  onCreateView: () => void
  onDeleteView: (viewId: string) => void
  onUpdateViewName: (viewId: string, name: string) => void
  onStartEditing: (viewId: string) => void
}

function ViewCards({ 
  views, 
  activeViewId, 
  onViewSelect, 
  onCreateView, 
  onDeleteView, 
  onUpdateViewName, 
  onStartEditing 
}: ViewCardsProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const handleDragStart = (e: React.DragEvent, viewId: string) => {
    setDraggedId(viewId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    setDraggedId(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedId || draggedId === targetId) return
    
    // Implement reordering logic here
    console.log(`Move ${draggedId} to ${targetId}`)
  }

  const handleNameSubmit = (viewId: string) => {
    if (editingName.trim()) {
      onUpdateViewName(viewId, editingName.trim())
      setEditingName('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent, viewId: string) => {
    if (e.key === 'Enter') {
      handleNameSubmit(viewId)
    } else if (e.key === 'Escape') {
      setEditingName('')
      onUpdateViewName(viewId, views.find(v => v.id === viewId)?.name || 'Untitled')
    }
  }

  return (
    <HStack spacing={3} overflowX="auto" pb={2}>
      {views.map((view) => (
        <Card
          key={view.id}
          minW="120px"
          cursor="pointer"
          draggable
          onDragStart={(e) => handleDragStart(e, view.id)}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, view.id)}
          bg={activeViewId === view.id ? 'teal.500' : useColorModeValue('white', 'gray.700')}
          color={activeViewId === view.id ? 'white' : 'inherit'}
          borderColor={activeViewId === view.id ? 'teal.500' : useColorModeValue('gray.200', 'gray.600')}
          _hover={{
            borderColor: activeViewId === view.id ? 'teal.600' : 'teal.300',
            transform: 'translateY(-1px)',
            boxShadow: 'md'
          }}
          transition="all 0.2s"
          position="relative"
          onClick={() => onViewSelect(view.id)}
        >
          <CardBody p={3}>
            {view.isEditing ? (
              <Input
                value={editingName || view.name}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => handleNameSubmit(view.id)}
                onKeyDown={(e) => handleKeyPress(e, view.id)}
                size="sm"
                variant="unstyled"
                fontWeight="medium"
                textAlign="center"
                autoFocus
                onFocus={(e) => {
                  e.target.select()
                  setEditingName(view.name)
                }}
              />
            ) : (
              <Text
                fontWeight="medium"
                fontSize="sm"
                textAlign="center"
                noOfLines={2}
                onDoubleClick={(e) => {
                  e.stopPropagation()
                  onStartEditing(view.id)
                }}
              >
                {view.name}
              </Text>
            )}
          </CardBody>
          
          {views.length > 1 && !view.isEditing && (
            <IconButton
              icon={<FiX />}
              size="xs"
              variant="ghost"
              position="absolute"
              top={1}
              right={1}
              color={activeViewId === view.id ? 'white' : 'gray.400'}
              _hover={{
                color: 'red.500',
                bg: activeViewId === view.id ? 'whiteAlpha.200' : 'red.50'
              }}
              onClick={(e) => {
                e.stopPropagation()
                onDeleteView(view.id)
              }}
              aria-label="Delete view"
            />
          )}
        </Card>
      ))}
      
      {/* Add New View Button */}
      <Card
        minW="120px"
        cursor="pointer"
        border="2px dashed"
        borderColor={useColorModeValue('gray.300', 'gray.600')}
        bg="transparent"
        _hover={{
          borderColor: 'teal.400',
          bg: useColorModeValue('teal.50', 'teal.900')
        }}
        transition="all 0.2s"
        onClick={onCreateView}
      >
        <CardBody p={3}>
          <Flex align="center" justify="center" h="100%">
            <VStack spacing={1}>
              <FiPlus size={20} />
              <Text fontSize="xs" fontWeight="medium">
                New View
              </Text>
            </VStack>
          </Flex>
        </CardBody>
      </Card>
    </HStack>
  )
}