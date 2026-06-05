const fs = require('fs');
const path = require('path');

const csvDir = '/Users/teste/Desktop/CRM BACKUP CLICKUP/files';
const outputDataTs = path.join(__dirname, 'src', 'lib', 'data.ts');
const outputSeedSql = path.join(__dirname, 'supabase', 'seed.sql');

function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^\uFEFF/, '')); // Remove BOM if present
  
  return lines.slice(1).map(line => {
    // Basic CSV parsing, doesn't handle quotes with commas inside well, 
    // but the data might be simple enough. Let's assume simple comma separation
    // Actually, looking at the data, let's use a slightly better parser or just split by comma
    // since we control the input.
    // A regex that splits by comma but ignores commas inside quotes:
    const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = values[i];
    });
    return obj;
  });
}

function readCSV(filename) {
  return parseCSV(fs.readFileSync(path.join(csvDir, filename), 'utf-8'));
}

const clientes = readCSV('crm_clientes.csv');
const status = readCSV('crm_status.csv');
const usuarios = readCSV('crm_usuarios.csv');
const tasks = readCSV('crm_tasks_normalizado.csv');

// --- GENERATE data.ts ---

let dataTsContent = `import { CrmTask, ClientRecord, TeamMember, TaskStatus } from '../app/page';\n\n`;

dataTsContent += `export const REAL_TEAM: any[] = [\n`;
usuarios.forEach(u => {
  dataTsContent += `  { id: "${u.user_id}", name: "${u.nome}", role: "${u.role}", email: "${u.nome.toLowerCase().replace(' ', '')}@example.com", status: "online" },\n`;
});
dataTsContent += `];\n\n`;

dataTsContent += `export const REAL_CLIENTS: any[] = [\n`;
clientes.forEach(c => {
  let stage = "won";
  if (c.tipo === 'Pipeline') stage = "lead";
  
  dataTsContent += `  { id: "${c.cliente_id}", name: "${c.nome}", tipo: "${c.tipo}", contact: "Contato ${c.nome}", email: "contato@exemplo.com", phone: "(11) 99999-9999", stage: "${stage}", value: 0, owner: "Gustavo Roque", notes: "Lista: ${c.lista_nome_clickup}", updatedAt: new Date().toISOString() },\n`;
});
dataTsContent += `];\n\n`;

const statusMap = {
  'S1': 'a_fazer',
  'S2': 'em_andamento',
  'S3': 'planejamento',
  'S4': 'backlog',
  'S5': 'em_espera',
  'S6': 'concluida',
  'S7': 'cancelada'
};

dataTsContent += `export const REAL_TASKS: any[] = [\n`;
tasks.forEach(t => {
  if (!t.task_id) return;
  const statusId = statusMap[t.status_id] || 'todo';
  const dueDate = t.data_entrega ? t.data_entrega : '';
  const priority = t.prioridade ? t.prioridade.toLowerCase() : 'medium';
  const assignee = t.responsavel ? t.responsavel : 'Sem responsável';
  
  dataTsContent += `  { id: "${t.task_id}", title: ${JSON.stringify(t.tarefa)}, client: "${t.cliente}", assignee: "${assignee}", status: "${statusId}", priority: "${priority}", dueDate: "${dueDate}", description: "", tag: "${t.tags || 'ClickUp'}", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), comments: [], clickupUrl: "${t.clickup_url}" },\n`;
});
dataTsContent += `];\n\n`;

fs.writeFileSync(outputDataTs, dataTsContent);
console.log('data.ts generated');

// --- GENERATE seed.sql ---

let sqlContent = `-- Seed data for CRM\n\n`;

// Users
sqlContent += `-- Users\n`;
usuarios.forEach(u => {
  const initials = u.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  sqlContent += `INSERT INTO public.users (id, name, initials, color) VALUES (uuid_generate_v4(), '${u.nome}', '${initials}', '#333');\n`;
});
sqlContent += `\n`;

// Here we'd need to properly handle UUIDs for relations.
// For the preview, we are just storing jsonb in crm_workspace_state.
// Since the instruction says "Criar seed SQL (supabase/seed.sql)" we will just generate a basic script.
sqlContent += `-- Note: In the current setup, data is stored in crm_workspace_state as jsonb.\n`;
sqlContent += `-- When moving to a fully relational schema, use these inserts.\n`;

fs.writeFileSync(outputSeedSql, sqlContent);
console.log('seed.sql generated');
