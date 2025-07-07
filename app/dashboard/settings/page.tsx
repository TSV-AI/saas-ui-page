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
  Textarea,
  Button,
  Switch,
  Select,
  Divider,
  Avatar,
  Badge,
  useColorModeValue,
  SimpleGrid,
  IconButton,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi'

export default function Settings() {
  return (
    <Box>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            Settings
          </Heading>
          <Text color="gray.500">Manage your account settings and preferences</Text>
        </Box>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <ProfileSettings />
          <AccountSettings />
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <NotificationSettings />
          <SecuritySettings />
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <TeamSettings />
          <BillingSettings />
        </SimpleGrid>
      </VStack>
    </Box>
  )
}

function ProfileSettings() {
  return (
    <Card>
      <CardHeader>
        <Heading size="md">Profile Settings</Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <HStack spacing={4}>
            <Avatar size="lg" src="https://bit.ly/sage-adebayo" />
            <VStack align="start" spacing={1}>
              <Button size="sm" colorScheme="blue">
                Change Avatar
              </Button>
              <Text fontSize="xs" color="gray.500">
                JPG, PNG. Max size 2MB
              </Text>
            </VStack>
          </HStack>

          <FormControl>
            <FormLabel>Full Name</FormLabel>
            <Input placeholder="John Doe" />
          </FormControl>

          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input type="email" placeholder="john@example.com" />
          </FormControl>

          <FormControl>
            <FormLabel>Bio</FormLabel>
            <Textarea placeholder="Tell us about yourself..." rows={3} />
          </FormControl>

          <FormControl>
            <FormLabel>Location</FormLabel>
            <Input placeholder="New York, NY" />
          </FormControl>

          <Button colorScheme="blue" size="sm">
            Save Changes
          </Button>
        </VStack>
      </CardBody>
    </Card>
  )
}

function AccountSettings() {
  return (
    <Card>
      <CardHeader>
        <Heading size="md">Account Settings</Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input placeholder="johndoe" />
          </FormControl>

          <FormControl>
            <FormLabel>Company</FormLabel>
            <Input placeholder="Acme Corp" />
          </FormControl>

          <FormControl>
            <FormLabel>Role</FormLabel>
            <Select placeholder="Select role">
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="viewer">Viewer</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Time Zone</FormLabel>
            <Select placeholder="Select timezone">
              <option value="utc">UTC</option>
              <option value="est">EST</option>
              <option value="pst">PST</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Language</FormLabel>
            <Select placeholder="Select language">
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </Select>
          </FormControl>

          <Button colorScheme="blue" size="sm">
            Update Account
          </Button>
        </VStack>
      </CardBody>
    </Card>
  )
}

function NotificationSettings() {
  return (
    <Card>
      <CardHeader>
        <Heading size="md">Notification Settings</Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <Box>
              <Text fontWeight="medium">Email Notifications</Text>
              <Text fontSize="sm" color="gray.500">
                Receive notifications via email
              </Text>
            </Box>
            <Switch colorScheme="blue" />
          </HStack>

          <HStack justify="space-between">
            <Box>
              <Text fontWeight="medium">Push Notifications</Text>
              <Text fontSize="sm" color="gray.500">
                Receive push notifications
              </Text>
            </Box>
            <Switch colorScheme="blue" defaultChecked />
          </HStack>

          <HStack justify="space-between">
            <Box>
              <Text fontWeight="medium">SMS Notifications</Text>
              <Text fontSize="sm" color="gray.500">
                Receive notifications via SMS
              </Text>
            </Box>
            <Switch colorScheme="blue" />
          </HStack>

          <Divider />

          <HStack justify="space-between">
            <Box>
              <Text fontWeight="medium">Marketing Emails</Text>
              <Text fontSize="sm" color="gray.500">
                Receive marketing and promotional emails
              </Text>
            </Box>
            <Switch colorScheme="blue" />
          </HStack>

          <HStack justify="space-between">
            <Box>
              <Text fontWeight="medium">Weekly Reports</Text>
              <Text fontSize="sm" color="gray.500">
                Get weekly performance reports
              </Text>
            </Box>
            <Switch colorScheme="blue" defaultChecked />
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  )
}

