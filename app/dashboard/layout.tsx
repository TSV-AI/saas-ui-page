'use client'

import {
  Box,
  Flex,
  HStack,
  IconButton,
  useColorModeValue,
  Drawer,
  DrawerContent,
  useDisclosure,
  VStack,
  Text,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorMode,
  Tooltip,
} from '@chakra-ui/react'
import { FiHome, FiTrendingUp, FiCompass, FiStar, FiSettings, FiMenu, FiBell, FiChevronDown, FiSun, FiMoon, FiSearch, FiUsers } from 'react-icons/fi'
import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TSBLogo } from '../../components/layout/tsb-logo'

const LinkItems = [
  { name: 'Dashboard', icon: FiHome, href: '/dashboard' },
  { name: 'Analytics', icon: FiTrendingUp, href: '/dashboard/analytics' },
  { name: 'Projects', icon: FiCompass, href: '/dashboard/projects' },
  { name: 'Research', icon: FiSearch, href: '/dashboard/research' },
  { name: 'Contacts', icon: FiUsers, href: '/dashboard/contacts' },
  // { name: 'Team', icon: FiStar, href: '/dashboard/team' }, // Hidden for now
  { name: 'Settings', icon: FiSettings, href: '/dashboard/settings' },
]

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
      <SidebarContent 
        onClose={() => onClose} 
        display={{ base: 'none', md: 'block' }}
        isHovered={isHovered}
        onHover={setIsHovered}
      />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} isHovered={true} onHover={() => {}} />
        </DrawerContent>
      </Drawer>
      <MobileNav onOpen={onOpen} isHovered={isHovered} />
      <Box ml={{ base: 0, md: isHovered ? 60 : 16 }} p="4" transition="margin-left 0.3s ease">
        {children}
      </Box>
    </Box>
  )
}

interface SidebarProps {
  onClose: () => void
  display?: any
  isHovered?: boolean
  onHover?: (hovered: boolean) => void
}

const SidebarContent = ({ onClose, isHovered = false, onHover, ...rest }: SidebarProps) => {
  return (
    <Box
      transition="width 0.3s ease"
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: isHovered ? 60 : 16 }}
      pos="fixed"
      h="full"
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      {...rest}
    >
      <Flex h="20" alignItems="center" mx={isHovered ? "8" : "2"} justifyContent={isHovered ? "space-between" : "center"} transition="all 0.3s ease">
        {isHovered ? (
          <TSBLogo height="48px" />
        ) : (
          <TSBLogo height="36px" />
        )}
      </Flex>
      {LinkItems.map((link) => (
        <NavItem key={link.name} icon={link.icon} href={link.href} isCollapsed={!isHovered}>
          {link.name}
        </NavItem>
      ))}
    </Box>
  )
}

interface NavItemProps {
  icon: any
  children: ReactNode
  href: string
  isCollapsed?: boolean
}

const NavItem = ({ icon, children, href, isCollapsed = false }: NavItemProps) => {
  const pathname = usePathname()
  const isActive = pathname === href
  
  const navContent = (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <Box px={isCollapsed ? "2" : "4"} py="2">
        <Flex
          align="center"
          p="2"
          borderRadius="lg"
          role="group"
          cursor="pointer"
          bg={isActive ? 'teal.600' : 'transparent'}
          color={isActive ? 'white' : 'inherit'}
          _hover={{
            bg: 'teal.600',
            color: 'white',
          }}
          transition="all 0.3s ease"
          justify={isCollapsed ? "center" : "flex-start"}
        >
          {icon && (
            <Box
              mr={isCollapsed ? "0" : "4"}
              fontSize="16"
              color={isActive ? 'white' : 'inherit'}
              _groupHover={{
                color: 'white',
              }}
              as={icon}
            />
          )}
          {!isCollapsed && children}
        </Flex>
      </Box>
    </Link>
  )

  if (isCollapsed) {
    return (
      <Tooltip label={children} placement="right" hasArrow>
        {navContent}
      </Tooltip>
    )
  }

  return navContent
}

interface MobileProps {
  onOpen: () => void
}

const MobileNav = ({ onOpen, isHovered }: MobileProps & { isHovered: boolean }) => {
  const { colorMode, toggleColorMode } = useColorMode()
  
  return (
    <Flex
      ml={{ base: 0, md: isHovered ? 60 : 16 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue('white', 'gray.900')}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      transition="margin-left 0.3s ease"
    >
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <Box display={{ base: 'flex', md: 'none' }}>
        <TSBLogo height="40px" />
      </Box>

      <HStack spacing={{ base: '0', md: '6' }}>
        <IconButton 
          size="lg" 
          variant="ghost" 
          aria-label="toggle dark mode" 
          icon={colorMode === 'light' ? <FiMoon /> : <FiSun />} 
          onClick={toggleColorMode}
        />
        <IconButton size="lg" variant="ghost" aria-label="notifications" icon={<FiBell />} />
        <Flex alignItems={'center'}>
          <Menu>
            <MenuButton py={2} transition="all 0.3s" _focus={{ boxShadow: 'none' }}>
              <HStack>
                <Avatar
                  size={'sm'}
                  src={
                    'https://images.unsplash.com/photo-1619946794135-5bc917a27793?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9'
                  }
                />
                <VStack
                  display={{ base: 'none', md: 'flex' }}
                  alignItems="flex-start"
                  spacing="1px"
                  ml="2"
                >
                  <Text fontSize="sm">Justina Clark</Text>
                  <Text fontSize="xs" color="gray.600">
                    Admin
                  </Text>
                </VStack>
                <Box display={{ base: 'none', md: 'flex' }}>
                  <FiChevronDown />
                </Box>
              </HStack>
            </MenuButton>
            <MenuList
              bg={useColorModeValue('white', 'gray.900')}
              borderColor={useColorModeValue('gray.200', 'gray.700')}
            >
              <MenuItem>Profile</MenuItem>
              <MenuItem>Settings</MenuItem>
              <MenuItem>Billing</MenuItem>
              <MenuDivider />
              <MenuItem>Sign out</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </HStack>
    </Flex>
  )
}