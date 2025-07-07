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
  Progress,
  Avatar,
  AvatarGroup,
  SimpleGrid,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
} from '@chakra-ui/react'
import { FiPlus, FiSearch, FiMoreVertical, FiEdit2, FiTrash2, FiUsers, FiCalendar } from 'react-icons/fi'

export default function Projects() {
  const projects = [
    {
      id: 1,
      name: 'Website Redesign',
      description: 'Complete redesign of the company website with modern UI/UX',
      progress: 75,
      status: 'In Progress',
      priority: 'High',
      dueDate: '2024-02-15',
      team: [
        'https://bit.ly/sage-adebayo',
        'https://bit.ly/kent-c-dodds',
        'https://bit.ly/ryan-florence',
      ],
      tasks: 12,
      completedTasks: 9,
    },
    {
      id: 2,
      name: 'Mobile App Development',
      description: 'Native mobile app for iOS and Android platforms',
      progress: 45,
      status: 'In Progress',
      priority: 'High',
      dueDate: '2024-03-01',
      team: [
        'https://bit.ly/prosper-baba',
        'https://bit.ly/code-beast',
        'https://bit.ly/sage-adebayo',
        'https://bit.ly/kent-c-dodds',
      ],
      tasks: 18,
      completedTasks: 8,
    },
    {
      id: 3,
      name: 'API Integration',
      description: 'Integration with third-party APIs and services',
      progress: 90,
      status: 'Review',
      priority: 'Medium',
      dueDate: '2024-01-30',
      team: [
        'https://bit.ly/ryan-florence',
        'https://bit.ly/prosper-baba',
      ],
      tasks: 8,
      completedTasks: 7,
    },
    {
      id: 4,
      name: 'Dashboard Analytics',
      description: 'Advanced analytics dashboard with real-time data',
      progress: 60,
      status: 'In Progress',
      priority: 'Medium',
      dueDate: '2024-02-20',
      team: [
        'https://bit.ly/code-beast',
        'https://bit.ly/sage-adebayo',
        'https://bit.ly/kent-c-dodds',
      ],
      tasks: 15,
      completedTasks: 9,
    },
    {
      id: 5,
      name: 'User Authentication',
      description: 'Implement secure user authentication system',
      progress: 100,
      status: 'Completed',
      priority: 'High',
      dueDate: '2024-01-15',
      team: [
        'https://bit.ly/ryan-florence',
        'https://bit.ly/prosper-baba',
      ],
      tasks: 6,
      completedTasks: 6,
    },
    {
      id: 6,
      name: 'Payment Integration',
      description: 'Integrate payment processing with Stripe',
      progress: 25,
      status: 'Planning',
      priority: 'Low',
      dueDate: '2024-03-15',
      team: [
        'https://bit.ly/sage-adebayo',
      ],
      tasks: 10,
      completedTasks: 2,
    },
  ]

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Flex justify="space-between" align="center">
          <Box>
            <Heading size="lg" mb={2}>
              Projects
            </Heading>
            <Text color="gray.500">Manage and track your project progress</Text>
          </Box>
          <Button leftIcon={<FiPlus />} colorScheme="blue">
            New Project
          </Button>
        </Flex>

        <Card>
          <CardBody>
            <HStack spacing={4}>
              <InputGroup flex={1}>
                <InputLeftElement pointerEvents="none">
                  <FiSearch />
                </InputLeftElement>
                <Input placeholder="Search projects..." />
              </InputGroup>
              <Select placeholder="All Status" width="150px">
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="planning">Planning</option>
                <option value="review">Review</option>
              </Select>
              <Select placeholder="All Priority" width="150px">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>
            </HStack>
          </CardBody>
        </Card>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  )
}

interface ProjectCardProps {
  project: {
    id: number
    name: string
    description: string
    progress: number
    status: string
    priority: string
    dueDate: string
    team: string[]
    tasks: number
    completedTasks: number
  }
}

function ProjectCard({ project }: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'blue'
      case 'Completed':
        return 'green'
      case 'Planning':
        return 'yellow'
      case 'Review':
        return 'purple'
      default:
        return 'gray'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'red'
      case 'Medium':
        return 'orange'
      case 'Low':
        return 'green'
      default:
        return 'gray'
    }
  }

  return (
    <Card>
      <CardHeader>
        <Flex justify="space-between" align="start">
          <VStack align="start" spacing={2} flex={1}>
            <HStack>
              <Heading size="md">{project.name}</Heading>
              <Badge colorScheme={getPriorityColor(project.priority)} size="sm">
                {project.priority}
              </Badge>
            </HStack>
            <Text fontSize="sm" color="gray.500" noOfLines={2}>
              {project.description}
            </Text>
          </VStack>
          <Menu>
            <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
            <MenuList>
              <MenuItem icon={<FiEdit2 />}>Edit</MenuItem>
              <MenuItem icon={<FiTrash2 />} color="red.500">
                Delete
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </CardHeader>
      <CardBody pt={0}>
        <VStack spacing={4} align="stretch">
          <Box>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" color="gray.500">
                Progress
              </Text>
              <Text fontSize="sm" fontWeight="medium">
                {project.progress}%
              </Text>
            </HStack>
            <Progress value={project.progress} colorScheme="blue" size="sm" />
          </Box>

          <HStack justify="space-between">
            <Badge colorScheme={getStatusColor(project.status)}>{project.status}</Badge>
            <HStack fontSize="sm" color="gray.500">
              <FiCalendar />
              <Text>{project.dueDate}</Text>
            </HStack>
          </HStack>

          <HStack justify="space-between">
            <HStack fontSize="sm" color="gray.500">
              <FiUsers />
              <Text>
                {project.completedTasks}/{project.tasks} tasks
              </Text>
            </HStack>
            <AvatarGroup size="sm" max={3}>
              {project.team.map((member, index) => (
                <Avatar key={index} src={member} />
              ))}
            </AvatarGroup>
          </HStack>

          <Button size="sm" variant="outline" colorScheme="blue">
            View Details
          </Button>
        </VStack>
      </CardBody>
    </Card>
  )
}