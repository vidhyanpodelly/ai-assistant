import mongoose, { Schema, Document } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
}, { timestamps: true });

const ProjectSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
}, { timestamps: true });

const MembershipSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  role: { type: String, enum: ['admin', 'member'], required: true },
}, { timestamps: true });

const ProductInstanceSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  productType: { type: String, required: true },
  activeIntegrations: [{ type: String }],
}, { timestamps: true });

const ConversationSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  productInstanceId: { type: Schema.Types.ObjectId, ref: 'ProductInstance', required: true },
  title: { type: String },
}, { timestamps: true });

const MessageSchema = new Schema({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
}, { timestamps: true });

const DashboardConfigSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  navItems: [{
    label: { type: String, required: true },
    path: { type: String, required: true },
    icon: { type: String },
    order: { type: Number, required: true },
  }],
  sections: [{
    title: { type: String, required: true },
    widgets: [{
      type: { type: String, required: true },
      label: { type: String, required: true },
      dataKey: { type: String, required: true },
      order: { type: Number, required: true },
    }]
  }]
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
export const Membership = mongoose.models.Membership || mongoose.model('Membership', MembershipSchema);
export const ProductInstance = mongoose.models.ProductInstance || mongoose.model('ProductInstance', ProductInstanceSchema);
export const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
export const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
export const DashboardConfig = mongoose.models.DashboardConfig || mongoose.model('DashboardConfig', DashboardConfigSchema);
