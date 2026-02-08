const fastify = require('fastify')({ logger: false });

async function bootstrap() {
  try {
    await fastify.register(require('@fastify/cors'), { origin: '*' });

    // --- CONFIGURAÇÃO SWAGGER ---
    await fastify.register(require('@fastify/swagger'), {
      openapi: {
        info: {
          title: 'ZenTask QA',
          description: 'API de gerenciamento de tarefas para simulação de cenários de teste automatizados. Contém bugs intencionais de contrato, lógica e concorrência.',
          version: '2.1.2'
        },
        servers: [{ url: 'http://127.0.0.1:3000', description: 'Servidor Local' }],
        components: {
          securitySchemes: {
            apiKey: {
              type: 'apiKey',
              name: 'x-api-key',
              in: 'header',
              description: 'Chave de acesso obtida no endpoint /auth/login'
            }
          }
        }
      }
    });

    await fastify.register(require('@fastify/swagger-ui'), {
      routePrefix: '/docs',
      uiConfig: { docExpansion: 'list', deepLinking: true }
    });

    // --- DATABASE & MOCKS ---
    let users = [
      { id: 1, name: "Kian Admin", role: "admin", apiKey: "key_admin_123", secret: "SSBsb3ZlIGJ1Z3M=" },
      { id: 2, name: "Tester Junior", role: "user", apiKey: "key_user_456", secret: "YWJjZDEyMzQ=" }
    ];

    let tasks = [
      { id: 1, userId: 1, title: "Configurar CI/CD", status: "TODO", priority: "high" },
      { id: 2, userId: 2, title: "Escrever testes de API", status: "IN_PROGRESS", priority: "medium" }
    ];

    let nextTaskId = 3;

    // --- AUTH DECORATOR (PROFESSIONAL APPROACH) ---
    // Isso permite usar 'preHandler: fastify.auth' em qualquer rota
    fastify.decorate('authenticate', async (request, reply) => {
      const apiKey = request.headers['x-api-key'];
      const user = users.find(u => u.apiKey === apiKey);
      if (!user) {
        return reply.code(401).send({ error: 'Unauthorized', message: 'API Key inválida ou ausente' });
      }
      request.user = user; // Injeta o usuário na request
    });

    // --- ROTAS: AUTH ---
    fastify.post('/v1/auth/login', {
      schema: {
        tags: ['Auth'],
        summary: 'Realiza login e retorna API Key',
        body: { type: 'object', required: ['name'], properties: { name: { type: 'string' } } },
        response: {
          200: {
            description: 'Login bem sucedido',
            type: 'object',
            properties: { 
              message: { type: 'string' },
              key: { type: 'string', description: 'Use esta chave no header x-api-key' } 
            }
          }
        }
      }
    }, async (req) => {
      const user = users.find(u => u.name === req.body.name);
      if (!user) throw { statusCode: 401, message: 'Invalid credentials' };
      return { message: 'Logged in successfully', key: user.apiKey };
    });

    // --- ROTAS: USERS ---
    fastify.get('/v1/users', {
      schema: {
        tags: ['Users'],
        summary: 'Listar usuários (Protegido)',
        security: [{ apiKey: [] }],
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                role: { type: 'string' }
                // BUG DOCUMENTADO: O 'secret' não deveria estar aqui, mas a rota vaza.
              }
            }
          }
        }
      },
      preHandler: [fastify.authenticate]
    }, async (req) => {
      // BUG DE PRIVACIDADE MANTIDO: Vaza tudo
      return users;
    });

    // --- ROTAS: TASKS ---
    fastify.get('/v1/tasks', {
      schema: {
        tags: ['Tasks'],
        summary: 'Listar todas as tarefas com filtros',
        querystring: {
          type: 'object',
          properties: {
            priority: { type: 'string', enum: ['low', 'medium', 'high'] },
            limit: { type: 'number', description: 'Limite de registros (Buggy)' }
          }
        }
      }
    }, async (req) => {
      let result = [...tasks];
      if (req.query.priority) result = result.filter(t => t.priority === req.query.priority);
      return result; // BUG: limit ignorado
    });

    fastify.post('/v1/tasks', {
      schema: {
        tags: ['Tasks'],
        summary: 'Criar nova tarefa',
        body: {
          type: 'object',
          required: ['title', 'userId'],
          properties: {
            title: { type: 'string', minLength: 5 },
            userId: { type: 'number' },
            priority: { type: 'string', default: 'medium' }
          }
        }
      }
    }, async (req, reply) => {
      await new Promise(r => setTimeout(r, Math.random() * 2000));
      const newTask = { id: nextTaskId++, ...req.body, status: 'TODO' };
      tasks.push(newTask);
      return newTask; // BUG: Retorna 200 em vez de 201
    });

    fastify.delete('/v1/tasks/:id', {
      schema: {
        tags: ['Tasks'],
        summary: 'Remover tarefa',
        params: { type: 'object', properties: { id: { type: 'number' } } },
        response: { 204: { type: 'null', description: 'No Content' } }
      }
    }, async (req, reply) => {
      const id = req.params.id;
      // BUG CRÍTICO: t.id (number) !== id (string/number dependendo do parse)
      tasks = tasks.filter(t => t.id !== id);
      return reply.code(204).send();
    });

    // --- ROTAS: ADMIN ---
    fastify.get('/v1/admin/stats', {
      schema: {
        tags: ['Admin'],
        summary: 'Estatísticas críticas do sistema'
      }
    }, async () => {
      const total = tasks.length;
      const high = tasks.filter(t => t.priority === 'high').length;
      // BUG: Divisão por zero se total === 0
      return { total_tasks: total, high_priority_ratio: high / total };
    });

    fastify.post('/v1/admin/reset', {
      schema: { tags: ['Admin'], summary: 'Resetar base de dados (QA Only)' }
    }, async () => {
      tasks = [];
      nextTaskId = 1;
      return { message: 'Database reset' };
    });

    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('🚀 API Sênior Online | Docs: http://localhost:3000/docs');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

bootstrap();