import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Chip,
  Button,
  Divider,
  Paper,
  TextField,
  InputAdornment,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Search as SearchIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useDispatch } from 'react-redux';
import { updateTask } from '../../redux/slices/taskSlice';

const TaskList = ({ tasks = [], project, onEdit, onDelete }) => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleOpenMenu = (event, taskId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedTaskId(taskId);
  };
  
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setSelectedTaskId(null);
  };
  
  const handleToggleComplete = (task) => {
    const updatedTask = {
      ...task,
      status: task.status === 'completed' ? 'active' : 'completed'
    };
    
    dispatch(updateTask({
      taskId: task.id,
      taskData: updatedTask
    }));
  };
  
  const handleAddTask = () => {
    if (newTaskName.trim()) {
      // Aquí iría la lógica para añadir una nueva tarea
      setNewTaskName('');
      setShowAddTask(false);
    }
  };
  
  const filteredTasks = tasks.filter(task => 
    task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };
  
  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return 'Normal';
    }
  };
  
  if (!tasks || tasks.length === 0 && !showAddTask) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <AssignmentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No hay tareas
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Añade tareas para organizar tu trabajo en este proyecto
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddTask(true)}
        >
          Añadir Tarea
        </Button>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <TextField
          placeholder="Buscar tareas..."
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1, mr: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddTask(true)}
        >
          Añadir Tarea
        </Button>
      </Box>
      
      {showAddTask && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Nueva Tarea
          </Typography>
          <TextField
            fullWidth
            placeholder="Nombre de la tarea"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              sx={{ mr: 1 }}
              onClick={() => {
                setShowAddTask(false);
                setNewTaskName('');
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleAddTask}
              disabled={!newTaskName.trim()}
            >
              Guardar
            </Button>
          </Box>
        </Paper>
      )}
      
      {filteredTasks.length === 0 && !showAddTask ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          No se encontraron tareas con "{searchTerm}"
        </Typography>
      ) : (
        <List sx={{ bgcolor: 'background.paper' }} component={Paper} variant="outlined">
          {filteredTasks.map((task, index) => (
            <React.Fragment key={task.id}>
              {index > 0 && <Divider component="li" />}
              <ListItem
                sx={{
                  textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                  color: task.status === 'completed' ? 'text.secondary' : 'text.primary'
                }}
              >
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={task.status === 'completed'}
                    onChange={() => handleToggleComplete(task)}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={task.name}
                  secondary={
                    <React.Fragment>
                      {task.description && (
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{ display: 'block' }}
                        >
                          {task.description}
                        </Typography>
                      )}
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {task.dueDate && (
                          <Chip
                            size="small"
                            label={`Vence: ${format(new Date(task.dueDate), 'dd MMM', { locale: es })}`}
                            color={new Date(task.dueDate) < new Date() && task.status !== 'completed' ? 'error' : 'default'}
                          />
                        )}
                        {task.priority && (
                          <Chip
                            size="small"
                            label={`Prioridad: ${getPriorityLabel(task.priority)}`}
                            color={getPriorityColor(task.priority)}
                          />
                        )}
                      </Box>
                    </React.Fragment>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={(e) => handleOpenMenu(e, task.id)}>
                    <MoreIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      )}
      
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => {
          const task = tasks.find(t => t.id === selectedTaskId);
          if (task) {
            handleToggleComplete(task);
            handleCloseMenu();
          }
        }}>
          {tasks.find(t => t.id === selectedTaskId)?.status === 'completed' ? 'Marcar como pendiente' : 'Marcar como completada'}
        </MenuItem>
        <MenuItem onClick={() => {
          onEdit(tasks.find(t => t.id === selectedTaskId));
          handleCloseMenu();
        }}>
          Editar
        </MenuItem>
        <MenuItem onClick={() => {
          onDelete(selectedTaskId);
          handleCloseMenu();
        }} sx={{ color: 'error.main' }}>
          Eliminar
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TaskList;