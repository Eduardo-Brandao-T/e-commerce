# 🛍️ E-commerce API — Backend

API de **e-commerce** construída com **NestJS**, **Prisma ORM**, **PostgreSQL** e **RabbitMQ**, totalmente **containerizada com Docker**.  
Gerencia **usuários, produtos e pedidos**, com **autenticação JWT**, **auditoria de logs** e **eventos assíncronos** via mensageria.

---

## 📚 Índice

1. [🚀 Como rodar o projeto](#-como-rodar-o-projeto)
   - [📦 Pré-requisitos](#-pré-requisitos)
   - [▶️ Subindo tudo com um comando](#️-subindo-tudo-com-um-comando)
2. [🖱️ Realizando Testes Manuais](#️-realizando-testes-manuais)
3. [🧱 Arquitetura](#-arquitetura)
4. [⚙️ Tecnologias Principais](#️-tecnologias-principais)
5. [⚖️ Trade-offs e Decisões](#️-trade-offs-e-decisões)
6. [⚙️ Fluxo Principal da Aplicação](#️-fluxo-principal-da-aplicação)
   - [🔁 Retry e Dead Letter Queue (DLQ)](#-retry-e-dead-letter-queue-dlq)
   - [⚡ Benefícios da Arquitetura](#-benefícios-da-arquitetura)
   - [⚙️ Tratamento de Race Conditions](#️-tratamento-de-race-conditions)
7. [🔐 Segurança](#-segurança)
8. [🌟 Bônus Implementados](#-bônus-implementados)
9. [🧠 Próximos Passos](#-próximos-passos)
10. [🐳 Estrutura Docker Compose](#-estrutura-docker-compose)
11. [🧪 Testes](#-testes)

---

## 🚀 Como rodar o projeto

### 📦 Pré-requisitos

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

---

### ▶️ Subindo tudo com um comando

1️ Clone o repositório:

```bash
git clone https://github.com/Eduardo-Brandao-T/e-commerce.git
cd e-commerce
```

2️ Crie o arquivo `.env` na raiz do projeto:

```bash
DATABASE_URL="postgresql://user:password@postgres:5432/ecommerce"
RABBITMQ_URL="amqp://admin:admin@rabbitmq:5672"
JWT_SECRET="sua_chave_secreta_aqui"
NODE_ENV=development
PORT=3000
```

3️ Suba os containers:

```bash
docker compose up --build
```

💡 O Compose irá:
- Criar containers para **PostgreSQL**, **RabbitMQ** e o **backend NestJS**
- Aplicar automaticamente as **migrations do Prisma**
- Executar o **seed inicial**
- Rodar o backend em modo de desenvolvimento

4 Após subir, acesse:
- **API:** [http://localhost:3000](http://localhost:3000)
- **Swagger:** [http://localhost:3000/swagger](http://localhost:3000/swagger)
- **RabbitMQ Console:** [http://localhost:15672](http://localhost:15672)  
  *(login: `admin`, senha: `admin`)*

---

## 🖱️ Realizando Testes Manuais

---

### **1. Acesse o Swagger**

Abra o navegador e vá para: **[`http://localhost:3000/api`](http://localhost:3000/swagger)**

---

### **2. Faça login (autenticação)**

1. No Swagger, localize o endpoint:  
   ```
   POST /auth/login
   ```
2. Use as credenciais do usuário **administrador** criadas no *seed*:

   ```
   Email: admin@email.com
   Senha: admin1
   ```

3. Envie a requisição e copie o valor retornado em **`access_token`**.  
4. Clique no botão **“Authorize”** (🔓) no topo do Swagger e cole o token.  
   > Isso permitirá acessar os endpoints protegidos.

---

### **3. Teste os endpoints CRUD**

Com o token autenticado:

- Acesse os endpoints de **Usuário** (`/user`) e **Produto** (`/product`).
- Realize as operações disponíveis

---

### **4. Teste principal — Fluxo de Pedido**

1. Crie um novo pedido no endpoint:  
   ```
   POST /order
   ```
2. Verifique no **terminal da aplicação** se os **consumidores RabbitMQ** foram acionados.  
   > Deverão aparecer logs confirmando o processamento do evento.

3. Depois, use o endpoint:
   ```
   GET /order/:id
   ```
   para confirmar se o **status do pedido** foi atualizado corretamente no banco  
   (exemplo: `CONFIRMED` ou `CANCELLED`).

---

### **5. Teste de permissões com outro usuário**

1. Faça logout (ou apenas substitua o token atual).  
2. Autentique com o usuário **cliente**:

   ```
   Email: cliente@email.com
   Senha: senha123
   ```

3. Repita as chamadas aos endpoints de **Usuário** e **Produto**.  
   > Você deve receber **erros 403 (Forbidden)**, confirmando que os **bloqueios de acesso** estão funcionando corretamente.

---

## 🧱 Arquitetura

A aplicação segue uma **arquitetura modular e desacoplada**:

```
rabbitmq/
src/
│
├── modules/
│   ├── auth/         → autenticação JWT
│   ├── user/         → CRUD de usuários
│   ├── product/      → CRUD de produtos
│   ├── order/        → criação e listagem de pedidos
│   └── log/          → auditoria e rastreabilidade
│
├── events/           → integração com RabbitMQ
├── prisma/           → schema, migrations e seed
├── common/           → decorators, pipes, filters, guards, interceptors e tipos globais
└── main.ts           → ponto de entrada da aplicação
```

Cada módulo segue o padrão **Controller → Service → Repository**, mantendo o código organizado e testável.

---

## ⚙️ Tecnologias Principais

| Tecnologia | Função | Motivo da Escolha |
|-------------|--------|-------------------|
| **NestJS** | Framework backend modular | Estrutura limpa e escalável |
| **Prisma ORM** | ORM tipado | Produtividade e segurança em queries |
| **PostgreSQL** | Banco relacional | Estabilidade e suporte a transações |
| **RabbitMQ** | Mensageria | Comunicação assíncrona entre serviços |
| **JWT** | Autenticação | Simples, segura e stateless |
| **Docker Compose** | Orquestração | Ambiente reprodutível com um comando |
| **Jest** | Testes automatizados | Framework simples e popular para testes em TypeScript |

---

## ⚖️ Trade-offs e Decisões

| Decisão | Benefício | Custo |
|----------|------------|--------|
| Docker Compose completo | Setup 100% automatizado | Build inicial mais demorado |
| Logs no banco | Auditoria e rastreabilidade | Mais escritas no banco |
| RabbitMQ | Eventos assíncronos | Requer container extra |
| Prisma ORM | Tipagem forte e migrações seguras | Menor controle sobre SQL cru e leve perda de performance em queries complexas |
| Seed automático | Ambiente pronto rapidamente | Execução adicional no startup |
| Jest para testes | Facilidade e integração com NestJS | Aumenta o tempo de build em ambientes CI/CD |

---

## ⚙️ Fluxo Principal da Aplicação

---

A aplicação segue um **fluxo orientado a eventos**, garantindo **baixo acoplamento**, **resiliência** e **consistência eventual** entre os módulos.  
A comunicação entre serviços ocorre através do **RabbitMQ**, utilizando a fila `app_events`.

### 🧩 Visão Geral do Fluxo

```mermaid
flowchart TD
    A[🛒 Criação de Pedido<br>API /order] -->|Evento: ORDER_CREATED| B[(📬 app_events Queue)]
    B --> C[💳 PaymentConsumer<br>Simula Pagamento]
    C -->|Evento: PAYMENT_PROCESSED| D[(📬 app_events Queue)]
    D --> E[📦 StockConsumer<br>Atualiza Estoque]
    E --> F[✅ Pedido Atualizado no Banco<br>Status: PAYMENT_CONFIRMED]
```

---

### 🧠 Explicação Técnica do Fluxo

1. **Criação do Pedido**
   - Quando o endpoint `POST /order` é chamado, o serviço cria um novo pedido no banco.
   - Após salvar o pedido, o sistema **emite um evento `ORDER_CREATED`** na fila `app_events`.
   - O evento contém dados como:
     ```json
     {
       "eventType": "ORDER_CREATED",
       "payload": {
         "orderId": 42,
         "userId": 3,
         "total": 199.90
       }
     }
     ```

2. **PaymentConsumer (Simulação de Pagamento)**
   - O consumidor `PaymentConsumer` escuta a fila `app_events`.
   - Ao receber o evento `ORDER_CREATED`, ele simula o processamento do pagamento.
   - Caso a operação seja bem-sucedida, emite um novo evento:  
     **`PAYMENT_PROCESSED`**, novamente na mesma fila.
   - O payload inclui o `orderId` e o status atualizado.

3. **StockConsumer (Atualização de Estoque)**
   - O `StockConsumer` também escuta a `app_events`.
   - Ao receber `PAYMENT_PROCESSED`, ele atualiza o estoque dos produtos relacionados ao pedido.
   - Após a atualização, o pedido tem seu status alterado para `PAYMENT_CONFIRMED`.

---

### 🔁 Retry e Dead Letter Queue (DLQ)

Para garantir robustez e resiliência, o sistema implementa **mecanismos de retry e DLQ (Dead Letter Queue)**:

- Se um consumidor falhar ao processar uma mensagem (por exemplo, por falha temporária no banco), o RabbitMQ reencaminha a mensagem para **reprocessamento automático**, a cada retry o tempo de espera para processar o evento aumenta exponencialmente.
- O número de tentativas foi configurada para 5.
- Caso todas as tentativas falhem, a mensagem é enviada para uma **DLQ (`app_events.dlq`)**.
- A DLQ serve para **armazenar mensagens com falhas permanentes**, permitindo que elas sejam inspecionadas e reprocessadas manualmente depois.

```mermaid
flowchart LR
    A[📬 app_events Queue] -->|Erro ao consumir| B[🔁 Retry Attempts]
    B -->|5 falhas| C[☠️ DLQ - app_events.dlq]
    C --> D[Falhas permanentes são salvas no banco]
```

---

### ⚡ Benefícios da Arquitetura

- **Escalabilidade:** cada consumidor pode ser escalado independentemente.
- **Resiliência:** falhas não interrompem o fluxo principal.
- **Auditabilidade:** logs e eventos permitem rastrear o estado de cada pedido.
- **Extensibilidade:** novos consumidores podem ser adicionados sem alterar o código existente.

---

> 💡 **Resumo:**  
> Esse fluxo garante que cada pedido passe automaticamente pelos estágios de criação, pagamento e atualização de estoque, mantendo o sistema sincronizado e tolerante a falhas.

---

### ⚙️ Tratamento de Race Conditions

Durante a atualização de estoque, o sistema implementa um mecanismo de controle de concorrência para evitar race conditions — situações em que múltiplas transações tentam modificar o mesmo estoque simultaneamente.

Isso é resolvido utilizando transações atômicas do Prisma ($transaction) em conjunto com o bloqueio explícito de registros via FOR UPDATE no banco de dados.

Quando o consumidor de estoque (StockConsumer) processa o evento PAYMENT_PROCESSED, ele:

1. Inicia uma transação no banco.
2. Faz uma query com FOR UPDATE para bloquear todos os produtos do pedido, impedindo que outras transações leiam ou modifiquem o estoque até que a atual seja concluída.
3. Valida se há estoque suficiente para cada item e aplica a redução do estoque dentro da mesma transação.
4. Caso algum produto esteja sem estoque, a transação é interrompida e revertida automaticamente, garantindo consistência.

Esse design garante que o sistema continue íntegro mesmo sob alta concorrência, evitando inconsistências de estoque em cenários reais de múltiplos pedidos simultâneos.

---

## 🔐 Segurança

Os endpoints do sistema estão protegidos, mas existem dois endpoints acessíveis publicamente /login (Get) e /users (Get), é possível usar esse segundo endpoint para testar se a aplicação subiu sem erros e o seed foi executado com sucesso. O restante dos endpoints só são acessíveis após a autenticação via JWT, é importante ressaltar que os usuários do sistema tem uma chave "Role" que pode ter os valores "ADMIN" ou "CUSTOMER", essa chave é utilizada para gerenciar quais endpoints o usuário terá acesso, as rotas que preciso ter role admin para acessar são:

```bash
POST /events/publish
POST /events/payment
GET /user/${id}
PUT /user/${id}
POST /product/
PUT /product/
GET /order/
GET /order/${userId} 
```

Além disso também foi implementada uma lógica de auditoria, nos endpoints em que dados do banco são alterados, informações como o que foi alterado e por quem são salvas em uma tabela de logs.

---

## 🌟 Bônus Implementados

✅ **Logs automáticos** de ações em entidades  
✅ **DLQ e retry com backoff exponencial** no serviço de mensageria  
✅ Estratégia para evitar **Race conditions**  
✅ **Swagger com autenticação JWT integrada**  
✅ **Permissões diferenciadas** entre customer e admin  
✅ **Ambiente 100% containerizado** (sem instalar Node ou Postgres localmente)  

---

## 🧠 Próximos Passos

- Implementar **cache com Redis**
- Criar **serviço de notificação** para novos pedidos
- Monitorar logs com **Prometheus + Grafana**

---

## 🐳 Estrutura Docker Compose

| Serviço | Porta | Função |
|----------|--------|--------|
| **backend** | `3000` | API NestJS |
| **postgres** | `5433 → 5432` | Banco de dados |
| **rabbitmq** | `5672`, `15672` | Mensageria e painel web |

---

## 🧪 Testes

Para rodar os testes (utilizando `Dockerfile.test`):

```bash
docker compose up test
```
