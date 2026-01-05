import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  useColorModeValue,
  Icon,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  Input,
  useToast,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Checkbox,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Image,
  Avatar,
  AvatarGroup,
  Flex,
  Spacer,
  Tooltip,
  IconButton,
  Switch,
  FormErrorMessage,
} from '@chakra-ui/react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaSave, 
  FaTimes, 
  FaUsers, 
  FaStar, 
  FaTrophy, 
  FaChartLine, 
  FaInfo, 
  FaCog,
  FaShip,
  FaAward,
  FaHeart,
  FaShieldAlt,
  FaCertificate,
  FaMedal,
  FaFlag,
  FaUpload,
  FaImage,
  FaLink,
  FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa';

const AdminAboutPage = () => {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingItem, setEditingItem] = useState(null);
  const [editingType, setEditingType] = useState('');
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Form states
  const [companyInfo, setCompanyInfo] = useState({
    title: '',
    subtitle: '',
    description: '',
    mission: '',
    vision: '',
    values: []
  });

  const [statistics, setStatistics] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [callToAction, setCallToAction] = useState({
    title: '',
    description: '',
    primaryButton: { text: '', link: '' },
    secondaryButton: { text: '', link: '' }
  });
  const [settings, setSettings] = useState({
    showTeam: true,
    showTestimonials: true,
    showAchievements: true,
    showStatistics: true,
    enableVideo: false,
    videoUrl: ''
  });

  // Fetch about data
  const fetchAboutData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/about`);
      const result = await response.json();
      
      if (result.success) {
        setAboutData(result.data);
        setCompanyInfo(result.data.companyInfo || {});
        setStatistics(result.data.statistics || []);
        setTeamMembers(result.data.teamMembers || []);
        setTestimonials(result.data.testimonials || []);
        setAchievements(result.data.achievements || []);
        setCallToAction(result.data.callToAction || {});
        setSettings(result.data.settings || {});
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch about page data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAboutData();
  }, []);

  // Save company info
  const saveCompanyInfo = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/about/company-info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyInfo }),
      });

      const result = await response.json();
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Company information updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchAboutData();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update company information',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  // Save statistics
  const saveStatistics = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/about/statistics`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ statistics }),
      });

      const result = await response.json();
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Statistics updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchAboutData();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update statistics',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  // Add team member
  const addTeamMember = () => {
    setEditingType('team');
    setEditingItem({
      name: '',
      role: '',
      experience: '',
      image: '',
      specialties: [],
      bio: '',
      order: teamMembers.length
    });
    onOpen();
  };

  // Edit team member
  const editTeamMember = (member) => {
    setEditingType('team');
    setEditingItem(member);
    onOpen();
  };

  // Delete team member
  const deleteTeamMember = async (memberId) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/about/team-members/${memberId}`, {
          method: 'DELETE',
        });

        const result = await response.json();
        if (result.success) {
          toast({
            title: 'Success',
            description: 'Team member deleted successfully',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          fetchAboutData();
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete team member',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  // Add testimonial
  const addTestimonial = () => {
    setEditingType('testimonial');
    setEditingItem({
      name: '',
      boat: '',
      rating: 5,
      text: '',
      order: testimonials.length
    });
    onOpen();
  };

  // Edit testimonial
  const editTestimonial = (testimonial) => {
    setEditingType('testimonial');
    setEditingItem(testimonial);
    onOpen();
  };

  // Delete testimonial
  const deleteTestimonial = async (testimonialId) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/about/testimonials/${testimonialId}`, {
          method: 'DELETE',
        });

        const result = await response.json();
        if (result.success) {
          toast({
            title: 'Success',
            description: 'Testimonial deleted successfully',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          fetchAboutData();
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete testimonial',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  // Add achievement
  const addAchievement = () => {
    setEditingType('achievement');
    setEditingItem({
      title: '',
      description: '',
      icon: 'FaTrophy',
      year: '',
      order: achievements.length
    });
    onOpen();
  };

  // Edit achievement
  const editAchievement = (achievement) => {
    setEditingType('achievement');
    setEditingItem(achievement);
    onOpen();
  };

  // Delete achievement
  const deleteAchievement = async (achievementId) => {
    if (window.confirm('Are you sure you want to delete this achievement?')) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/about/achievements/${achievementId}`, {
          method: 'DELETE',
        });

        const result = await response.json();
        if (result.success) {
          toast({
            title: 'Success',
            description: 'Achievement deleted successfully',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          fetchAboutData();
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete achievement',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  // Save call to action
  const saveCallToAction = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/about/call-to-action`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ callToAction }),
      });

      const result = await response.json();
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Call to action updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchAboutData();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update call to action',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  // Save settings
  const saveSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/about/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      });

      const result = await response.json();
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Settings updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchAboutData();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update settings',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  // Save item (team member, testimonial, achievement)
  const saveItem = async () => {
    try {
      setSaving(true);
      let url = '';
      let method = 'POST';

      if (editingType === 'team') {
        url = editingItem._id 
          ? `${process.env.REACT_APP_API_URL}/api/about/team-members/${editingItem._id}`
          : `${process.env.REACT_APP_API_URL}/api/about/team-members`;
        method = editingItem._id ? 'PUT' : 'POST';
      } else if (editingType === 'testimonial') {
        url = editingItem._id 
          ? `${process.env.REACT_APP_API_URL}/api/about/testimonials/${editingItem._id}`
          : `${process.env.REACT_APP_API_URL}/api/about/testimonials`;
        method = editingItem._id ? 'PUT' : 'POST';
      } else if (editingType === 'achievement') {
        url = editingItem._id 
          ? `${process.env.REACT_APP_API_URL}/api/about/achievements/${editingItem._id}`
          : `${process.env.REACT_APP_API_URL}/api/about/achievements`;
        method = editingItem._id ? 'PUT' : 'POST';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          teamMember: editingType === 'team' ? editingItem : undefined,
          testimonial: editingType === 'testimonial' ? editingItem : undefined,
          achievement: editingType === 'achievement' ? editingItem : undefined
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast({
          title: 'Success',
          description: `${editingType.charAt(0).toUpperCase() + editingType.slice(1)} saved successfully`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
        fetchAboutData();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to save ${editingType}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Icon as={FaShip} boxSize={12} color="blue.500" />
          <Text>Loading about page data...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Heading size="2xl" mb={4} color={textColor}>
            <HStack justify="center" spacing={3}>
              <Icon as={FaShip} color="blue.500" />
              <Text>About Page Management</Text>
            </HStack>
          </Heading>
          <Text color={textColor}>
            Manage your About page content, team members, testimonials, and more
          </Text>
        </Box>

        {/* Tabs */}
        <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
          <TabList>
            <Tab><Icon as={FaInfo} mr={2} />Company Info</Tab>
            <Tab><Icon as={FaChartLine} mr={2} />Statistics</Tab>
            <Tab><Icon as={FaUsers} mr={2} />Team Members</Tab>
            <Tab><Icon as={FaStar} mr={2} />Testimonials</Tab>
            <Tab><Icon as={FaTrophy} mr={2} />Achievements</Tab>
            <Tab><Icon as={FaCog} mr={2} />Settings</Tab>
          </TabList>

          <TabPanels>
            {/* Company Information Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card>
                  <CardHeader>
                    <Heading size="md">Company Information</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4}>
                      <FormControl>
                        <FormLabel>Page Title</FormLabel>
                        <Input
                          value={companyInfo.title || ''}
                          onChange={(e) => setCompanyInfo({...companyInfo, title: e.target.value})}
                          placeholder="About Marine Service Center"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Subtitle</FormLabel>
                        <Input
                          value={companyInfo.subtitle || ''}
                          onChange={(e) => setCompanyInfo({...companyInfo, subtitle: e.target.value})}
                          placeholder="Your Trusted Marine Partner"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Description</FormLabel>
                        <Textarea
                          value={companyInfo.description || ''}
                          onChange={(e) => setCompanyInfo({...companyInfo, description: e.target.value})}
                          placeholder="Company description..."
                          rows={4}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Mission</FormLabel>
                        <Input
                          value={companyInfo.mission || ''}
                          onChange={(e) => setCompanyInfo({...companyInfo, mission: e.target.value})}
                          placeholder="Our mission statement..."
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Vision</FormLabel>
                        <Input
                          value={companyInfo.vision || ''}
                          onChange={(e) => setCompanyInfo({...companyInfo, vision: e.target.value})}
                          placeholder="Our vision statement..."
                        />
                      </FormControl>
                      <Button
                        colorScheme="blue"
                        leftIcon={<Icon as={FaSave} />}
                        onClick={saveCompanyInfo}
                        isLoading={saving}
                        loadingText="Saving..."
                      >
                        Save Company Info
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Statistics Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card>
                  <CardHeader>
                    <HStack justify="space-between">
                      <Heading size="md">Statistics</Heading>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        leftIcon={<Icon as={FaPlus} />}
                        onClick={() => {
                          setStatistics([...statistics, {
                            number: '',
                            label: '',
                            icon: 'FaAward',
                            color: 'blue',
                            order: statistics.length
                          }]);
                        }}
                      >
                        Add Statistic
                      </Button>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4}>
                      {statistics.map((stat, index) => (
                        <Card key={index} variant="outline">
                          <CardBody>
                            <SimpleGrid columns={4} spacing={4}>
                              <FormControl>
                                <FormLabel>Number</FormLabel>
                                <Input
                                  value={stat.number}
                                  onChange={(e) => {
                                    const newStats = [...statistics];
                                    newStats[index].number = e.target.value;
                                    setStatistics(newStats);
                                  }}
                                  placeholder="15+"
                                />
                              </FormControl>
                              <FormControl>
                                <FormLabel>Label</FormLabel>
                                <Input
                                  value={stat.label}
                                  onChange={(e) => {
                                    const newStats = [...statistics];
                                    newStats[index].label = e.target.value;
                                    setStatistics(newStats);
                                  }}
                                  placeholder="Years Experience"
                                />
                              </FormControl>
                              <FormControl>
                                <FormLabel>Icon</FormLabel>
                                <Select
                                  value={stat.icon}
                                  onChange={(e) => {
                                    const newStats = [...statistics];
                                    newStats[index].icon = e.target.value;
                                    setStatistics(newStats);
                                  }}
                                >
                                  <option value="FaAward">Award</option>
                                  <option value="FaShip">Ship</option>
                                  <option value="FaHeart">Heart</option>
                                  <option value="FaShieldAlt">Shield</option>
                                  <option value="FaUsers">Users</option>
                                  <option value="FaTools">Tools</option>
                                </Select>
                              </FormControl>
                              <FormControl>
                                <FormLabel>Color</FormLabel>
                                <Select
                                  value={stat.color}
                                  onChange={(e) => {
                                    const newStats = [...statistics];
                                    newStats[index].color = e.target.value;
                                    setStatistics(newStats);
                                  }}
                                >
                                  <option value="blue">Blue</option>
                                  <option value="green">Green</option>
                                  <option value="red">Red</option>
                                  <option value="orange">Orange</option>
                                  <option value="purple">Purple</option>
                                </Select>
                              </FormControl>
                            </SimpleGrid>
                            <HStack justify="flex-end" mt={4}>
                              <IconButton
                                icon={<Icon as={FaTrash} />}
                                colorScheme="red"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newStats = statistics.filter((_, i) => i !== index);
                                  setStatistics(newStats);
                                }}
                              />
                            </HStack>
                          </CardBody>
                        </Card>
                      ))}
                      <Button
                        colorScheme="blue"
                        leftIcon={<Icon as={FaSave} />}
                        onClick={saveStatistics}
                        isLoading={saving}
                        loadingText="Saving..."
                      >
                        Save Statistics
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Team Members Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card>
                  <CardHeader>
                    <HStack justify="space-between">
                      <Heading size="md">Team Members</Heading>
                      <Button
                        colorScheme="blue"
                        leftIcon={<Icon as={FaPlus} />}
                        onClick={addTeamMember}
                      >
                        Add Team Member
                      </Button>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <TableContainer>
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Name</Th>
                            <Th>Role</Th>
                            <Th>Experience</Th>
                            <Th>Specialties</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {teamMembers.map((member) => (
                            <Tr key={member._id}>
                              <Td>
                                <HStack>
                                  <Avatar size="sm" src={member.image} />
                                  <Text fontWeight="bold">{member.name}</Text>
                                </HStack>
                              </Td>
                              <Td>{member.role}</Td>
                              <Td>{member.experience}</Td>
                              <Td>
                                <HStack spacing={1}>
                                  {member.specialties?.map((specialty, idx) => (
                                    <Badge key={idx} size="sm" colorScheme="blue">
                                      {specialty}
                                    </Badge>
                                  ))}
                                </HStack>
                              </Td>
                              <Td>
                                <HStack spacing={2}>
                                  <IconButton
                                    icon={<Icon as={FaEdit} />}
                                    size="sm"
                                    colorScheme="blue"
                                    variant="ghost"
                                    onClick={() => editTeamMember(member)}
                                  />
                                  <IconButton
                                    icon={<Icon as={FaTrash} />}
                                    size="sm"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={() => deleteTeamMember(member._id)}
                                  />
                                </HStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Testimonials Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card>
                  <CardHeader>
                    <HStack justify="space-between">
                      <Heading size="md">Customer Testimonials</Heading>
                      <Button
                        colorScheme="blue"
                        leftIcon={<Icon as={FaPlus} />}
                        onClick={addTestimonial}
                      >
                        Add Testimonial
                      </Button>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <TableContainer>
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Customer</Th>
                            <Th>Boat</Th>
                            <Th>Rating</Th>
                            <Th>Testimonial</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {testimonials.map((testimonial) => (
                            <Tr key={testimonial._id}>
                              <Td fontWeight="bold">{testimonial.name}</Td>
                              <Td>{testimonial.boat}</Td>
                              <Td>
                                <HStack spacing={1}>
                                  {[...Array(testimonial.rating)].map((_, i) => (
                                    <Icon key={i} as={FaStar} color="yellow.400" />
                                  ))}
                                </HStack>
                              </Td>
                              <Td maxW="300px" isTruncated>
                                {testimonial.text}
                              </Td>
                              <Td>
                                <HStack spacing={2}>
                                  <IconButton
                                    icon={<Icon as={FaEdit} />}
                                    size="sm"
                                    colorScheme="blue"
                                    variant="ghost"
                                    onClick={() => editTestimonial(testimonial)}
                                  />
                                  <IconButton
                                    icon={<Icon as={FaTrash} />}
                                    size="sm"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={() => deleteTestimonial(testimonial._id)}
                                  />
                                </HStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Achievements Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card>
                  <CardHeader>
                    <HStack justify="space-between">
                      <Heading size="md">Achievements & Awards</Heading>
                      <Button
                        colorScheme="blue"
                        leftIcon={<Icon as={FaPlus} />}
                        onClick={addAchievement}
                      >
                        Add Achievement
                      </Button>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <TableContainer>
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Title</Th>
                            <Th>Description</Th>
                            <Th>Year</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {achievements.map((achievement) => (
                            <Tr key={achievement._id}>
                              <Td fontWeight="bold">{achievement.title}</Td>
                              <Td>{achievement.description}</Td>
                              <Td>{achievement.year}</Td>
                              <Td>
                                <HStack spacing={2}>
                                  <IconButton
                                    icon={<Icon as={FaEdit} />}
                                    size="sm"
                                    colorScheme="blue"
                                    variant="ghost"
                                    onClick={() => editAchievement(achievement)}
                                  />
                                  <IconButton
                                    icon={<Icon as={FaTrash} />}
                                    size="sm"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={() => deleteAchievement(achievement._id)}
                                  />
                                </HStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Settings Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card>
                  <CardHeader>
                    <Heading size="md">Page Settings</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4}>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Show Team Section</FormLabel>
                        <Switch
                          isChecked={settings.showTeam}
                          onChange={(e) => setSettings({...settings, showTeam: e.target.checked})}
                        />
                      </FormControl>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Show Testimonials Section</FormLabel>
                        <Switch
                          isChecked={settings.showTestimonials}
                          onChange={(e) => setSettings({...settings, showTestimonials: e.target.checked})}
                        />
                      </FormControl>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Show Achievements Section</FormLabel>
                        <Switch
                          isChecked={settings.showAchievements}
                          onChange={(e) => setSettings({...settings, showAchievements: e.target.checked})}
                        />
                      </FormControl>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Show Statistics Section</FormLabel>
                        <Switch
                          isChecked={settings.showStatistics}
                          onChange={(e) => setSettings({...settings, showStatistics: e.target.checked})}
                        />
                      </FormControl>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Enable Video Section</FormLabel>
                        <Switch
                          isChecked={settings.enableVideo}
                          onChange={(e) => setSettings({...settings, enableVideo: e.target.checked})}
                        />
                      </FormControl>
                      {settings.enableVideo && (
                        <FormControl>
                          <FormLabel>Video URL</FormLabel>
                          <Input
                            value={settings.videoUrl || ''}
                            onChange={(e) => setSettings({...settings, videoUrl: e.target.value})}
                            placeholder="https://youtube.com/watch?v=..."
                          />
                        </FormControl>
                      )}
                      <Button
                        colorScheme="blue"
                        leftIcon={<Icon as={FaSave} />}
                        onClick={saveSettings}
                        isLoading={saving}
                        loadingText="Saving..."
                      >
                        Save Settings
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Edit Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {editingItem?._id ? 'Edit' : 'Add'} {editingType.charAt(0).toUpperCase() + editingType.slice(1)}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {editingType === 'team' && (
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel>Name</FormLabel>
                    <Input
                      value={editingItem?.name || ''}
                      onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                      placeholder="Team member name"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Role</FormLabel>
                    <Input
                      value={editingItem?.role || ''}
                      onChange={(e) => setEditingItem({...editingItem, role: e.target.value})}
                      placeholder="Job title"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Experience</FormLabel>
                    <Input
                      value={editingItem?.experience || ''}
                      onChange={(e) => setEditingItem({...editingItem, experience: e.target.value})}
                      placeholder="5+ years"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Image URL</FormLabel>
                    <Input
                      value={editingItem?.image || ''}
                      onChange={(e) => setEditingItem({...editingItem, image: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Bio</FormLabel>
                    <Textarea
                      value={editingItem?.bio || ''}
                      onChange={(e) => setEditingItem({...editingItem, bio: e.target.value})}
                      placeholder="Team member bio..."
                      rows={3}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Specialties (comma-separated)</FormLabel>
                    <Input
                      value={editingItem?.specialties?.join(', ') || ''}
                      onChange={(e) => setEditingItem({...editingItem, specialties: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                      placeholder="Engine Repair, Electrical Systems, Hull Maintenance"
                    />
                  </FormControl>
                </VStack>
              )}

              {editingType === 'testimonial' && (
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel>Customer Name</FormLabel>
                    <Input
                      value={editingItem?.name || ''}
                      onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                      placeholder="Customer name"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Boat Name</FormLabel>
                    <Input
                      value={editingItem?.boat || ''}
                      onChange={(e) => setEditingItem({...editingItem, boat: e.target.value})}
                      placeholder="Boat name"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Rating</FormLabel>
                    <NumberInput
                      value={editingItem?.rating || 5}
                      onChange={(value) => setEditingItem({...editingItem, rating: parseInt(value)})}
                      min={1}
                      max={5}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Testimonial Text</FormLabel>
                    <Textarea
                      value={editingItem?.text || ''}
                      onChange={(e) => setEditingItem({...editingItem, text: e.target.value})}
                      placeholder="Customer testimonial..."
                      rows={4}
                    />
                  </FormControl>
                </VStack>
              )}

              {editingType === 'achievement' && (
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel>Achievement Title</FormLabel>
                    <Input
                      value={editingItem?.title || ''}
                      onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                      placeholder="Achievement title"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      value={editingItem?.description || ''}
                      onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                      placeholder="Achievement description..."
                      rows={3}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Icon</FormLabel>
                    <Select
                      value={editingItem?.icon || 'FaTrophy'}
                      onChange={(e) => setEditingItem({...editingItem, icon: e.target.value})}
                    >
                      <option value="FaTrophy">Trophy</option>
                      <option value="FaCertificate">Certificate</option>
                      <option value="FaMedal">Medal</option>
                      <option value="FaFlag">Flag</option>
                      <option value="FaAward">Award</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Year</FormLabel>
                    <Input
                      value={editingItem?.year || ''}
                      onChange={(e) => setEditingItem({...editingItem, year: e.target.value})}
                      placeholder="2023"
                    />
                  </FormControl>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={saveItem}
                isLoading={saving}
                loadingText="Saving..."
              >
                Save
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
};

export default AdminAboutPage;














