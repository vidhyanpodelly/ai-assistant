import 'dotenv/config';
import mongoose from 'mongoose';
import { User, Project, Membership, ProductInstance, Conversation, Message, DashboardConfig } from '../src/db/models';

async function seed() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Wipe data
  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Membership.deleteMany({}),
    ProductInstance.deleteMany({}),
    Conversation.deleteMany({}),
    Message.deleteMany({}),
    DashboardConfig.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // Create Users
  const adminUser = await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
  });
  const memberUser = await User.create({
    name: 'Member User',
    email: 'member@example.com',
  });

  // Create Projects
  const projectAcme = await Project.create({
    name: 'Acme Corp',
    slug: 'acme',
  });
  const projectGlobex = await Project.create({
    name: 'Globex Corp',
    slug: 'globex',
  });

  // Create Memberships
  await Membership.create([
    { userId: adminUser._id, projectId: projectAcme._id, role: 'admin' },
    { userId: memberUser._id, projectId: projectAcme._id, role: 'member' },
    // Admin also has access to Globex for demo purposes
    { userId: adminUser._id, projectId: projectGlobex._id, role: 'admin' },
  ]);

  // Create Product Instances
  const aiAssistantAcme = await ProductInstance.create({
    projectId: projectAcme._id,
    productType: 'ai-assistant',
    activeIntegrations: ['shopify', 'crm'],
  });

  // Create Dashboard Configs
  await DashboardConfig.create([
    {
      projectId: projectAcme._id,
      navItems: [
        { label: 'Chat', path: `/projects/${projectAcme.slug}/chat`, order: 1 },
        { label: 'Admin', path: `/projects/${projectAcme.slug}/admin`, order: 2 },
      ],
      sections: [
        {
          title: 'Overview',
          widgets: [
            { type: 'stats-card', label: 'Total Sales', dataKey: 'total_sales', order: 1 },
            { type: 'stats-card', label: 'Active Users', dataKey: 'active_users', order: 2 },
          ],
        },
        {
          title: 'Activity',
          widgets: [
            { type: 'activity-log', label: 'Recent Chats', dataKey: 'recent_chats', order: 1 },
          ],
        },
      ],
    },
    {
      projectId: projectGlobex._id,
      navItems: [
        { label: 'Chat', path: `/projects/${projectGlobex.slug}/chat`, order: 1 },
        { label: 'Admin', path: `/projects/${projectGlobex.slug}/admin`, order: 2 },
      ],
      sections: [
        {
          title: 'Analytics',
          widgets: [
            { type: 'stats-card', label: 'Conversion Rate', dataKey: 'conversion_rate', order: 1 },
          ],
        },
      ],
    },
  ]);

  // Create a sample conversation
  const conversation = await Conversation.create({
    projectId: projectAcme._id,
    productInstanceId: aiAssistantAcme._id,
    title: 'Initial Greeting',
  });

  await Message.create([
    { conversationId: conversation._id, role: 'user', content: 'Hello!' },
    { conversationId: conversation._id, role: 'assistant', content: 'Hi! How can I help you today?' },
  ]);

  console.log('Seed completed successfully');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
