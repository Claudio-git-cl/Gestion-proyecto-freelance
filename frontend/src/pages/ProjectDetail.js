import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  IconButton,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Edit,
  Delete,
  Save,
  Cancel,
  AttachMoney,
  AccessTime,
  Assignment,
  Chat,
  Person,
  Description,
  Add,
  Check,
  Close,
  ArrowBack,
  MoreVert,
  Comment,
  AttachFile
} from '@mui/icons-material';
import { format, isAfter, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  getProject, 
  updateProject, 
  deleteProject,
  addComment,
  uploadFile
} from '../redux/slices/projectSlice';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { project, loading, error } = useSelector(state => state.projects);
  const { user } = useSelector(state => state.auth);
  
  const [editMode, setEditMode] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editedProject, setEditedProject] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    status: ''
  });
  
  // Cargar proyecto
  useEffect(() => {
    dispatch(getProject(id));
  }, [dispatch, id]);
  
  // Inicializar formulario de edición cuando se carga el proyecto
  useEffect(() => {
    if (project) {
      setEditedProject({
        title: project.title || '',
        description: project.description || '',
        budget: project.budget || '',
        deadline: project.deadline ? format(new Date(project.deadline), 'yyyy-MM-dd') : '',
        status: project.status || 'proposal'
      });
    }
  }, [project]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleEditToggle = () => {
    setEditMode(!editMode);
    
    // Resetear formulario si se cancela la edición
    if (editMode) {
      setEditedProject({
        title: project.title || '',
        description: project.description || '',
        budget: project.budget || '',
        deadline: project.deadline ? format(new Date(project.deadline), 'yyyy-MM-dd') : '',
        status: project.status || 'proposal'
      });
    }
  };
  
  const handleProjectChange = (e) => {
    const { name, value } = e.target;
    setEditedProject(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleUpdateProject = () => {
    dispatch(updateProject({
      id: project.id,
      ...editedProject
    }));
    setEditMode(false);
  };
  
  const handleDeleteConfirm = () => {
    setConfirmDelete(true);
  };
  
  const handleDeleteCancel = () => {
    setConfirmDelete(false);
  };
  
  const handleDeleteProject = () => {
    dispatch(deleteProject(project.id));
    navigate('/projects');
  };
  
  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };
  
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    dispatch(addComment({
      projectId: project.id,
      text: newComment
    }));
    
    setNewComment('');
  };
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', project.id);
    
    dispatch(uploadFile(formData));
  };
  
  // Obtener el estado del proyecto en español
  const getStatusLabel = (status) => {
    switch (status) {
      case 'proposal':
        return 'Propuesta';
      case 'in_progress':
        return 'En Progreso';
      case 'review':
        return 'En Revisión';
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  };
  
  // Obtener el color del chip según el estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'proposal':
        return 'default';
      case 'in_progress':
        return 'primary';
      case 'review':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No establecida';
    return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
  };
  
  // Verificar si una fecha está próxima a vencer (menos de 7 días)
  const isDeadlineApproaching = (deadline) => {
    if (!deadline) return false;
    
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);
    
    return isAfter(deadlineDate, today) && isBefore(deadlineDate, sevenDaysFromNow);
  };
  
  // Verificar si una fecha está vencida
  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false;
    
    const deadlineDate = new Date(deadline);
    const today = new Date();
    
    return isBefore(deadlineDate, today);
  };
  
  // Verificar si el usuario es cliente
  const isClient = user && user.role === 'client';
  
  // Verificar si el usuario es el cliente del proyecto
  const isProjectClient = user && project && user.id === project.clientId;
  
  // Verificar si el usuario es el freelancer del proyecto
  const isProjectFreelancer = user && project && project.freelancerId && user.id === project.freelancerId;
  
  // Verificar si el usuario puede editar el proyecto
  const canEdit = isProjectClient || (user && user.role === 'admin');
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/projects')}
          sx={{ mb: 2 }}
        >
          Volver a Proyectos
        </Button>
        
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }
  
  if (!project) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/projects')}
          sx={{ mb: 2 }}
        >
          Volver a Proyectos
        </Button>
        
        <Alert severity="warning">
          Proyecto no encontrado
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/projects')}
          sx={{ mr: 2 }}
        >
          Volver
        </Button>
        
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          {editMode ? 'Editar Proyecto' : 'Detalles del Proyecto'}
        </Typography>
        
        {canEdit && !editMode && (
          <Box>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Edit />}
              onClick={handleEditToggle}
              sx={{ mr: 1 }}
            >
              Editar
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={handleDeleteConfirm}
            >
              Eliminar
            </Button>
          </Box>
        )}
        
        {editMode && (
          <Box>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={handleEditToggle}
              sx={{ mr: 1 }}
            >
              Cancelar
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<Save />}
              onClick={handleUpdateProject}
            >
              Guardar
            </Button>
          </Box>
        )}
      </Box>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        {!editMode ? (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Chip
                  label={getStatusLabel(project.status)}
                  color={getStatusColor(project.status)}
                  sx={{ mr: 2 }}
                />
                
                {isDeadlinePassed(project.deadline) && project.status !== 'completed' && project.status !== 'cancelled' && (
                  <Chip
                    label="Vencido"
                    color="error"
                    size="small"
                    icon={<Close />}
                  />
                )}
                
                {isDeadlineApproaching(project.deadline) && !isDeadlinePassed(project.deadline) && project.status !== 'completed' && project.status !== 'cancelled' && (
                  <Chip
                    label="Próximo a vencer"
                    color="warning"
                    size="small"
                  />
                )}
              </Box>
              
              <Typography variant="h5" gutterBottom>
                {project.title}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Descripción
              </Typography>
              <Typography variant="body1" paragraph>
                {project.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AttachMoney sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      <strong>Presupuesto:</strong> {project.budget ? `$${project.budget}` : 'No definido'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography 
                      variant="body1"
                      color={
                        isDeadlinePassed(project.deadline) && project.status !== 'completed' && project.status !== 'cancelled'
                          ? 'error.main'
                          : 'text.primary'
                      }
                    >
                      <strong>Fecha límite:</strong> {formatDate(project.deadline)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Assignment sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      <strong>Creado:</strong> {formatDate(project.createdAt)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Edit sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      <strong>Actualizado:</strong> {formatDate(project.updatedAt)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Participantes
                </Typography>
                
                <List>
                  {project.client && (
                    <ListItem>
                      <ListItemIcon>
                        <Avatar>
                          {project.client.name.charAt(0)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={project.client.name}
                        secondary="Cliente"
                      />
                    </ListItem>
                  )}
                  
                  {project.freelancer ? (
                    <ListItem>
                      <ListItemIcon>
                        <Avatar>
                          {project.freelancer.name.charAt(0)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={project.freelancer.name}
                        secondary="Freelancer"
                      />
                    </ListItem>
                  ) : (
                    <ListItem>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'grey.300' }}>
                          <Person color="action" />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary="Sin asignar"
                        secondary="Freelancer"
                      />
                      {isProjectClient && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Add />}
                        >
                          Asignar
                        </Button>
                      )}
                    </ListItem>
                  )}
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Chat />}
                  sx={{ mb: 1 }}
                >
                  Enviar Mensaje
                </Button>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título del Proyecto"
                name="title"
                value={editedProject.title}
                onChange={handleProjectChange}
                required
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Descripción"
                name="description"
                value={editedProject.description}
                onChange={handleProjectChange}
                multiline
                rows={4}
                required
                sx={{ mb: 2 }}
              />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Presupuesto ($)"
                    name="budget"
                    type="number"
                    value={editedProject.budget}
                    onChange={handleProjectChange}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Fecha Límite"
                    name="deadline"
                    type="date"
                    value={editedProject.deadline}
                    onChange={handleProjectChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="status-label">Estado</InputLabel>
                    <Select
                      labelId="status-label"
                      name="status"
                      value={editedProject.status}
                      onChange={handleProjectChange}
                      label="Estado"
                    >
                      <MenuItem value="proposal">Propuesta</MenuItem>
                      <MenuItem value="in_progress">En Progreso</MenuItem>
                      <MenuItem value="review">En Revisión</MenuItem>
                      <MenuItem value="completed">Completado</MenuItem>
                      <MenuItem value="cancelled">Cancelado</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Paper>
      
      <Box sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Comentarios" icon={<Comment />} iconPosition="start" />
          <Tab label="Archivos" icon={<AttachFile />} iconPosition="start" />
        </Tabs>
      </Box>
      
      <Paper sx={{ p: 3 }}>
        {tabValue === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Comentarios
            </Typography>
            
            {project.comments && project.comments.length > 0 ? (
              <List>
                {project.comments.map(comment => (
                  <ListItem key={comment.id} alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar>
                        {comment.user.name.charAt(0)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle2">
                            {comment.user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(comment.createdAt)} {format(new Date(comment.createdAt), 'HH:mm')}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          color="text.primary"
                          sx={{ mt: 1 }}
                        >
                          {comment.text}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
                No hay comentarios aún. Sé el primero en comentar.
              </Typography>
            )}
            
            <Box sx={{ mt: 3, display: 'flex' }}>
              <TextField
                fullWidth
                placeholder="Escribe un comentario..."
                value={newComment}
                onChange={handleCommentChange}
                multiline
                rows={2}
                sx={{ mr: 2 }}
              />
              <Button
                variant="contained"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                Comentar
              </Button>
            </Box>
          </Box>
        )}
        
        {tabValue === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Archivos
            </Typography>
            
            {project.files && project.files.length > 0 ? (
              <List>
                {project.files.map(file => (
                  <ListItem key={file.id} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Description />
                    </ListItemIcon>
                    <ListItemText
                      primary={file.name}
                      secondary={`Subido por ${file.uploadedBy.name} el ${formatDate(file.createdAt)}`}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Descargar
                    </Button>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
                No hay archivos adjuntos a este proyecto.
              </Typography>
            )}
            
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                component="label"
                startIcon={<AttachFile />}
              >
                Subir Archivo
                <input
                  type="file"
                  hidden
                  onChange={handleFileUpload}
                />
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
      
      {/* Diálogo de confirmación para eliminar proyecto */}
      <Dialog
        open={confirmDelete}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancelar</Button>
          <Button onClick={handleDeleteProject} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectDetail;