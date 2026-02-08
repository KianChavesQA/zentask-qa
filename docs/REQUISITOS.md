# 🚀 ZenTask QA | Documentation
> **Project:** Bug Hunting Simulator  
> **Version:** `2.1.2`  
> **Status:** `STABLE / BUGGY`  
> **Domain:** QA Engineering & API Testing  

---

## 📑 Visão Geral
Este documento descreve as diretrizes de negócio e as expectativas de comportamento da API ZenTask Pro. O objetivo principal é servir como base para a criação de **Testes de Contrato**, **Funcionais** e de **Segurança**.

---

## 📋 Regras de Negócio (RN)
As regras de negócio são as leis do sistema. Se o código não as segue, temos um **Defeito**.

| ID       | Regra            | Descrição Técnica                                                           | Impacto    |
| :--      | :---             | :---                                                                        | :---       |
| **RN01** | `AUTH_REQUIRED`  | Endpoints `/v1/users` e `/v1/admin/*` exigem header `x-api-key`.            | 🔴 Crítico |
| **RN02** | `ID_INCREMENT`   | IDs de tasks devem ser únicos, auto-incrementais e gerados no servidor.     | 🟠 Alto    |
| **RN03** | `HARD_DELETE`    | A remoção via `DELETE` deve expurgar o dado e retornar `204 No Content`.    | 🟠 Alto    |
| **RN04** | `DATA_PRIVACY`   | Campos como `secret` ou `password` nunca devem ser retornados no JSON.      | 🔴 Crítico | 
| **RN05** | `ZERO_DIV_PROT`  | O cálculo de estatísticas deve prever cenários de base de dados vazia.      | 🟡 Médio   |

---

## 📖 Histórias de Usuário (User Stories)

### 🔑 US01: Autenticação de Usuários
**Como** um colaborador cadastrado no sistema,  
**Quero** realizar login através do meu nome de usuário,  
**Para que** eu possa obter uma chave de acesso para gerenciar minhas atividades.

* **Cenário de Sucesso:** Nome válido retorna `200 OK` + `apiKey`.
* **Cenário de Exceção:** Nome inexistente retorna `401 Unauthorized`.
* **Refutação do Caminho Feliz:** O sistema não deve permitir o acesso se a chave for enviada no corpo (Body) em vez do Header.

---

### 📝 US02: Gestão de Atividades (Backlog)
**Como** um usuário autenticado,  
**Quero** cadastrar, listar e remover tarefas,  
**Para que** meu fluxo de trabalho esteja sempre atualizado.

* **Critérios de Aceite:**
    * **POST:** Deve validar `minLength: 5` para títulos. Status esperado: `201 Created`.
    * **GET:** Deve suportar filtros por `priority` sem degradar a performance.
    * **DELETE:** Deve garantir que, após o sucesso, o recurso não seja mais acessível via GET.
* **Bug Conhecido:** A API está retornando `200` em vez de `201` na criação.



---

### 📊 US03: Métricas de Gestão (Admin)
**Como** um gestor de projetos,  
**Quero** visualizar a proporção de tarefas de alta prioridade,  
**Para que** eu possa medir o nível crítico de entrega.

* **Critérios de Aceite:**
    * Retornar o total de tarefas e o ratio (`high_tasks / total`).
    * O ratio deve ser um valor numérico decimal.
    * **Falha Esperada:** Em ambientes sem tarefas, o sistema deve retornar `0.00` e não interromper o serviço.

---

## 🛠️ Guia de Status Codes Esperados
Para garantir a conformidade **RESTful**, os seguintes códigos devem ser validados:

* ✅ `200 OK`: Sucesso em consultas e atualizações.
* ✅ `201 Created`: Sucesso em criações de novos recursos.
* ✅ `204 No Content`: Sucesso em deleções (Sem corpo de resposta).
* ❌ `400 Bad Request`: Erro de validação de Schema (ex: título curto).
* ❌ `401 Unauthorized`: Falha de autenticação ou chave ausente.
* ❌ `404 Not Found`: Recurso inexistente.

---

## 🎯 Próximos Passos para o QA
1.  **Mapear Testes de Contrato** baseados no Swagger.
2.  **Criar Testes de Sanidade** para o fluxo de Login -> Create Task.
3.  **Executar Testes de Segurança** focados na RN04 (Vazamento de segredos).