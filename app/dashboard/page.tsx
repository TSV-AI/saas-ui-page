'use client'

import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Progress,
  Card,
  CardHeader,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Avatar,
  Button,
  Flex,
} from '@chakra-ui/react'
import { FiUsers, FiDollarSign, FiActivity, FiTrendingUp } from 'react-icons/fi'

export default function Dashboard() {
  return (
    <Box>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            Dashboard
          </Heading>
          <Text color="gray.500">Welcome back! Here's what's happening with your business.</Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <StatsCard
            title="Total Revenue"
            stat="$45,231"
            icon={<FiDollarSign />}
            change={12.5}
            changeText="Since last month"
          />
          <StatsCard
            title="Active Users"
            stat="1,234"
            icon={<FiUsers />}
            change={8.2}
            changeText="Since last week"
          />
          <StatsCard
            title="Conversion Rate"
            stat="3.24%"
            icon={<FiActivity />}
            change={-2.1}
            changeText="Since last month"
          />
          <StatsCard
            title="Growth Rate"
            stat="24.3%"
            icon={<FiTrendingUp />}
            change={15.8}
            changeText="Since last quarter"
          />
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <RecentActivity />
          <TeamMembers />
        </SimpleGrid>

        <ProjectsOverview />
      </VStack>
    </Box>
  )
}

interface StatsCardProps {
  title: string
  stat: string
  icon: React.ReactElement
  change: number
  changeText: string
}

function StatsCard({ title, stat, icon, change, changeText }: StatsCardProps) {
  return (
    <Card>
      <CardBody>
        <Stat>
          <StatLabel>{title}</StatLabel>
          <HStack>
            <Box color="blue.500" fontSize="2xl">
              {icon}
            </Box>
            <StatNumber fontSize="2xl">{stat}</StatNumber>
          </HStack>
          <StatHelpText>
            <StatArrow type={change > 0 ? 'increase' : 'decrease'} />
            {Math.abs(change)}% {changeText}
          </StatHelpText>
        </Stat>
      </CardBody>
    </Card>
  )
}

function RecentActivity() {
  const activities = [
    {
      user: 'John Doe',
      action: 'Created new project',
      time: '2 hours ago',
      avatar: 'https://bit.ly/sage-adebayo',
    },
    {
      user: 'Jane Smith',
      action: 'Updated user profile',
      time: '4 hours ago',
      avatar: 'https://bit.ly/kent-c-dodds',
    },
    {
      user: 'Mike Johnson',
      action: 'Completed task',
      time: '6 hours ago',
      avatar: 'https://bit.ly/ryan-florence',
    },
    {
      user: 'Sarah Wilson',
      action: 'Added new team member',
      time: '1 day ago',
      avatar: 'https://bit.ly/prosper-baba',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <Heading size="md">Recent Activity</Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          {activities.map((activity, index) => (
            <HStack key={index} spacing={3}>
              <Avatar size="sm" src={activity.avatar} />
              <VStack spacing={0} align="start" flex={1}>
                <Text fontWeight="medium">{activity.user}</Text>
                <Text fontSize="sm" color="gray.500">
                  {activity.action}
                </Text>
              </VStack>
              <Text fontSize="xs" color="gray.400">
                {activity.time}
              </Text>
            </HStack>
          ))}
        </VStack>
      </CardBody>
    </Card>
  )
}

function TeamMembers() {
  const members = [
    {
      name: 'John Doe',
      role: 'Frontend Developer',
      status: 'Online',
      avatar: 'https://bit.ly/sage-adebayo',
    },
    {
      name: 'Jane Smith',
      role: 'Backend Developer',
      status: 'Away',
      avatar: 'https://bit.ly/kent-c-dodds',
    },
    {
      name: 'Mike Johnson',
      role: 'Designer',
      status: 'Online',
      avatar: 'https://bit.ly/ryan-florence',
    },
    {
      name: 'Sarah Wilson',
      role: 'Product Manager',
      status: 'Offline',
      avatar: 'https://bit.ly/prosper-baba',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <Heading size="md">Team Members</Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          {members.map((member, index) => (
            <HStack key={index} spacing={3}>
              <Avatar size="sm" src={member.avatar} />
              <VStack spacing={0} align="start" flex={1}>
                <Text fontWeight="medium">{member.name}</Text>
                <Text fontSize="sm" color="gray.500">
                  {member.role}
                </Text>
              </VStack>
              <Badge
                colorScheme={
                  member.status === 'Online' ? 'green' : member.status === 'Away' ? 'yellow' : 'gray'
                }
              >
                {member.status}
              </Badge>
            </HStack>
          ))}
        </VStack>
      </CardBody>
    </Card>
  )
}

function ProjectsOverview() {
  const projects = [
    {
      name: 'Website Redesign',
      progress: 75,
      status: 'In Progress',
      dueDate: '2024-02-15',
      team: 4,
    },
    {
      name: 'Mobile App',
      progress: 45,
      status: 'In Progress',
      dueDate: '2024-03-01',
      team: 6,
    },
    {
      name: 'API Integration',
      progress: 90,
      status: 'Review',
      dueDate: '2024-01-30',
      team: 3,
    },
    {
      name: 'Dashboard Analytics',
      progress: 60,
      status: 'In Progress',
      dueDate: '2024-02-20',
      team: 5,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <Flex justify="space-between" align="center">
          <Heading size="md">Projects Overview</Heading>
          <Button colorScheme="blue" size="sm">
            View All
          </Button>
        </Flex>
      </CardHeader>
      <CardBody>
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Project</Th>
                <Th>Progress</Th>
                <Th>Status</Th>
                <Th>Due Date</Th>
                <Th>Team</Th>
              </Tr>
            </Thead>
            <Tbody>
              {projects.map((project, index) => (
                <Tr key={index}>
                  <Td>
                    <Text fontWeight="medium">{project.name}</Text>
                  </Td>
                  <Td>
                    <VStack align="start" spacing={1}>
                      <Progress value={project.progress} size="sm" colorScheme="blue" width="100px" />
                      <Text fontSize="xs" color="gray.500">
                        {project.progress}%
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={
                        project.status === 'In Progress' ? 'blue' : project.status === 'Review' ? 'yellow' : 'green'
                      }
                    >
                      {project.status}
                    </Badge>
                  </Td>
                  <Td>{project.dueDate}</Td>
                  <Td>{project.team} members</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </CardBody>
    </Card>
  )
}