function SecuritySettings() {
  return (
    <Card>
      <CardHeader>
        <Heading size="md">Security Settings</Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Alert status="info">
            <AlertIcon />
            Two-factor authentication is enabled for your account
          </Alert>

          <FormControl>
            <FormLabel>Current Password</FormLabel>
            <Input type="password" />
          </FormControl>

          <FormControl>
            <FormLabel>New Password</FormLabel>
            <Input type="password" />
          </FormControl>

          <FormControl>
            <FormLabel>Confirm New Password</FormLabel>
            <Input type="password" />
          </FormControl>

          <Button colorScheme="blue" size="sm">
            Update Password
          </Button>

          <Divider />

          <HStack justify="space-between">
            <Box>
              <Text fontWeight="medium">Two-Factor Authentication</Text>
              <Text fontSize="sm" color="gray.500">
                Add an extra layer of security
              </Text>
            </Box>
            <Switch colorScheme="blue" defaultChecked />
          </HStack>

          <Button variant="outline" colorScheme="red" size="sm">
            Disable Account
          </Button>
        </VStack>
      </CardBody>
    </Card>
  )
}

function TeamSettings() {
  const teamMembers = [
    { name: 'John Doe', email: 'john@example.com', role: 'Admin', avatar: 'https://bit.ly/sage-adebayo' },
    { name: 'Jane Smith', email: 'jane@example.com', role: 'User', avatar: 'https://bit.ly/kent-c-dodds' },
    { name: 'Mike Johnson', email: 'mike@example.com', role: 'User', avatar: 'https://bit.ly/ryan-florence' },
  ]

  return (
    <Card>
      <CardHeader>
        <HStack justify="space-between">
          <Heading size="md">Team Settings</Heading>
          <Button leftIcon={<FiPlus />} colorScheme="blue" size="sm">
            Add Member
          </Button>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          {teamMembers.map((member, index) => (
            <HStack key={index} justify="space-between">
              <HStack>
                <Avatar size="sm" src={member.avatar} />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="medium">{member.name}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {member.email}
                  </Text>
                </VStack>
              </HStack>
              <HStack>
                <Badge colorScheme={member.role === 'Admin' ? 'purple' : 'blue'}>{member.role}</Badge>
                <IconButton icon={<FiEdit2 />} size="sm" variant="ghost" aria-label="Edit" />
                <IconButton icon={<FiTrash2 />} size="sm" variant="ghost" colorScheme="red" aria-label="Delete" />
              </HStack>
            </HStack>
          ))}
        </VStack>
      </CardBody>
    </Card>
  )
}

function BillingSettings() {
  return (
    <Card>
      <CardHeader>
        <Heading size="md">Billing Settings</Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <Box>
              <Text fontWeight="medium">Current Plan</Text>
              <Text fontSize="sm" color="gray.500">
                Pro Plan - $29/month
              </Text>
            </Box>
            <Badge colorScheme="green">Active</Badge>
          </HStack>

          <HStack justify="space-between">
            <Box>
              <Text fontWeight="medium">Next Billing Date</Text>
              <Text fontSize="sm" color="gray.500">
                February 15, 2024
              </Text>
            </Box>
            <Text fontWeight="medium">$29.00</Text>
          </HStack>

          <Divider />

          <HStack justify="space-between">
            <Box>
              <Text fontWeight="medium">Payment Method</Text>
              <Text fontSize="sm" color="gray.500">
                **** **** **** 1234
              </Text>
            </Box>
            <Button size="sm" variant="outline">
              Update
            </Button>
          </HStack>

          <HStack justify="space-between">
            <Box>
              <Text fontWeight="medium">Billing Address</Text>
              <Text fontSize="sm" color="gray.500">
                123 Main St, New York, NY 10001
              </Text>
            </Box>
            <Button size="sm" variant="outline">
              Edit
            </Button>
          </HStack>

          <Button colorScheme="blue" size="sm">
            Upgrade Plan
          </Button>

          <Button variant="outline" colorScheme="red" size="sm">
            Cancel Subscription
          </Button>
        </VStack>
      </CardBody>
    </Card>
  )
}