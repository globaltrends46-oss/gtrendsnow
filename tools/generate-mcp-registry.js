import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const targetFile = path.resolve(rootDir, 'apps/api/data/mcp_registry.json');

// Read existing list
let existing = [];
try {
  existing = JSON.parse(fs.readFileSync(targetFile, 'utf-8'));
} catch (e) {}

const additionalTools = [
  {
    id: 'mcp-mysql',
    name: 'MySQL Database MCP Server',
    owner: 'designcomputer',
    repo: 'mysql_mcp_server',
    category: 'Databases & Storage',
    stars: 3200,
    downloads: '210K+',
    growthRate: '+14% this week',
    tags: ['mysql', 'database', 'sql', 'mariadb', 'queries'],
    shortDescription: 'Provides AI assistants with direct read/write query execution, schema introspection, and diagnostic profiling for MySQL and MariaDB databases.',
    fullUseCase: `### Executive Problem & Solution
MySQL is the underlying database for millions of legacy and cloud-native applications (WordPress, Magento, custom enterprise backends). Writing complex SQL queries or troubleshooting slow queries often requires specialized DBA assistance.

The MySQL MCP Server provides a secure bridge allowing LLMs to inspect schemas, explore foreign keys, and safely execute queries against MySQL and MariaDB servers.

### Practical Enterprise Workflows
- **Order & Inventory Audits:** Query transactional tables to verify stock levels and order statuses in real time.
- **Index Optimization:** Ask the AI to identify slow queries and recommend composite indices.`,
    toolsProvided: [
      { name: 'read_query', description: 'Executes SELECT statements and returns rows.' },
      { name: 'list_tables', description: 'Lists all available tables and schemas.' }
    ],
    configSnippet: JSON.stringify({
      mcpServers: {
        mysql: {
          command: 'npx',
          args: ['-y', 'mysql-mcp-server'],
          env: {
            MYSQL_HOST: 'localhost',
            MYSQL_USER: 'root',
            MYSQL_PASSWORD: 'password',
            MYSQL_DATABASE: 'app_db'
          }
        }
      }
    }, null, 2),
    installGuide: 'npx -y mysql-mcp-server',
    downloadUrl: 'https://github.com/designcomputer/mysql_mcp_server/archive/refs/heads/main.zip'
  },
  {
    id: 'mcp-supabase',
    name: 'Supabase Cloud Backend MCP',
    owner: 'supabase-community',
    repo: 'supabase-mcp',
    category: 'Databases & Storage',
    stars: 8400,
    downloads: '450K+',
    growthRate: '+31% this week',
    tags: ['supabase', 'postgres', 'auth', 'storage', 'edge-functions'],
    shortDescription: 'Connects AI assistants to Supabase projects to query tables, inspect database migrations, generate Edge Functions, and manage storage buckets.',
    fullUseCase: `### Executive Problem & Solution
Supabase powers modern mobile and web backends, integrating Postgres, authentication, storage, and serverless Edge Functions into a unified dashboard.

The Supabase MCP Server allows AI agents to inspect your database schema, draft Row Level Security (RLS) policies, deploy Edge Functions, and query project tables directly.`,
    toolsProvided: [
      { name: 'query_database', description: 'Executes SQL statements via Supabase connection.' },
      { name: 'list_buckets', description: 'Lists file storage buckets.' }
    ],
    configSnippet: JSON.stringify({
      mcpServers: {
        supabase: {
          command: 'npx',
          args: ['-y', '@supabase/mcp-server'],
          env: {
            SUPABASE_PROJECT_REF: 'your-ref',
            SUPABASE_SERVICE_ROLE_KEY: 'your-key'
          }
        }
      }
    }, null, 2),
    installGuide: 'npx -y @supabase/mcp-server',
    downloadUrl: 'https://github.com/supabase-community/supabase-mcp/archive/refs/heads/main.zip'
  },
  {
    id: 'mcp-pinecone',
    name: 'Pinecone Vector Database MCP',
    owner: 'pinecone-io',
    repo: 'pinecone-mcp',
    category: 'Databases & Storage',
    stars: 6200,
    downloads: '380K+',
    growthRate: '+24% this week',
    tags: ['pinecone', 'vector-database', 'embeddings', 'semantic-search', 'rag'],
    shortDescription: 'Enables AI agents to query Pinecone vector indexes, perform approximate nearest neighbor similarity searches, and upsert high-dimensional embeddings.',
    fullUseCase: `### Executive Problem & Solution
Vector search is fundamental to enterprise RAG architectures, recommendation systems, and semantic search. Connecting AI agents directly to vector stores allows them to retrieve semantically related documents autonomously without custom middle-tier APIs.`,
    toolsProvided: [
      { name: 'query_vector', description: 'Searches vector index for top-k nearest neighbors.' },
      { name: 'upsert_vector', description: 'Inserts or updates vector records with metadata.' }
    ],
    configSnippet: JSON.stringify({
      mcpServers: {
        pinecone: {
          command: 'npx',
          args: ['-y', 'pinecone-mcp-server'],
          env: { PINECONE_API_KEY: 'your-api-key' }
        }
      }
    }, null, 2),
    installGuide: 'npx -y pinecone-mcp-server',
    downloadUrl: 'https://github.com/pinecone-io/pinecone-mcp/archive/refs/heads/main.zip'
  },
  {
    id: 'mcp-kubernetes',
    name: 'Kubernetes Cluster MCP Server',
    owner: 'strowk',
    repo: 'mcp-k8s',
    category: 'Cloud & DevOps',
    stars: 5400,
    downloads: '290K+',
    growthRate: '+22% this week',
    tags: ['kubernetes', 'k8s', 'devops', 'helm', 'pods', 'clusters'],
    shortDescription: 'Gives AI models read and diagnostic access to Kubernetes clusters to inspect pod statuses, stream container logs, analyze ingress events, and debug failures.',
    fullUseCase: `### Executive Problem & Solution
Diagnosing issues in large Kubernetes clusters with dozens of namespaces and hundreds of pods can take hours. Engineers constantly run kubectl describe pod, kubectl logs, and inspect events to find crash reasons.

The Kubernetes MCP Server connects AI agents directly to your kubeconfig context. The agent can summarize cluster health, isolate crashing pods, analyze OOMKill events, and diagnose DNS resolution errors.`,
    toolsProvided: [
      { name: 'get_pods', description: 'Lists pods across namespaces with health statuses.' },
      { name: 'get_pod_logs', description: 'Streams container logs from a specific pod.' },
      { name: 'describe_resource', description: 'Returns deep configuration and event logs for any K8s resource.' }
    ],
    configSnippet: JSON.stringify({
      mcpServers: {
        kubernetes: {
          command: 'npx',
          args: ['-y', 'mcp-k8s']
        }
      }
    }, null, 2),
    installGuide: 'npx -y mcp-k8s',
    downloadUrl: 'https://github.com/strowk/mcp-k8s/archive/refs/heads/main.zip'
  },
  {
    id: 'mcp-sentry',
    name: 'Sentry Crash & Error Tracking MCP',
    owner: 'modelcontextprotocol',
    repo: 'servers',
    category: 'Developer Tools',
    stars: 39200,
    downloads: '580K+',
    growthRate: '+19% this week',
    tags: ['sentry', 'errors', 'debugging', 'monitoring', 'observability'],
    shortDescription: 'Enables AI agents to query production application errors, inspect stack traces, analyze user impact, and draft root-cause bug fixes.',
    fullUseCase: `### Executive Problem & Solution
When software crashes in production, Sentry captures stack traces and environment metadata. Developers must manually sift through hundreds of error events to identify the root cause.

The Sentry MCP Server allows AI assistants to fetch active issues, inspect full stack traces, analyze browser/OS distributions, and correlate error spikes with recent git deployments.`,
    toolsProvided: [
      { name: 'list_issues', description: 'Retrieves unresolved error issues from Sentry project.' },
      { name: 'get_issue_details', description: 'Returns full stack trace and metadata for an issue ID.' }
    ],
    configSnippet: JSON.stringify({
      mcpServers: {
        sentry: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-sentry'],
          env: { SENTRY_AUTH_TOKEN: 'your-token' }
        }
      }
    }, null, 2),
    installGuide: 'npx -y @modelcontextprotocol/server-sentry',
    downloadUrl: 'https://github.com/modelcontextprotocol/servers/archive/refs/heads/main.zip'
  },
  {
    id: 'mcp-notion',
    name: 'Notion Workspace MCP Server',
    owner: 'suekou',
    repo: 'mcp-notion-server',
    category: 'Communication & Productivity',
    stars: 7600,
    downloads: '620K+',
    growthRate: '+26% this week',
    tags: ['notion', 'notes', 'docs', 'knowledge-base', 'productivity'],
    shortDescription: 'Allows AI assistants to search Notion workspace databases, read pages, create new documentation, and append structured task notes.',
    fullUseCase: `### Executive Problem & Solution
Company roadmaps, team wikis, and project tasks are often housed in Notion. Manually copying documentation between Notion and code editors slows down engineering workflows.

The Notion MCP Server gives AI assistants full read and write capabilities across permitted Notion pages and databases, enabling automated sprint summaries and meeting note synthesis.`,
    toolsProvided: [
      { name: 'search_pages', description: 'Searches Notion workspace for pages and database items.' },
      { name: 'create_page', description: 'Creates a new page with markdown block contents.' }
    ],
    configSnippet: JSON.stringify({
      mcpServers: {
        notion: {
          command: 'npx',
          args: ['-y', 'mcp-notion-server'],
          env: { NOTION_API_TOKEN: 'secret_your_token' }
        }
      }
    }, null, 2),
    installGuide: 'npx -y mcp-notion-server',
    downloadUrl: 'https://github.com/suekou/mcp-notion-server/archive/refs/heads/main.zip'
  },
  {
    id: 'mcp-linear',
    name: 'Linear Issue Tracking MCP Server',
    owner: 'jerhadf',
    repo: 'linear-mcp-server',
    category: 'Developer Tools',
    stars: 4800,
    downloads: '320K+',
    growthRate: '+21% this week',
    tags: ['linear', 'project-management', 'issues', 'sprints', 'agile'],
    shortDescription: 'Enables AI models to search Linear tickets, inspect project backlogs, create issues, update issue states, and summarize sprint progress.',
    fullUseCase: `### Executive Problem & Solution
Fast-moving software teams rely on Linear for bug tracking and sprint planning. Developers often have to interrupt coding flow to update ticket descriptions, add acceptance criteria, or assign priorities.

The Linear MCP Server allows AI assistants to manage issues directly through conversational commands, like "Create a ticket for the PostgreSQL index migration and assign it to the Current Sprint".`,
    toolsProvided: [
      { name: 'search_issues', description: 'Searches Linear issues by title, team, and state.' },
      { name: 'create_issue', description: 'Creates a new Linear issue with priority and labels.' }
    ],
    configSnippet: JSON.stringify({
      mcpServers: {
        linear: {
          command: 'npx',
          args: ['-y', 'linear-mcp-server'],
          env: { LINEAR_API_KEY: 'lin_api_your_key' }
        }
      }
    }, null, 2),
    installGuide: 'npx -y linear-mcp-server',
    downloadUrl: 'https://github.com/jerhadf/linear-mcp-server/archive/refs/heads/main.zip'
  },
  {
    id: 'repo-autogpt',
    name: 'AutoGPT: Autonomous AI Agent Architecture',
    owner: 'Significant-Gravitas',
    repo: 'AutoGPT',
    category: 'AI Agents & LLMs',
    stars: 168000,
    downloads: '18M+',
    growthRate: '+8% this week',
    tags: ['autonomous-agent', 'gpt', 'planning', 'task-execution', 'automation'],
    shortDescription: 'The vision of accessible AI for everyone: an autonomous open-source agent framework that attempts to accomplish user-defined goals autonomously.',
    fullUseCase: `### Executive Problem & Solution
Single-prompt LLMs require constant human guidance and cannot execute long-running, multi-step goals. AutoGPT pioneered autonomous agent loops where the AI writes its own sub-tasks, browses the web, writes code to local files, and executes terminal commands until the objective is reached.`,
    toolsProvided: [
      { name: 'autogpt_agent', description: 'Executes autonomous multi-step planning and tool execution loop.' }
    ],
    configSnippet: JSON.stringify({
      mcpServers: {
        autogpt: {
          command: 'docker',
          args: ['run', '-it', 'autogpt']
        }
      }
    }, null, 2),
    installGuide: 'git clone https://github.com/Significant-Gravitas/AutoGPT.git',
    downloadUrl: 'https://github.com/Significant-Gravitas/AutoGPT/archive/refs/heads/master.zip'
  },
  {
    id: 'repo-llamaindex',
    name: 'LlamaIndex: Data Framework for LLMs',
    owner: 'run-llama',
    repo: 'llama_index',
    category: 'AI Agents & LLMs',
    stars: 39500,
    downloads: '14M+',
    growthRate: '+16% this week',
    tags: ['rag', 'embeddings', 'data-loaders', 'vector-index', 'knowledge-graphs'],
    shortDescription: 'Comprehensive data framework to connect custom data sources (PDFs, docs, databases) to LLM applications with state-of-the-art indexing and retrieval.',
    fullUseCase: `### Executive Problem & Solution
Raw vector search is often inadequate for complex documents with tables, charts, and hierarchical headings. LlamaIndex provides specialized data connectors, parsing strategies, and multi-stage re-ranking algorithms that dramatically boost RAG precision.`,
    toolsProvided: [
      { name: 'llama_index_query', description: 'Queries an indexed knowledge base with semantic retrieval and synthesizer.' }
    ],
    configSnippet: JSON.stringify({
      mcpServers: {
        llamaindex: {
          command: 'python',
          args: ['-m', 'llama_index']
        }
      }
    }, null, 2),
    installGuide: 'pip install llama-index',
    downloadUrl: 'https://github.com/run-llama/llama_index/archive/refs/heads/main.zip'
  },
  {
    id: 'repo-flowise',
    name: 'Flowise: Drag & Drop UI for LLM Apps',
    owner: 'FlowiseAI',
    repo: 'Flowise',
    category: 'Developer Tools',
    stars: 34500,
    downloads: '3.2M+',
    growthRate: '+19% this week',
    tags: ['no-code', 'drag-and-drop', 'langchain', 'visual-builder', 'chatbots'],
    shortDescription: 'Open-source visual node-based UI to build customized LLM flows, RAG chatbots, and autonomous agents with LangChain and LlamaIndex.',
    fullUseCase: `### Executive Problem & Solution
Non-technical team members and rapid prototypers want to experiment with AI agents without writing Python code. Flowise provides an intuitive browser-based canvas where users connect nodes (models, prompt templates, vector stores, tools) and deploy them via API or embeddable chat widgets.`,
    toolsProvided: [
      { name: 'flowise_api', description: 'Executes flow pipelines via REST API.' }
    ],
    configSnippet: JSON.stringify({
      mcpServers: {
        flowise: {
          command: 'npx',
          args: ['flowise', 'start']
        }
      }
    }, null, 2),
    installGuide: 'npm install -g flowise && flowise start',
    downloadUrl: 'https://github.com/FlowiseAI/Flowise/archive/refs/heads/main.zip'
  }
];

// Combine unique by id
const existingIds = new Set(existing.map(t => t.id));
const merged = [...existing];
for (const tool of additionalTools) {
  if (!existingIds.has(tool.id)) {
    merged.push(tool);
    existingIds.add(tool.id);
  }
}

fs.writeFileSync(targetFile, JSON.stringify(merged, null, 2), 'utf-8');
console.log('Total curated MCP servers & repos in catalog:', merged.length);
