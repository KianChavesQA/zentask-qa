const fastify = require('fastify')({ logger: false });
const cors = require('@fastify/cors');

fastify.register(cors);

let tasks = [
  { id: 1, userId: 1, title: "Configurar ambiente", status: "Concluída" },
  { id: 2, userId: 1, title: "Revisar PR de autenticação", status: "Pendente" }
];
let nextId = 3;

// ROTA DE LISTAGEM: Bug de ordenação inconsistente
fastify.get('/tasks', async (request, reply) => {
  // Retorna a lista em ordem aleatória para simular erro de ordenação no banco
  return tasks.slice().sort(() => Math.random() - 0.5);
});

// ROTA DE CRIAÇÃO: Bug de Alto Impacto (Race Condition + Falha de Validação)
fastify.post('/tasks', async (request, reply) => {
  const { title } = request.body;
  
  // Bug: Simulação de delay para permitir Race Condition (múltiplos cliques)
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Bug de Baixo Impacto: Backend aceita título vazio ou curto demais
  const newTask = {
    id: nextId++,
    userId: 1,
    title: title, 
    status: 'Pendente'
  };

  tasks.push(newTask);
  
  // Bug de Integração: Retorna 200 OK para criação em vez de 201 Created
  return newTask; 
});

// ROTA DE ATUALIZAÇÃO: Bug de Médio Impacto (Estado Inconsistente)
fastify.put('/tasks/:id', async (request, reply) => {
  const { id } = request.params;
  const { status } = request.body;

  const task = tasks.find(t => t.id === parseInt(id));
  
  if (task) {
    // Bug: Permite mudar de "Pendente" direto para "Concluída" sem passar por "Em Progresso"
    // Ou permite concluir algo que já foi removido logicamente (se houvesse essa flag)
    task.status = status;
    
    // Bug Visual: Backend atualiza, mas o retorno pode vir com atraso ou incompleto
    return { message: "Success" }; 
  }

  return reply.code(404).send({ error: "Task not found" });
});

fastify.listen({ port: 3000 }, (err) => {
  if (err) throw err;
  console.log('🚀 API instável (propositalmente) rodando na porta 3000');
});