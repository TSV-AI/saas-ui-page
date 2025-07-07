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
  Avatar,
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react'
import { FiPlus, FiSearch, FiMoreVertical, FiEdit2, FiTrash2, FiMail, FiPhone, FiMapPin } from 'react-icons/fi'

export default function Team() {
  const teamMembers = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Frontend Developer',
      department: 'Engineering',
      status: 'Active',
      avatar: 'https://bit.ly/sage-adebayo',
      phone: '+1 (555) 123-4567',
      location: 'New York, NY',
      joinDate: '2023-01-15',
      projects: 5,
      skills: ['React', 'TypeScript', 'Next.js'],
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Backend Developer',
      department: 'Engineering',
      status: 'Active',
      avatar: 'https://bit.ly/kent-c-dodds',
      phone: '+1 (555) 234-5678',
      location: 'San Francisco, CA',
      joinDate: '2023-02-20',
      projects: 3,
      skills: ['Node.js', 'Python', 'PostgreSQL'],
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'UI/UX Designer',
      department: 'Design',
      status: 'Active',
      avatar: 'https://bit.ly/ryan-florence',
      phone: '+1 (555) 345-6789',
      location: 'Austin, TX',
      joinDate: '2023-03-10',
      projects: 4,
      skills: ['Figma', 'Sketch', 'Adobe XD'],
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      role: 'Product Manager',
      department: 'Product',
      status: 'Active',
      avatar: 'https://bit.ly/prosper-baba',
      phone: '+1 (555) 456-7890',
      location: 'Seattle, WA',
      joinDate: '2022-12-01',
      projects: 8,
      skills: ['Product Strategy', 'Analytics', 'Roadmapping'],
    },
    {
      id: 5,
      name: 'David Brown',
      email: 'david@example.com',
      role: 'DevOps Engineer',
      department: 'Engineering',
      status: 'Away',
      avatar: 'https://bit.ly/code-beast',
      phone: '+1 (555) 567-8901',
      location: 'Denver, CO',
      joinDate: '2023-04-05',
      projects: 2,
      skills: ['AWS', 'Docker', 'Kubernetes'],
    },
    {
      id: 6,
      name: 'Lisa Anderson',
      email: 'lisa@example.com',
      role: 'Marketing Manager',
      department: 'Marketing',
      status: 'Inactive',
      avatar: 'https://bit.ly/sage-adebayo',
      phone: '+1 (555) 678-9012',
      location: 'Miami, FL',
      joinDate: '2023-05-15',
      projects: 6,
      skills: ['Digital Marketing', 'SEO', 'Content Strategy'],
    },
  ]

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Flex justify="space-between" align="center">
          <Box>
            <Heading size="lg" mb={2}>
              Team
            </Heading>
            <Text color="gray.500">Manage your team members and their roles</Text>
          </Box>
          <Button leftIcon={<FiPlus />} colorScheme="blue">
            Add Member
          </Button>
        </Flex>

        <Tabs>
          <TabList>
            <Tab>All Members</Tab>
            <Tab>Active</Tab>
            <Tab>Inactive</Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>
              <TeamView members={teamMembers} />
            </TabPanel>
            <TabPanel px={0}>
              <TeamView members={teamMembers.filter(m => m.status === 'Active')} />
            </TabPanel>
            <TabPanel px={0}>
              <TeamView members={teamMembers.filter(m => m.status === 'Inactive')} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  )
}

interface TeamViewProps {
  members: any[]
}

function TeamView({ members }: TeamViewProps) {
  return (
    <VStack spacing={6} align="stretch">
      <Card>
        <CardBody>
          <HStack spacing={4}>
            <InputGroup flex={1}>
              <InputLeftElement pointerEvents="none">
                <FiSearch />
              </InputLeftElement>
              <Input placeholder="Search team members..." />
            </InputGroup>
            <Select placeholder="All Departments" width="200px">
              <option value="engineering">Engineering</option>
              <option value="design">Design</option>
              <option value="product">Product</option>
              <option value="marketing">Marketing</option>
            </Select>
            <Select placeholder="All Roles" width="200px">
              <option value="developer">Developer</option>
              <option value="designer">Designer</option>
              <option value="manager">Manager</option>
            </Select>
          </HStack>
        </CardBody>
      </Card>

      <Tabs>
        <TabList>
          <Tab>Card View</Tab>
          <Tab>Table View</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {members.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </SimpleGrid>
          </TabPanel>
          <TabPanel px={0}>
            <Card>
              <CardBody>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Member</Th>
                        <Th>Role</Th>
                        <Th>Department</Th>
                        <Th>Status</Th>
                        <Th>Projects</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {members.map((member) => (
                        <Tr key={member.id}>
                          <Td>
                            <HStack>
                              <Avatar size="sm" src={member.avatar} />
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="medium">{member.name}</Text>
                                <Text fontSize="sm" color="gray.500">
                                  {member.email}
                                </Text>
                              </VStack>
                            </HStack>
                          </Td>
                          <Td>{member.role}</Td>
                          <Td>{member.department}</Td>
                          <Td>
                            <Badge
                              colorScheme={
                                member.status === 'Active' ? 'green' : 
                                member.status === 'Away' ? 'yellow' : 'gray'
                              }
                            >
                              {member.status}
                            </Badge>
                          </Td>
                          <Td>{member.projects}</Td>
                          <Td>
                            <Menu>
                              <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
                              <MenuList>
                                <MenuItem icon={<FiEdit2 />}>Edit</MenuItem>
                                <MenuItem icon={<FiTrash2 />} color="red.500">
                                  Remove
                                </MenuItem>
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
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  )
}

interface TeamMemberCardProps {
  member: any
}

function TeamMemberCard({ member }: TeamMemberCardProps) {
  return (
    <Card>
      <CardHeader>
        <Flex justify="space-between" align="start">
          <HStack>
            <Avatar size="lg" src={member.avatar} />
            <VStack align="start" spacing={1}>
              <Heading size="md">{member.name}</Heading>
              <Text color="gray.500">{member.role}</Text>
              <Badge
                colorScheme={
                  member.status === 'Active' ? 'green' : 
                  member.status === 'Away' ? 'yellow' : 'gray'
                }
              >
                {member.status}
              </Badge>
            </VStack>
          </HStack>
          <Menu>
            <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
            <MenuList>
              <MenuItem icon={<FiEdit2 />}>Edit</MenuItem>
              <MenuItem icon={<FiTrash2 />} color="red.500">
                Remove
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </CardHeader>
      <CardBody pt={0}>
        <VStack spacing={3} align="stretch">
          <HStack color="gray.500" fontSize="sm">
            <FiMail />
            <Text>{member.email}</Text>
          </HStack>
          <HStack color="gray.500" fontSize="sm">
            <FiPhone />
            <Text>{member.phone}</Text>
          </HStack>
          <HStack color="gray.500" fontSize="sm">
            <FiMapPin />
            <Text>{member.location}</Text>
          </HStack>
          
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Skills
            </Text>
            <HStack flexWrap="wrap">
              {member.skills.map((skill: string, index: number) => (
                <Badge key={index} colorScheme="blue" size="sm">
                  {skill}
                </Badge>
              ))}
            </HStack>
          </Box>

          <HStack justify="space-between" fontSize="sm">
            <Text color="gray.500">Projects: {member.projects}</Text>
            <Text color="gray.500">Joined: {member.joinDate}</Text>
          </HStack>

          <Button size="sm" colorScheme="blue" variant="outline">
            View Profile
          </Button>
        </VStack>
      </CardBody>
    </Card>
  )
}