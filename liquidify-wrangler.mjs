import fs from 'fs';
import process from 'process';
import { Liquid } from 'liquidjs';

const engine = new Liquid();

async function liquidifyWranglerConfiguration() {
  try {
    // Read template file
    const template = fs.readFileSync('wrangler.toml.template', 'utf-8');

    // Render template with environment variables
    const rendered = await engine.parseAndRender(template, process.env);

    // Write rendered output to wrangler.toml
    fs.writeFileSync('wrangler.toml', rendered, { encoding: 'utf-8' });

    console.log('✅ wrangler.toml generated successfully');
  } catch (error) {
    console.error('❌ Error generating wrangler.toml:', error);
    process.exit(1);
  }
}

liquidifyWranglerConfiguration();
