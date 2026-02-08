# 🚀 ZenTask QA - Senior Bug Hunting API
> **Fins Académicos & Portfólio de QA Automation** >
> 
> **Report:** ![Allure Report](https://img.shields.io/badge/Allure-Report-FFC107?style=flat-square&logo=allure&logoColor=black)

---

## 📑 Visão Geral do Projeto
O **ZenTask QA** é um ecossistema projetado para demonstrar competências avançadas em Engenharia de Qualidade. A API (baseada em Fastify) contém bugs intencionais que servem como "alvos" para uma suíte de testes rigorosa, focada em **Refutação de Caminho Feliz** e **Segurança**.

| Recurso | Tecnologia | Finalidade |
| :--- | :--- | :--- |
| **Backend** | ![Fastify](https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white) | API com débitos técnicos e bugs propositais. |
| **Automação** | ![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=Playwright&logoColor=white) | Framework de alta performance para testes de API. |
| **Relatórios** | ![Allure](https://img.shields.io/badge/Allure%20Report-FFC107?style=for-the-badge&logo=Allure&logoColor=black) | Dashboard visual com histórico e severidade. |
| **CI/CD** | ![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?style=for-the-badge&logo=GitHub%20Actions&logoColor=white) | Pipeline de execução e deploy automatizado. |
| **Hosting** | ![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-222222?style=for-the-badge&logo=GitHub&logoColor=white) | Hospedagem dos relatórios públicos de QA. |

---

## 🏗️ Estratégia de Qualidade & CI/CD
A robustez deste projeto reside na integração entre o desenvolvimento e a infraestrutura de testes:

* **⚡ Integração Contínua:** Todo `push` ou `PR` aciona o GitHub Actions, garantindo que regressões sejam detectadas imediatamente.
* **📊 Publicação Automatizada:** Os resultados são compilados pelo Allure e publicados automaticamente no **GitHub Pages**, provendo visibilidade total para o time.
* **🔍 Mentalidade de Refutação:** A suíte de testes não confia apenas nos códigos de status HTTP; ela realiza validações cruzadas para garantir que a persistência e a lógica de negócio foram de fato respeitadas.



---

## 🚀 Como Executar o Projeto

### 1. Clonagem e Instalação
```bash
git clone [https://github.com/seu-usuario/zentask-qa.git](https://github.com/seu-usuario/zentask-qa.git)
cd zentask-qa
npm install

### 2. Iniciar o servidor em um terminal
npm run start

### 3. Executar testes e gerar o Allure em outro
npx playwright test
npx allure generate allure-results --clean -o allure-report
npx allure open allure-report

### 4. Dasboard Allure

# O relatório final pode ser consultado online e apresenta:

    Trend Chart: Evolução dos testes ao longo dos deploys.

    Categories: Separação entre falhas de infraestrutura e bugs reais de lógica.

    Attachments: Logs detalhados de requisição e resposta para debug rápido.

🔗 Aceder ao Relatório no GitHub Pages: https://KianChavesQA.github.io/zentask-qa/
