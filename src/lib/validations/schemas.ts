import { z } from 'zod';

export const UserRoleSchema = z.enum(['admin', 'member']);

export const UserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  image: z.string().optional(),
});

export const ProjectSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
});

export const MembershipSchema = z.object({
  userId: z.string(), // Mongoose ObjectId string
  projectId: z.string(), // Mongoose ObjectId string
  role: UserRoleSchema,
});

export const ProductInstanceSchema = z.object({
  projectId: z.string(),
  productType: z.string(), // e.g., 'ai-assistant'
  activeIntegrations: z.array(z.string()), // e.g., ['shopify', 'crm']
});

export const ConversationSchema = z.object({
  projectId: z.string(),
  productInstanceId: z.string(),
  title: z.string().optional(),
});

export const MessageSchema = z.object({
  conversationId: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
});

const WidgetSchema = z.object({
  type: z.string(),
  label: z.string(),
  dataKey: z.string(),
  order: z.number(),
});

const SectionSchema = z.object({
  title: z.string(),
  widgets: z.array(WidgetSchema),
});

const NavItemSchema = z.object({
  label: z.string(),
  path: z.string(),
  icon: z.string().optional(),
  order: z.number(),
});

export const DashboardConfigSchema = z.object({
  projectId: z.string(),
  navItems: z.array(NavItemSchema).optional(),
  sections: z.array(SectionSchema),
});

// Inferred Types
export type User = z.infer<typeof UserSchema> & { _id: string };
export type Project = z.infer<typeof ProjectSchema> & { _id: string };
export type Membership = z.infer<typeof MembershipSchema> & { _id: string };
export type ProductInstance = z.infer<typeof ProductInstanceSchema> & { _id: string };
export type Conversation = z.infer<typeof ConversationSchema> & { _id: string };
export type Message = z.infer<typeof MessageSchema> & { _id: string };
export type DashboardConfig = z.infer<typeof DashboardConfigSchema> & { _id: string };
