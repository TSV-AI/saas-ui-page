import { Box, useColorModeValue, Image } from '@chakra-ui/react'
import * as React from 'react'

interface TSBLogoProps {
  height?: string
  width?: string
}

export const TSBLogo: React.FC<TSBLogoProps> = ({ height = '32px', width = 'auto' }) => {
  const logoSrc = useColorModeValue(
    '/static/tsv logos/tsvflatblack.png', // Light mode - black logo
    '/static/tsv logos/tsvflatwhite.png'  // Dark mode - white logo
  )
  
  return (
    <Box height={height} width={width}>
      <Image
        src={logoSrc}
        alt="TSV Logo"
        height={height}
        width={width}
        objectFit="contain"
      />
    </Box>
  )
}

export default TSBLogo