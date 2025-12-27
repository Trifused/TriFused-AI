import { Resend } from 'resend';

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  const connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken!
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  return connectionSettings.settings.api_key;
}

async function main() {
  const apiKey = await getCredentials();
  const client = new Resend(apiKey);
  
  // List all domains
  const domains = await client.domains.list();
  console.log('=== Resend Domains Status ===\n');
  
  if (domains.data?.data) {
    for (const domain of domains.data.data) {
      console.log(`Domain: ${domain.name}`);
      console.log(`  Status: ${domain.status}`);
      console.log(`  Region: ${domain.region}`);
      console.log(`  Created: ${domain.created_at}`);
      console.log('');
    }
  } else {
    console.log('No domains found or error:', domains.error);
  }
}

main().catch(console.error);
