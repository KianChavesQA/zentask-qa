# 🛡️ Test Automation Plan | ZenTask QA
> **Project:** Bug Hunting & API Resilience  
> **Framework:** Playwright + Allure  
> **CI/CD:** GitHub Actions  
> **Status:** `DRAFT`

---

## 🏗️ Arquitetura da Solução
A estratégia foca no desacoplamento entre a lógica de teste e a infraestrutura de relatórios.

| Camada | Tecnologia | Finalidade |
| :--- | :--- | :--- |
| **Test Runner** | ![Playwright](https://img.shields.io/badge/Playwright-31AD52?style=flat-square&logo=Playwright&logoColor=white) | Execução de testes de API e paralelismo. |
| **Reporting** | ![Allure](https://img.shields.io/badge/Allure_Report-FFC107?style=flat-square&logo=allure&logoColor=black) | Dashboard técnico e histórico de bugs. |
| **CI/CD** | ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=github-actions&logoColor=white) | Pipeline de execução contínua. |

---

## 📊 Matriz de Cenários e Prioridades
Planeamento baseado nos requisitos de negócio e bugs conhecidos da v4.1.0.

| ID         | Cenário de Teste            | Requisito | Severidade | Objetivo do Teste 
| :---       | :---                        | :---      | :---       | :---             
| **API-01** | Validação de Contrato `POST`| `US02`    | 🟠 Alta    | Validar se retorna `201` em vez de `200`. 
| **API-02** | Vazamento de Dados `secret` | `RN04`    | 🔴 Crítica | Garantir que dados sensíveis não transitam no JSON. 
| **API-03** | Integridade da Exclusão     | `RN03`    | 🟠 Alta    | Confirmar que o `DELETE` remove o dado (Hard Delete). 
| **API-04** | Resiliência de Estatísticas | `RN05`    | 🟡 Média   | Evitar `NaN` em cálculos com base de dados vazia. 
| **API-05** | Auth via Header Exclusivo   | `RN01`    | 🔴 Crítica | Bloquear acesso se a chave for enviada no Body. 

---

## 🧠 Conjecturas e Refutações de Engenharia

### 🚩 Refutação: O falso positivo do HTTP 204
> **Cenário:** O endpoint `DELETE /v1/tasks/:id` responde com sucesso.
* **Conjectura:** O desenvolvedor pode estar a retornar `204` sem validar se o registro foi realmente removido (conflito de tipo `string` vs `number`).
* **Refutação:** O sucesso da transação HTTP não garante a persistência.
* **Validação:** O teste deve realizar um `GET` após a exclusão; o status retornado **deve** ser `404`.

### 🚩 Refutação: Broken Object Level Authorization (BOLA)
> **Cenário:** Usuário comum acede à lista de usuários.
* **Conjectura:** A API valida que o utilizador está autenticado, mas esquece-se de validar se ele tem permissão para ver campos sensíveis de terceiros.
* **Refutação:** Autenticação não é Autorização.
* **Validação:** O teste deve falhar se o payload de um usuário comum contiver o campo `secret`.

---

## 🚀 Integração Contínua (GitHub Actions)
Configuração do workflow para execução em cada `push`.

```yaml
name: Playwright Tests & Allure Report
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 18

    - name: Install dependencies
      run: npm ci

    - name: Install Playwright Browsers
      run: npx playwright install --with-deps

    - name: Run Playwright tests
      run: npx playwright test
      continue-on-error: true 

    - name: Get Allure history
      uses: actions/checkout@v4
      if: always()
      continue-on-error: true
      with:
        ref: gh-pages
        path: gh-pages

    - name: Allure Report action
      uses: simple-elf/allure-report-action@master
      if: always()
      with:
        allure_results: allure-results
        allure_history: allure-history
        keep_reports: 20

    - name: Deploy report to Github Pages
      if: always()
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: allure-history
        publish_branch: gh-pages