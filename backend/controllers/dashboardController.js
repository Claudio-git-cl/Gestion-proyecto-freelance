const TimeEntry = require('../models/TimeEntry');
const Invoice = require('../models/Invoice');
const Project = require('../models/Project');
const Client = require('../models/Client');
const { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, format } = require('date-fns');

// Obtener resumen del dashboard
exports.getSummary = async (req, res) => {
  try {
    const now = new Date();
    
    // Inicio y fin de la semana actual
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    
    // Inicio y fin del mes actual
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    // Horas de la semana actual
    const weeklyHours = await TimeEntry.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: weekStart, $lte: weekEnd }
        }
      },
      {
        $group: {
          _id: null,
          totalHours: { $sum: '$duration' }
        }
      }
    ]);
    
    // Facturas pendientes
    const pendingInvoices = await Invoice.countDocuments({
      user: req.user._id,
      status: { $in: ['draft', 'sent', 'overdue'] }
    });
    
    // Total por cobrar
    const pendingAmount = await Invoice.aggregate([
      {
        $match: {
          user: req.user._id,
          status: { $in: ['draft', 'sent', 'overdue'] }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$total' }
        }
      }
    ]);
    
    // Proyectos activos
    const activeProjects = await Project.countDocuments({
      user: req.user._id,
      status: 'in_progress'
    });
    
    // Clientes activos
    const activeClients = await Client.countDocuments({
      user: req.user._id,
      active: true
    });
    
    // Ingresos del mes actual
    const monthlyEarnings = await Invoice.aggregate([
      {
        $match: {
          user: req.user._id,
          status: 'paid',
          issueDate: { $gte: monthStart, $lte: monthEnd }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$total' }
        }
      }
    ]);
    
    // Proyectos recientes
    const recentProjects = await Project.find({
      user: req.user._id
    })
    .sort({ updatedAt: -1 })
    .limit(5)
    .populate('client', 'name');
    
    res.json({
      stats: {
        hoursThisWeek: weeklyHours.length > 0 ? weeklyHours[0].totalHours : 0,
        pendingInvoices,
        totalEarnings: pendingAmount.length > 0 ? pendingAmount[0].totalAmount : 0,
        activeProjects,
        activeClients,
        monthlyEarnings: monthlyEarnings.length > 0 ? monthlyEarnings[0].totalAmount : 0
      },
      recentProjects: recentProjects.map(project => ({
        id: project._id,
        name: project.name,
        client: project.client ? project.client.name : 'Sin cliente',
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate
      }))
    });
  } catch (error) {
    console.error('Error al obtener resumen del dashboard:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener tiempo por proyecto
exports.getTimeByProject = async (req, res) => {
  try {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    const timeByProject = await TimeEntry.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: monthStart, $lte: monthEnd }
        }
      },
      {
        $group: {
          _id: '$project',
          hours: { $sum: '$duration' }
        }
      },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: '_id',
          as: 'projectInfo'
        }
      },
      {
        $unwind: '$projectInfo'
      },
      {
        $project: {
          _id: 0,
          name: '$projectInfo.name',
          hours: 1
        }
      }
    ]);
    
    res.json(timeByProject);
  } catch (error) {
    console.error('Error al obtener tiempo por proyecto:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener ingresos por mes
exports.getEarningsByMonth = async (req, res) => {
  try {
    const now = new Date();
    const months = [];
    
    // Obtener los últimos 6 meses
    for (let i = 0; i < 6; i++) {
      const date = subMonths(now, i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      months.push({
        start: monthStart,
        end: monthEnd,
        name: format(date, 'MMM')
      });
    }
    
    // Invertir para que queden en orden cronológico
    months.reverse();
    
    const earningsByMonth = [];
    
    // Obtener ingresos para cada mes
    for (const month of months) {
      const earnings = await Invoice.aggregate([
        {
          $match: {
            user: req.user._id,
            status: 'paid',
            issueDate: { $gte: month.start, $lte: month.end }
          }
        },
        {
          $group: {
            _id: null,
            amount: { $sum: '$total' }
          }
        }
      ]);
      
      earningsByMonth.push({
        month: month.name,
        amount: earnings.length > 0 ? earnings[0].amount : 0
      });
    }
    
    res.json(earningsByMonth);
  } catch (error) {
    console.error('Error al obtener ingresos por mes:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

const Project = require('../models/Project');
const Client = require('../models/Client');
const TimeEntry = require('../models/TimeEntry');
const Invoice = require('../models/Invoice');
const mongoose = require('mongoose');

// Get dashboard data
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get counts
    const projectsCount = await Project.countDocuments({ createdBy: userId });
    const clientsCount = await Client.countDocuments({ createdBy: userId });
    const timeEntriesCount = await TimeEntry.countDocuments({ createdBy: userId });
    const invoicesCount = await Invoice.countDocuments({ createdBy: userId });
    
    // Get recent projects (last 5)
    const recentProjects = await Project.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('client', 'name');
    
    // Get upcoming deadlines (projects with deadlines in the next 30 days)
    const upcomingDeadlines = await Project.find({
      createdBy: userId,
      deadline: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      },
      status: { $ne: 'completed' }
    })
      .sort({ deadline: 1 })
      .populate('client', 'name');
    
    // Get unpaid invoices
    const unpaidInvoices = await Invoice.find({
      createdBy: userId,
      status: { $in: ['pending', 'overdue'] }
    })
      .sort({ dueDate: 1 })
      .populate('client', 'name')
      .populate('project', 'name');
    
    // Calculate total unpaid amount
    const unpaidAmount = unpaidInvoices.reduce((total, invoice) => total + invoice.total, 0);
    
    // Calculate total paid amount this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);
    
    const paidInvoicesThisMonth = await Invoice.find({
      createdBy: userId,
      status: 'paid',
      paymentDate: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    });
    
    const paidAmountThisMonth = paidInvoicesThisMonth.reduce((total, invoice) => total + invoice.total, 0);
    
    // Get time tracked this week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date();
    endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);
    
    const timeEntriesThisWeek = await TimeEntry.find({
      createdBy: userId,
      date: {
        $gte: startOfWeek,
        $lte: endOfWeek
      }
    });
    
    const hoursTrackedThisWeek = timeEntriesThisWeek.reduce((total, entry) => total + entry.hours, 0);
    
    // Get monthly revenue for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);
    
    const monthlyRevenue = await Invoice.aggregate([
      {
        $match: {
          createdBy: mongoose.Types.ObjectId(userId),
          status: 'paid',
          paymentDate: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' }
          },
          total: { $sum: '$total' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Format monthly revenue for chart
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const revenueData = [];
    
    // Initialize with zeros for all months
    const today = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(today.getMonth() - 5 + i);
      
      revenueData.push({
        month: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
        revenue: 0
      });
    }
    
    // Fill in actual data
    monthlyRevenue.forEach(item => {
      const monthIndex = item._id.month - 1;
      const year = item._id.year;
      const monthStr = `${monthNames[monthIndex]} ${year}`;
      
      const existingIndex = revenueData.findIndex(d => d.month === monthStr);
      if (existingIndex !== -1) {
        revenueData[existingIndex].revenue = item.total;
      }
    });
    
    // Get time tracked by project for the current month
    const timeByProject = await TimeEntry.aggregate([
      {
        $match: {
          createdBy: mongoose.Types.ObjectId(userId),
          date: {
            $gte: startOfMonth,
            $lte: endOfMonth
          }
        }
      },
      {
        $group: {
          _id: '$project',
          hours: { $sum: '$hours' }
        }
      },
      {
        $sort: { hours: -1 }
      },
      {
        $limit: 5
      }
    ]);
    
    // Get project details for the time tracked
    const projectIds = timeByProject.map(item => item._id);
    const projectDetails = await Project.find({
      _id: { $in: projectIds }
    }, 'name');
    
    // Format time by project for chart
    const timeByProjectData = timeByProject.map(item => {
      const project = projectDetails.find(p => p._id.toString() === item._id.toString());
      return {
        project: project ? project.name : 'Proyecto desconocido',
        hours: item.hours
      };
    });
    
    // Return all dashboard data
    res.status(200).json({
      counts: {
        projects: projectsCount,
        clients: clientsCount,
        timeEntries: timeEntriesCount,
        invoices: invoicesCount
      },
      financial: {
        unpaidAmount,
        paidAmountThisMonth,
        hoursTrackedThisWeek
      },
      recentProjects,
      upcomingDeadlines,
      unpaidInvoices,
      charts: {
        monthlyRevenue: revenueData,
        timeByProject: timeByProjectData
      }
    });
    
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    res.status(500).json({ message: 'Error al obtener los datos del dashboard' });
  }
};