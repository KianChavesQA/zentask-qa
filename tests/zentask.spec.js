const { test, expect } = require('@playwright/test');

// Definição da URL Base para o ambiente local
const BASE_URL = 'http://127.0.0.1:3000';

test.describe('ZenTask Pro - Suite de Automação e Bug Hunting', () => {
  
  // Setup: Resetar a base antes de cada teste para garantir isolamento
  test.beforeEach(async ({ request }) => {
    await request.post(`${BASE_URL}/v1/admin/reset`);
  });

  test('API-01: Validar criação de task com status 201 (Contrato)', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/v1/tasks`, {
      data: { title: 'Validar Automação', userId: 1, priority: 'high' }
    });

    // REFUTAÇÃO: A API v4.1.0 retorna 200, mas o requisito US02 exige 201 Created.
    expect(response.status(), 'Erro de Contrato: API retornou 200 em vez de 201').toBe(201);
  });

  test('API-02: Garantir que dados sensíveis (secret) não são expostos', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/v1/users`, {
      headers: { 'x-api-key': 'key_user_456' }
    });

    const users = await response.json();
    
    // REFUTAÇÃO: Violação da RN04. Nenhum usuário deve ter a propriedade 'secret' exposta.
    users.forEach(user => {
      expect(user, `Vulnerabilidade (RN04): Campo 'secret' exposto para o usuário ${user.name}`)
        .not.toHaveProperty('secret');
    });
  });

  test('API-03: Validar integridade da exclusão (Hard Delete)', async ({ request }) => {
    // 1. Criar uma task para deletar
    const newPost = await request.post(`${BASE_URL}/v1/tasks`, {
      data: { title: 'Task Temporária', userId: 1 }
    });
    const { id } = await newPost.json();

    // 2. Tentar deletar
    const deleteRes = await request.delete(`${BASE_URL}/v1/tasks/${id}`);
    expect(deleteRes.status()).toBe(204);

    // REFUTAÇÃO: Validamos se a deleção foi real através de um re-check no GET.
    const checkRes = await request.get(`${BASE_URL}/v1/tasks`);
    const tasks = await checkRes.json();
    const taskExists = tasks.some(t => t.id === id);

    expect(taskExists, 'Bug Crítico (RN03): Registro ainda persiste após DELETE 204').toBe(false);
  });

  test('API-04: Resiliência em cálculos de estatísticas (Base Vazia)', async ({ request }) => {
    await request.post(`${BASE_URL}/v1/admin/reset`);

    const response = await request.get(`${BASE_URL}/v1/admin/stats`);
    const { high_priority_ratio } = await response.json();

    // REFUTAÇÃO: Verifica falha de lógica RN05 (Divisão por zero).
    expect(Number.isFinite(high_priority_ratio), 'Bug de Lógica: Ratio retornou NaN/Infinity').toBe(true);
    expect(high_priority_ratio).toBe(0);
  });

  test('API-05: Bloquear autenticação via Body (Segurança de Header)', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/v1/users`, {
      data: { 'x-api-key': 'key_admin_123' } 
    });

    // REFUTAÇÃO: RN01 exige que a chave esteja obrigatoriamente no Header.
    expect(response.status(), 'Falha de Segurança: API aceitou credencial via Body').toBe(401);
  });
});