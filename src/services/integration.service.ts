import dbConnect from '@/db/mongoose';
import { ProductInstance } from '@/db/models';

/**
 * Simulates fetching data from external integrations.
 * Returns both the context for the LLM and the steps for the UI.
 */
export async function getIntegrationContext(projectId: string, instanceId: string) {
  await dbConnect();
  
  // Try to find the instance, fallback to a default if 'default' string is passed
  let instance = await ProductInstance.findOne({ _id: instanceId, projectId });
  if (!instance && instanceId === 'default') {
    instance = await ProductInstance.findOne({ projectId });
  }

  const contextParts: string[] = [];
  const steps: string[] = [];

  if (!instance) {
    return { context: "No active integrations.", steps: ["No integrations configured."] };
  }

  // Simulate Shopify data
  if (instance.activeIntegrations.includes('shopify')) {
    steps.push('Establishing secure tunnel to Shopify GraphQL API...');
    contextParts.push(`
      SHOPIFY CONTEXT:
      - Active Orders: 4
      - Most Popular: "Quantum Mouse" (Stock: 12)
      - Revenue (MTD): $1,420.50
    `);
    steps.push('Inventory and fulfillment data synchronized.');
  }

  // Simulate CRM data
  if (instance.activeIntegrations.includes('crm')) {
    steps.push('Querying CRM lead database...');
    contextParts.push(`
      CRM CONTEXT:
      - Top Client: "Acme Corp"
      - Open Leads: 12
      - Average Deal Size: $5,000
    `);
    steps.push('Customer relationship context extracted.');
  }

  steps.push('Aggregating cross-platform intelligence...');

  return {
    context: contextParts.join('\n\n'),
    steps,
  };
}
