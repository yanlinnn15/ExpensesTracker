import React, { useEffect, useState } from 'react';
import { Typography, IconButton, Menu, MenuItem, Divider, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Box } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import { Container, Stack,  
          Card,
          CardContent,
          Grid,
          Avatar } from "@mui/material";
import { IconPencil, IconPlus, IconTrash, IconDotsVertical } from "@tabler/icons-react";
import DashboardCard from '../../components/shared/DashboardCard';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as TablerIcons from "@tabler/icons-react"; 
import EditCate from './editcate';
import AddCate from './addcate';
import DeleteCate from './dltcate';
import { showToast } from '../../helpers/showtoast';
import API_URL from '../../config/api';

const renderIcon = (iconName) => {
    const IconComponent = TablerIcons[iconName]; 
    return IconComponent ? <IconComponent /> : <TablerIcons.IconHelp />; 
};

const Categories = () => {

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [cateIncome, setCateIncome] = useState([]);
    const [cateExpense, setCateExpense] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedCateId, setSelectedCateId] = useState(null);
    const [selectedCate, setSelectedCate] = useState(null);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openDeleteDialog, setDeleteDialogOpen] = useState(false);
    const [selectedType, setSelectedType] = useState("")


    let navigator = useNavigate();

    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          navigator('/auth/login');
          return;
        }
        axios.get(`${API_URL}/cate/viewAll`, {
            headers: { accessToken },
          })
          .then((response) => {
            if (response.data) {
              setCateIncome(response.data.cateincome);
              setCateExpense(response.data.cateexpense);
            }
          })
          .catch((error) => {
            setErrorMsg(error.message);
          });
      }, [navigator]);

      const handleCateAdded = (newCate) => {
        axios.get(`${API_URL}/cate/viewAll`, {
            headers: {
                accessToken: localStorage.getItem("accessToken"),
            }
        })
        .then((response) => {
            if (response.data) {
              setCateIncome(response.data.cateincome);
              setCateExpense(response.data.cateexpense);
              showToast('Successful!');
            }
        })
        .catch((error) => {
            if (error.response) {
                setErrorMsg(error.response.data.message);
            } else {
                setErrorMsg("Server Error");
            }
        });
    };

  const handleMenuOpen = (event, index, type) => {
    setAnchorEl(event.currentTarget);
    setSelectedIndex(index);
    setSelectedType(type);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedIndex(null);
    setSelectedType(null);
  };

  const handleEditClick = (id, cate) => {
    setSelectedCate(cate);
    setSelectedCateId(id);
    handleMenuClose(true);
    setOpenEditModal(true); 
  };

  const handleAddClick = () => {
    setOpenAddModal(true); 
  };

  const handleDeleteClick = (id) => {
    setSelectedCateId(id);
    handleMenuClose(true);
    setDeleteDialogOpen(true);
};

  const handleDelete = (id) => {
    setCateIncome(cateIncome.filter((item) => item.id !== id)); 
    setCateExpense(cateExpense.filter((item) => item.id !== id)); 
    handleMenuClose();
    showToast('Delete Successful!');
  };
  return (
      <PageContainer 
        title="Category" 
        description="Category Page" 
        sx={{ 
          background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
          minHeight: '100vh'
        }}
      >
        <DashboardCard title="Categories" sx={{ backgroundColor: 'transparent' }}>
          <Container>
            <Stack direction="row" justifyContent="flex-end" mb={4}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleAddClick()}
                startIcon={<IconPlus size="20" />}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  boxShadow: 3,
                  '&:hover': {
                    boxShadow: 4,
                  }
                }}
              >
                New Category
              </Button>
            </Stack>

            {/* Income Categories Section */}
            <Card 
              variant="outlined" 
              sx={{ 
                mb: 4, 
                borderRadius: '16px',
                border: '1px solid rgba(33, 150, 243, 0.1)'
              }}
            >
              <CardContent>
                <Typography 
                  variant="h6"  
                  gutterBottom
                  sx={{ 
                    color: '#1976D2',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    '&::before': {
                      content: '""',
                      width: '4px',
                      height: '24px',
                      backgroundColor: '#1976D2',
                      marginRight: '12px',
                      borderRadius: '4px'
                    }
                  }}
                >
                  Income Categories
                </Typography>
                <Box mt={2}></Box>
                <Grid container spacing={2}>
                  {cateIncome.map((category, key) => (
                    <Grid item xs={12} sm={6} md={3} key={key}>
                      <Card 
                        variant="outlined"
                        sx={{ 
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 4px 20px rgba(33, 150, 243, 0.2)',
                          },
                          borderRadius: '12px',
                          border: '1px solid rgba(33, 150, 243, 0.2)'
                        }}
                      >
                        <CardContent sx={{ position: 'relative', padding: '16px !important' }}>
                          {/* Menu Button */}
                          <IconButton
                            sx={{ 
                              position: 'absolute', 
                              top: 8, 
                              right: 8,
                              '&:hover': {
                                backgroundColor: 'rgba(33, 150, 243, 0.1)'
                              }
                            }}
                            aria-label="settings"
                            onClick={(e) => {
                              setAnchorEl(e.currentTarget);
                              setSelectedCategory(category); // Set selected category info
                            }}
                          >
                            <IconDotsVertical />
                          </IconButton>

                          <Avatar 
                            sx={{ 
                              margin: '0 auto 12px',
                              backgroundColor: 'rgba(33, 150, 243, 0.1)',
                              color: '#1976D2',
                              width: 56,
                              height: 56
                            }}
                          >
                            {renderIcon(category.Icon.icon_class)}
                          </Avatar>
                          <Typography 
                            variant="subtitle1" 
                            align="center"
                            sx={{ 
                              fontWeight: 500,
                              color: '#1976D2'
                            }}
                          >
                            {category.name}
                          </Typography>

                          {/* Menu */}
                          <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            anchorOrigin={{
                              vertical: 'bottom',
                              horizontal: 'right',
                            }}
                            transformOrigin={{
                              vertical: 'top',
                              horizontal: 'right',
                            }}
                            PaperProps={{
                              elevation: 3,
                              sx: {
                                minWidth: 150,
                                borderRadius: '8px',
                                '& .MuiMenuItem-root': {
                                  px: 2,
                                  py: 1,
                                  borderRadius: '4px',
                                  mx: 1,
                                  my: 0.5,
                                }
                              }
                            }}
                          >
                            <MenuItem 
                              onClick={() => handleEditClick(selectedCategory.id, selectedCategory)} 
                              sx={{
                                '&:hover': {
                                  backgroundColor: 'rgba(33, 150, 243,  0.1)',
                                }
                              }}
                            >
                              <IconPencil size={18} style={{ marginRight: 8 }} />
                              Edit
                            </MenuItem>
                            <MenuItem 
                              onClick={() => handleDeleteClick(selectedCategory)} // Pass selected category info
                              sx={{ 
                                color: 'error.main',
                                '&:hover': {
                                  backgroundColor: 'rgba(40, 53, 147, 0.1)',
                                }
                              }}
                            >
                              <IconTrash size={18} style={{ marginRight: 8 }} />
                              Delete
                            </MenuItem>
                          </Menu>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Expense Categories Section */}
            <Card 
              variant="outlined" 
              sx={{ 
                mb: 4, 
                borderRadius: '16px',
                border: '1px solid rgba(40, 53, 147, 0.1)'
              }}
            >
              <CardContent>
                <Typography 
                  variant="h6"  
                  gutterBottom
                  sx={{ 
                    color: '#283593',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    '&::before': {
                      content: '""',
                      width: '4px',
                      height: '24px',
                      backgroundColor: '#283593',
                      marginRight: '12px',
                      borderRadius: '4px'
                    }
                  }}
                >
                  Expense Categories
                </Typography>
                <Box mt={2}></Box>
                <Grid container spacing={2}>
                  {cateExpense.map((category, key) => (
                    <Grid item xs={12} sm={6} md={3} key={key}>
                      <Card 
                        variant="outlined"
                        sx={{ 
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 4px 20px rgba(40, 53, 147, 0.2)',
                          },
                          borderRadius: '12px',
                          border: '1px solid rgba(40, 53, 147, 0.2)'
                        }}
                      >
                        <CardContent sx={{ position: 'relative', padding: '16px !important' }}>
                          {/* Menu Button */}
                          <IconButton
                            sx={{ 
                              position: 'absolute', 
                              top: 8, 
                              right: 8,
                              '&:hover': {
                                backgroundColor: 'rgba(40, 53, 147, 0.1)'
                              }
                            }}
                            aria-label="settings"
                            onClick={(e) => {
                              setAnchorEl(e.currentTarget);
                              setSelectedCategory(category);
                            }}
                          >
                            <IconDotsVertical />
                          </IconButton>

                          <Avatar 
                            sx={{ 
                              margin: '0 auto 12px',
                              backgroundColor: 'rgba(40, 53, 147, 0.1)',
                              color: '#283593',
                              width: 56,
                              height: 56
                            }}
                          >
                            {renderIcon(category.Icon.icon_class)}
                          </Avatar>
                          <Typography 
                            variant="subtitle1" 
                            align="center"
                            sx={{ 
                              fontWeight: 500,
                              color: '#283593'
                            }}
                          >
                            {category.name}
                          </Typography>

                          {/* Menu */}
                          <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            anchorOrigin={{
                              vertical: 'bottom',
                              horizontal: 'right',
                            }}
                            transformOrigin={{
                              vertical: 'top',
                              horizontal: 'right',
                            }}
                            PaperProps={{
                              elevation: 3,
                              sx: {
                                minWidth: 150,
                                borderRadius: '8px',
                                '& .MuiMenuItem-root': {
                                  px: 2,
                                  py: 1,
                                  borderRadius: '4px',
                                  mx: 1,
                                  my: 0.5,
                                }
                              }
                            }}
                          >
                            <MenuItem 
                              onClick={() => handleEditClick(selectedCategory.id, selectedCategory)}  
                              sx={{
                                '&:hover': {
                                  backgroundColor: 'rgba(40, 53, 147,  0.1)',
                                }
                              }}
                            >
                              <IconPencil size={18} style={{ marginRight: 8 }} />
                              Edit
                            </MenuItem>
                            <MenuItem 
                              onClick={() => handleDeleteClick(selectedCategory.id)} // Pass selected category info
                              sx={{ 
                                color: 'error.main',
                                '&:hover': {
                                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                }
                              }}
                            >
                              <IconTrash size={18} style={{ marginRight: 8 }} />
                              Delete
                            </MenuItem>
                          </Menu>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>

              <EditCate 
                  open={openEditModal} 
                  onClose={() => setOpenEditModal(false)} 
                  onCateAdded={handleCateAdded} 
                  CateId={selectedCateId} 
                  cate={selectedCate}
              />

            <AddCate 
                  open={openAddModal} 
                  onClose={() => setOpenAddModal(false)} 
                  onCateAdded={handleCateAdded} 
              />
            
            <DeleteCate
                  open={openDeleteDialog} 
                  onClose={() => setDeleteDialogOpen(false)} 
                  onCateDeleted={handleDelete} 
                  CateId={selectedCateId} 
              />
            </Card>
          </Container>
        </DashboardCard>
      </PageContainer>
  );
};

export default Categories;