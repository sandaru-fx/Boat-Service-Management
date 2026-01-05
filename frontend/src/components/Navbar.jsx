import React from 'react';
import { Button, Container, Flex, HStack, Text, useColorMode, Box, useColorModeValue } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { PlusSquareIcon } from '@chakra-ui/icons';
import { IoMoon } from 'react-icons/io5';
import { LuSun } from 'react-icons/lu';

const Navbar = () => {
	const { colorMode, toggleColorMode } = useColorMode();
	const location = useLocation();

	// Determine current role based on path
	const isEmployee = location.pathname.startsWith('/employee');
	const isCustomer = location.pathname.startsWith('/customer') || location.pathname === '/';

	// Determine which home page to route to based on current path
	const homeLink = isEmployee ? '/employee' : '/customer';

	// Determine create button link and text
	const getCreateButton = () => {
		if (isEmployee) {
			return {
				link: '/employee/packages',
				text: 'Manage Packages',
				icon: <PlusSquareIcon fontSize={20} />
			};
		} else {
			return {
				link: '/booking',
				text: 'Book Now',
				icon: <PlusSquareIcon fontSize={20} />
			};
		}
	};

	const createButton = getCreateButton();

	return (
		<Box bg={useColorModeValue('white', 'gray.800')} shadow="sm" borderBottom="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
			<Container maxW="1140px" px={4}>
				<Flex
					h={16}
					alignItems="center"
					justifyContent="space-between"
					flexDir={{
						base: "column",
						sm: "row",
					}}
				>
					<Box w={{ base: "full", sm: "auto" }} textAlign={{ base: "center", sm: "left" }}>
						<Text
							fontSize={{ base: "22", sm: "28" }}
							fontWeight="bold"
							textTransform="uppercase"
							bgGradient="linear(to-r, blue.400, teal.500)"
							bgClip="text"
							ml={{ base: 0, sm: 16 }}
						>
							<Link to={homeLink}>Boat Service Management</Link>
						</Text>
					</Box>

					<HStack spacing={2} alignItems="center">
						<Link to={createButton.link}>
							<Button leftIcon={createButton.icon} colorScheme="blue">
								{createButton.text}
							</Button>
						</Link>
						
						<Link to={isEmployee ? '/customer' : '/employee'}>
							<Button colorScheme="blue" variant="outline">
								{isEmployee ? 'Customer View' : 'Employee View'}
							</Button>
						</Link>
						
						<Button onClick={toggleColorMode} variant="ghost">
							{colorMode === "light" ? <IoMoon /> : <LuSun size="20" />}
						</Button>
					</HStack>
				</Flex>
			</Container>
		</Box>
	);
};

export default Navbar;
