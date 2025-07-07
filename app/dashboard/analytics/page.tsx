'use client'

import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardHeader,
  CardBody,
  Progress,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Select,
  Button,
  Flex,
} from '@chakra-ui/react'
import { FiUsers, FiEye, FiMousePointer, FiTrendingUp } from 'react-icons/fi'

export default function Analytics() {
  return (
    <Box>
      <VStack spacing={8} align="stretch">
        <Flex justify="space-between" align="center">
          <Box>
            <Heading size="lg" mb={2}>
              Analytics
            </Heading>
            <Text color="gray.500">Track your website performance and user engagement</Text>
          </Box>
          <HStack>
            <Select placeholder="Last 30 days" size="sm" w="150px">
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </Select>
            <Button colorScheme="blue" size="sm">
              Export
            </Button>
          </HStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <AnalyticsCard
            title="Total Visitors"
            stat="24,567"
            icon={<FiUsers />}
            change={12.5}
            changeText="vs last month"
          />
          <AnalyticsCard
            title="Page Views"
            stat="89,234"
            icon={<FiEye />}
            change={8.2}
            changeText="vs last month"
          />
          <AnalyticsCard
            title="Click Rate"
            stat="3.24%"
            icon={<FiMousePointer />}
            change={-2.1}
            changeText="vs last month"
          />
          <AnalyticsCard
            title="Conversion Rate"
            stat="2.1%"
            icon={<FiTrendingUp />}
            change={15.8}
            changeText="vs last month"
          />
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <TrafficSources />
          <TopPages />
        </SimpleGrid>

        <UserBehavior />
      </VStack>
    </Box>
  )
}

interface AnalyticsCardProps {
  title: string
  stat: string
  icon: React.ReactElement
  change: number
  changeText: string
}

function AnalyticsCard({ title, stat, icon, change, changeText }: AnalyticsCardProps) {
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

function TrafficSources() {
  const sources = [
    { name: 'Organic Search', visitors: 12547, percentage: 45 },
    { name: 'Direct', visitors: 8932, percentage: 32 },
    { name: 'Social Media', visitors: 3421, percentage: 12 },
    { name: 'Email', visitors: 2156, percentage: 8 },
    { name: 'Referral', visitors: 834, percentage: 3 },
  ]

  return (
    <Card>
      <CardHeader>
        <Heading size="md">Traffic Sources</Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          {sources.map((source, index) => (
            <Box key={index}>
              <HStack justify="space-between" mb={2}>
                <Text fontWeight="medium">{source.name}</Text>
                <Text fontSize="sm" color="gray.500">
                  {source.visitors.toLocaleString()} ({source.percentage}%)
                </Text>
              </HStack>
              <Progress value={source.percentage} colorScheme="blue" size="sm" />
            </Box>
          ))}
        </VStack>
      </CardBody>
    </Card>
  )
}

function TopPages() {
  const pages = [
    { path: '/', views: 15234, bounce: 25 },
    { path: '/dashboard', views: 8765, bounce: 15 },
    { path: '/pricing', views: 5432, bounce: 35 },
    { path: '/features', views: 3210, bounce: 20 },
    { path: '/about', views: 1987, bounce: 45 },
  ]

  return (
    <Card>
      <CardHeader>
        <Heading size="md">Top Pages</Heading>
      </CardHeader>
      <CardBody>
        <TableContainer>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Page</Th>
                <Th>Views</Th>
                <Th>Bounce Rate</Th>
              </Tr>
            </Thead>
            <Tbody>
              {pages.map((page, index) => (
                <Tr key={index}>
                  <Td>
                    <Text fontWeight="medium">{page.path}</Text>
                  </Td>
                  <Td>{page.views.toLocaleString()}</Td>
                  <Td>
                    <Badge colorScheme={page.bounce < 30 ? 'green' : page.bounce < 40 ? 'yellow' : 'red'}>
                      {page.bounce}%
                    </Badge>
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

function UserBehavior() {
  const behaviors = [
    { metric: 'Average Session Duration', value: '3m 24s', change: 8.2 },
    { metric: 'Pages per Session', value: '4.2', change: -2.1 },
    { metric: 'New vs Returning', value: '65% / 35%', change: 5.3 },
    { metric: 'Mobile vs Desktop', value: '58% / 42%', change: 12.4 },
  ]

  return (
    <Card>
      <CardHeader>
        <Heading size="md">User Behavior</Heading>
      </CardHeader>
      <CardBody>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          {behaviors.map((behavior, index) => (
            <Box key={index}>
              <Text fontSize="sm" color="gray.500" mb={1}>
                {behavior.metric}
              </Text>
              <Text fontSize="2xl" fontWeight="bold" mb={1}>
                {behavior.value}
              </Text>
              <HStack>
                <Text fontSize="sm" color={behavior.change > 0 ? 'green.500' : 'red.500'}>
                  {behavior.change > 0 ? '↗' : '↘'} {Math.abs(behavior.change)}%
                </Text>
              </HStack>
            </Box>
          ))}
        </SimpleGrid>
      </CardBody>
    </Card>
  )
}