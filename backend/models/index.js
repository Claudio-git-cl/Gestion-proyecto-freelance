const User = require('./User');
const Project = require('./Project');
const Message = require('./Message');
const TimeTracking = require('./TimeTracking');

// Relaciones entre User y Project
User.hasMany(Project, { foreignKey: 'clientId', as: 'clientProjects' });
User.hasMany(Project, { foreignKey: 'freelancerId', as: 'freelancerProjects' });
Project.belongsTo(User, { foreignKey: 'clientId', as: 'client' });
Project.belongsTo(User, { foreignKey: 'freelancerId', as: 'freelancer' });

// Relaciones para Message
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Project.hasMany(Message, { foreignKey: 'projectId' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });
Message.belongsTo(Project, { foreignKey: 'projectId' });

// Relaciones para TimeTracking
User.hasMany(TimeTracking, { foreignKey: 'userId' });
Project.hasMany(TimeTracking, { foreignKey: 'projectId' });
TimeTracking.belongsTo(User, { foreignKey: 'userId' });
TimeTracking.belongsTo(Project, { foreignKey: 'projectId' });

module.exports = {
  User,
  Project,
  Message,
  TimeTracking
};