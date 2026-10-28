# Backlog de Tarefas — Weather App

Backlog derivado de [specs/weather-app-spec.md](../specs/weather-app-spec.md) e
[plans/weather-app-plan.md](../plans/weather-app-plan.md). A spec é a fonte da
verdade para escopo e aceite; este backlog organiza sua implementação.

## Convenções

- **Tipo:** UI, Data, Test ou Infra.
- **Prioridade:** P0 para o MVP e seus critérios funcionais; P1 para validações
  importantes que dependem de decisões ainda abertas; P2 para trabalho que não
  deve ser iniciado antes de resolver uma pendência explicitada.
- **Tamanho:** P (pequeno), M (médio), G (grande). G indica uma entrega que deve
  ser revisada para divisão antes de começar.
- Dependências listam somente pré-requisitos reais de implementação.
- Os caminhos de teste abaixo são prováveis e podem ser ajustados à configuração
  existente, sem mudar os critérios de aceite.

## Entrega 1 — Contratos e funções puras

### T-01 — Definir os tipos compartilhados de clima
- **Status:** [x] Concluída

- **Descrição:** Criar os contratos internos de localidade, unidade, clima atual,
  previsão diária e conjunto de dados meteorológicos, conforme o plano.
- **Critérios de aceite:**
  - `src/types/weather.ts` exporta `Unit`, `City`, `CurrentWeather`,
    `ForecastDay` e `WeatherData` com os campos e nulabilidade definidos no
    plano.
  - Temperaturas internas são representadas em Celsius; campos meteorológicos
    opcionais são `null` quando indisponíveis.
  - A tipagem passa sob TypeScript strict sem introduzir `any`.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Tipo:** Data · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-01–FR-06; AC-01.6, AC-02.3, AC-03.4, AC-04.3,
  AC-05.6.

### T-02 — Mapear siglas dos estados brasileiros
- **Status:** [x] Concluída

- **Descrição:** Criar o mapeamento entre siglas UF e nomes de estado usados para
  filtrar resultados do geocoding por CEP.
- **Critérios de aceite:**
  - `src/lib/brazilianStates.ts` exporta as 27 siglas UF com seus nomes
    correspondentes.
  - O mapeamento não contém aliases implícitos nem valores de estado inventados.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/lib/brazilianStates.ts`.
- **Tipo:** Data · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-01; AC-01.2, AC-01.8.

### T-03 — Validar e normalizar CEP
- **Status:** [x] Concluída

- **Descrição:** Implementar funções puras para aceitar CEP com ou sem hífen,
  normalizá-lo e rejeitar formatos inválidos antes de qualquer chamada de rede.
- **Critérios de aceite:**
  - Entradas válidas resultam em exatamente oito dígitos.
  - Entradas vazias, com quantidade incorreta de dígitos ou caracteres
    incompatíveis são rejeitadas.
  - Nenhuma função executa chamadas de rede ou registra o CEP.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/lib/format.ts`.
- **Tipo:** Data · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-01, FR-06; AC-01.3, AC-01.4, AC-01.7, AC-01.9.

### T-04 — Converter temperaturas
- **Status:** [x] Concluída

- **Descrição:** Implementar a conversão pura entre Celsius e Fahrenheit para
  apresentação.
- **Critérios de aceite:**
  - A conversão cobre valores positivos, negativos e zero com resultado
    matematicamente correto.
  - Valor `null` permanece indisponível e não vira número fictício.
  - A função não altera o dado original armazenado em Celsius.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/temperature.ts`.
- **Tipo:** Data · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-04; AC-04.1–AC-04.4.

### T-05 — Mapear códigos meteorológicos
- **Status:** [x] Concluída

- **Descrição:** Mapear códigos WMO para descrição em pt-BR e representação de
  ícone usada na interface.
- **Critérios de aceite:**
  - Cada código suportado pelo mapeamento retorna descrição em pt-BR e
    identificador de ícone.
  - Código desconhecido ou indisponível tem tratamento explícito e não produz
    descrição meteorológica fictícia.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`.
- **Tipo:** Data · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-02, FR-03; AC-02.1, AC-02.2, AC-03.2.

### T-06 — Normalizar localidades e formatar datas
- **Status:** [ ] Não verificada

- **Descrição:** Implementar normalização textual usada na comparação de UF e
  formatação pt-BR de datas e horários no fuso da localidade.
- **Critérios de aceite:**
  - A comparação de estado ignora diferenças de caixa e acentos.
  - Datas da previsão são apresentadas no fuso local da cidade, a partir das
    datas retornadas pelo serviço.
  - O horário da última consulta é formatado em pt-BR sem usar o fuso do
    dispositivo para agrupar os dias.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/lib/format.ts`.
- **Tipo:** Data · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-01, FR-03, FR-05; AC-01.2, AC-01.10, AC-03.1,
  AC-03.3, AC-05.2.

## Entrega 2 — Integração com provedores

### T-07 — Implementar resolução de CEP pelo ViaCEP
- **Status:** [x] Concluída

- **Descrição:** Consultar o ViaCEP com CEP já validado e normalizado e mapear
  somente cidade e UF para o fluxo interno.
- **Critérios de aceite:**
  - O serviço não inicia uma requisição para CEP inválido.
  - Trata `erro: true`, cidade/UF ausentes, HTTP não bem-sucedido, falha de rede
    e timeout como falha de resolução.
  - Usa `AbortController` e timeout de 10 segundos por requisição, ativo até a
    leitura completa do corpo JSON.
  - Não inclui CEP em logs ou mensagens de erro.
- **Dependências:** T-01, T-03.
- **Arquivos prováveis:** `src/services/viacepService.ts`.
- **Tipo:** Data · **Prioridade:** P0 · **Tamanho:** M.
- **Rastreabilidade:** FR-01, FR-06; AC-01.2, AC-01.7–AC-01.9, AC-05.5.

### T-08 — Implementar busca de localidades no Open-Meteo
- **Status:** [x] Concluída

- **Descrição:** Buscar cidades brasileiras e filtrar resultados de busca por
  CEP pela UF resolvida no ViaCEP.
- **Critérios de aceite:**
  - A requisição limita a busca ao Brasil e solicita resultados em pt-BR.
  - Resultados são mapeados para `City` com identificador, cidade, estado,
    país, coordenadas e fuso.
  - Na busca por nome, consulta e nomes retornados são normalizados por acentos,
    caixa e espaços; somente correspondências exatas são apresentadas.
    Resultados apenas aproximados são descartados, enquanto homônimos exatos
    permanecem disponíveis com estado e país para seleção explícita.
  - Busca por CEP compara o estado após normalização e não envia o CEP ao
    Open-Meteo.
  - Resultado vazio, resposta inválida, HTTP, rede e timeout são tratados
    explicitamente; timeout por requisição é de 10 segundos e cobre a leitura
    completa do corpo JSON.
- **Dependências:** T-01, T-02, T-06.
- **Arquivos prováveis:** `src/services/geocodingService.ts`.
- **Tipo:** Data · **Prioridade:** P0 · **Tamanho:** M.
- **Rastreabilidade:** FR-01, FR-06; AC-01.1, AC-01.2, AC-01.5, AC-01.8,
  AC-01.10, AC-05.5, AC-05.8.

### T-09 — Implementar consulta de clima e previsão
- **Status:** [x] Concluída

- **Descrição:** Consultar o endpoint forecast e normalizar a resposta para os
  contratos internos.
- **Critérios de aceite:**
  - Envia coordenadas selecionadas, unidades internas especificadas no plano,
    `timezone=auto` e `forecast_days=5`.
  - Mapeia clima atual e arrays diários usando os índices correspondentes;
    extremos do dia vêm do índice zero.
  - Converte `is_day` de `1`/`0` para boolean e mantém campos isolados ausentes
    ou inválidos como `null`.
  - Resposta estruturalmente inválida ou sem dados utilizáveis resulta em erro
    explícito; não são criados valores fictícios.
  - Usa timeout de 10 segundos por requisição até a leitura completa do corpo
    JSON e registra `fetchedAt` em ISO somente após sucesso.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data · **Prioridade:** P0 · **Tamanho:** M.
- **Rastreabilidade:** FR-02, FR-03, FR-05, FR-06; AC-01.6, AC-02.1, AC-02.3,
  AC-03.1–AC-03.4, AC-05.1, AC-05.5–AC-05.7.

## Entrega 3 — Orquestração do estado

### T-10 — Orquestrar busca e seleção de localidade
- **Status:** [x] Concluída

- **Descrição:** Implementar no hook a busca por nome/CEP, estados idle/loading/
  empty/error e seleção explícita dos resultados.
- **Critérios de aceite:**
  - Entrada vazia ou CEP inválido é rejeitado sem chamada externa.
  - CEP não resolvido no ViaCEP termina em `empty` e não chama geocoding.
  - Busca por nome e CEP preserva todos os resultados relevantes e exige
    seleção explícita; nenhum resultado é selecionado automaticamente.
  - Uma busca recente invalida respostas anteriores usando cancelamento quando
    possível e controle monotônico de requisição; respostas antigas de busca ou
    clima não podem substituir nem limpar o estado da busca mais recente.
- **Dependências:** T-03, T-07, T-08.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data · **Prioridade:** P0 · **Tamanho:** M.
- **Rastreabilidade:** FR-01, FR-06; AC-01.1–AC-01.5, AC-01.8–AC-01.10,
  AC-05.4, AC-05.8.

### T-11 — Gerenciar consulta, atualização e dados desatualizados
- **Status:** [x] Concluída

- **Descrição:** Completar o hook com consulta da cidade selecionada, atualização
  manual, unidade em memória e preservação segura de dados anteriores.
- **Critérios de aceite:**
  - Selecionar uma cidade consulta suas coordenadas e atualiza os dados somente
    se a resposta pertencer à requisição mais recente.
  - Atualizar repete somente a consulta meteorológica da cidade selecionada.
  - Falha de atualização preserva, se houver, somente dados anteriores da mesma
    cidade e os sinaliza como desatualizados.
  - Dados com mais de 40 minutos são sinalizados; não há atualização periódica
    nem retry automático.
  - Unidade inicia em Celsius, fica apenas em memória e sua mudança não dispara
    nova consulta.
- **Dependências:** T-01, T-09, T-10.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data · **Prioridade:** P0 · **Tamanho:** M.
- **Rastreabilidade:** FR-02–FR-06; AC-01.6, AC-04.1–AC-04.4,
  AC-05.1–AC-05.7.

## Entrega 4 — Componentes de interface

### T-12 — Criar formulário de busca
- **Status:** [ ] Não verificada

- **Descrição:** Criar formulário acessível para busca por nome de cidade ou CEP.
- **Critérios de aceite:**
  - Campo e botão têm nomes acessíveis e são operáveis por teclado.
  - Envio encaminha o termo ao hook e impede submissão acidental de formulário.
  - Entrada vazia apresenta mensagem acessível associada ao campo, sem chamar
    serviços externos nem expor ou persistir CEP.
- **Dependências:** T-10.
- **Arquivos prováveis:** `src/components/SearchBar.tsx`.
- **Tipo:** UI · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-01, FR-06; AC-01.1–AC-01.4, AC-01.9, AC-01.10.

### T-13 — Exibir resultados de localidades
- **Status:** [x] Concluída

- **Descrição:** Apresentar opções de geocoding para seleção explícita.
- **Critérios de aceite:**
  - Cada opção mostra cidade, estado e país.
  - Cada resultado pode ser selecionado por teclado e tecnologia assistiva.
  - Nenhum resultado é escolhido automaticamente.
- **Dependências:** T-01, T-10.
- **Arquivos prováveis:** `src/components/CityResults.tsx`.
- **Tipo:** UI · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-01; AC-01.1, AC-01.2, AC-01.5, AC-01.6.

### T-14 — Exibir condições atuais
- **Status:** [ ] Não verificada

- **Descrição:** Apresentar valores meteorológicos atuais, condição e extremos
  diários.
- **Critérios de aceite:**
  - Exibe todos os campos atuais previstos pela spec e condição em pt-BR com
    ícone.
  - Campos indisponíveis são indicados sem ocultar campos válidos nem inventar
    números.
  - Temperaturas usam a unidade corrente; vento permanece em km/h e precipitação
    em mm.
- **Dependências:** T-01, T-04, T-05, T-11.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`.
- **Tipo:** UI · **Prioridade:** P0 · **Tamanho:** M.
- **Rastreabilidade:** FR-02, FR-04; AC-02.1–AC-02.3, AC-04.2, AC-04.3.

### T-15 — Criar cartão diário de previsão
- **Status:** [ ] Não verificada

- **Descrição:** Criar apresentação isolada de um dia da previsão.
- **Critérios de aceite:**
  - Apresenta descrição textual da condição, mínima/máxima, probabilidade e
    volume de precipitação em mm quando disponíveis; o ícone não substitui a
    descrição textual.
  - Campos ausentes são marcados como indisponíveis sem esconder valores
    válidos.
  - Data usa o fuso da cidade e formato pt-BR.
- **Dependências:** T-01, T-04, T-05, T-06.
- **Arquivos prováveis:** `src/components/ForecastCard.tsx`.
- **Tipo:** UI · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-03, FR-04; AC-03.1–AC-03.4, AC-04.2, AC-04.3.

### T-16 — Exibir lista de previsão
- **Status:** [x] Concluída

- **Descrição:** Renderizar os dias locais retornados pelo serviço, sem fabricar
  dias ausentes.
- **Critérios de aceite:**
  - Renderiza os dias fornecidos na ordem local; o serviço solicita hoje e os
    quatro dias seguintes.
  - Não calcula datas pelo fuso do dispositivo nem cria entradas para completar
    uma resposta menor.
  - Cada dia é apresentado pelo componente de cartão.
- **Dependências:** T-09, T-15.
- **Arquivos prováveis:** `src/components/ForecastList.tsx`.
- **Tipo:** UI · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-03; AC-03.1, AC-03.3, AC-03.4.

### T-17 — Criar controle de unidade
- **Status:** [x] Concluída

- **Descrição:** Criar controle acessível para alternar Celsius/Fahrenheit.
- **Critérios de aceite:**
  - Mostra e permite selecionar a unidade ativa.
  - A escolha atualiza a apresentação de todas as temperaturas sem alterar os
    demais valores nem disparar consulta.
  - Nova sessão começa em Celsius, sem persistência local.
- **Dependências:** T-04, T-11.
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`.
- **Tipo:** UI · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-04; AC-04.1–AC-04.4.

### T-18 — Criar ação de atualização manual
- **Status:** [x] Concluída

- **Descrição:** Expor a atualização da cidade selecionada com indicação de
  horário e estado desatualizado.
- **Critérios de aceite:**
  - A ação solicita atualização manual da cidade ativa e não dispara
    atualização periódica.
  - Exibe `fetchedAt` da última consulta bem-sucedida, não o horário da
    observação meteorológica, e sinaliza dados após 40 minutos.
  - Falha não apresenta dados antigos como atuais.
- **Dependências:** T-06, T-11.
- **Arquivos prováveis:** `src/components/RefreshButton.tsx`.
- **Tipo:** UI · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-05, FR-06; AC-05.1–AC-05.3, AC-05.5, AC-05.6.

### T-19 — Criar estado de carregamento
- **Status:** [x] Concluída

- **Descrição:** Apresentar carregamento sem bloquear teclado ou ocultar o
  contexto necessário.
- **Critérios de aceite:**
  - O estado é anunciado semanticamente e pode indicar a etapa em andamento.
  - O campo e o botão de busca continuam habilitados para permitir uma nova
    busca durante uma requisição; o carregamento não bloqueia a operação por
    teclado.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/components/states/LoadingState.tsx`.
- **Tipo:** UI · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-01, FR-06; AC-05.4.

### T-20 — Criar estado vazio
- **Status:** [x] Concluída

- **Descrição:** Apresentar busca sem correspondência e permitir nova busca.
- **Critérios de aceite:**
  - A mensagem distingue ausência de resultado de erro de serviço.
  - A pessoa consegue iniciar uma nova busca por teclado.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/components/states/EmptyState.tsx`.
- **Tipo:** UI · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-01, FR-06; AC-01.8, AC-05.8.

### T-21 — Criar estado de erro
- **Status:** [x] Concluída

- **Descrição:** Apresentar falhas de serviço e ação de nova tentativa manual.
- **Critérios de aceite:**
  - Mensagem identifica a etapa que falhou sem stack trace nem CEP.
  - A ação de retry é explícita e não cria repetição automática.
  - Sem dados anteriores, não são renderizados valores meteorológicos fictícios.
- **Dependências:** T-11.
- **Arquivos prováveis:** `src/components/states/ErrorState.tsx`.
- **Tipo:** UI · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-06; AC-05.5–AC-05.7.

## Entrega 5 — Integração da aplicação

### T-22 — Integrar fluxo principal da aplicação
- **Status:** [ ] Não verificada

- **Descrição:** Compor a primeira fatia executável: busca, resultados, seleção,
  clima atual e estados básicos na raiz da aplicação.
- **Critérios de aceite:**
  - O fluxo conecta o hook aos componentes sem chamadas a APIs na camada de
    apresentação.
  - Estados idle/loading/success/error/empty apresentam o componente
    correspondente.
  - A seleção explícita determina o clima atual exibido para a cidade escolhida.
- **Dependências:** T-11, T-12–T-14, T-19–T-21.
- **Arquivos prováveis:** `src/App.tsx`.
- **Tipo:** UI · **Prioridade:** P0 · **Tamanho:** M.
- **Rastreabilidade:** FR-01, FR-02, FR-06; AC-01.1–AC-01.6, AC-02.1–AC-02.3,
  AC-05.4–AC-05.8.

### T-23 — Completar composição, tema e responsividade
- **Status:** [ ] Não verificada

- **Descrição:** Integrar previsão, unidade e atualização à aplicação e definir
  o tema dark glassmorphism e o layout responsivo final.
- **Critérios de aceite:**
  - Forecast, controle de unidade e atualização são integrados sem chamadas a
    APIs nos componentes de apresentação.
  - A raiz fornece estilos globais e layout responsivo sem rolagem horizontal a
    partir de 320 px.
  - Foco visível e contraste são preservados no tema.
- **Dependências:** T-15–T-18, T-22.
- **Arquivos prováveis:** `src/App.tsx`, `src/styles/index.css`.
- **Tipo:** UI · **Prioridade:** P0 · **Tamanho:** M.
- **Rastreabilidade:** FR-01–FR-06; AC-03.1–AC-03.4, AC-04.1–AC-04.4,
  AC-05.1–AC-05.3, NFR-01, NFR-05, NFR-07.

## Entrega 6 — Testes automatizados e E2E

### T-24 — Testar validação de CEP e correspondência de UF
- **Status:** [ ] Não verificada

- **Descrição:** Cobrir funções puras de CEP, normalização textual e mapeamento
  de siglas UF.
- **Critérios de aceite:**
  - Testes cobrem CEP válido com/sem hífen, entradas inválidas e espaços.
  - Testes cobrem siglas e comparação de estado com caixa/acentos diferentes.
  - Testes comprovam que entrada inválida é rejeitada antes de serviço externo
    na integração correspondente.
- **Dependências:** T-02, T-03, T-06.
- **Arquivos prováveis:** `tests/unit/cep.test.ts`,
  `tests/unit/brazilianStates.test.ts`.
- **Tipo:** Test · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-01, FR-06; AC-01.2–AC-01.4, AC-01.8–AC-01.10.

### T-25 — Testar conversão de temperatura
- **Status:** [ ] Não verificada

- **Descrição:** Criar testes unitários da conversão Celsius/Fahrenheit.
- **Critérios de aceite:**
  - Testes cobrem zero, valores positivos, valores negativos e valores-limite
    pertinentes.
  - Testes verificam o tratamento de `null` e a conversão nos dois sentidos,
    se suportados pela função.
- **Dependências:** T-04.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`.
- **Tipo:** Test · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-04; AC-04.1–AC-04.3.

### T-26 — Testar códigos meteorológicos e formatação
- **Status:** [ ] Não verificada

- **Descrição:** Criar testes unitários para mapeamento WMO, datas e horário
  local.
- **Critérios de aceite:**
  - Testes cobrem códigos conhecidos, desconhecidos e indisponíveis.
  - Testes cobrem formatação pt-BR e data em fuso distinto do dispositivo.
  - Testes cobrem comparação textual sem diferença de caixa/acentos.
- **Dependências:** T-05, T-06.
- **Arquivos prováveis:** `tests/unit/weatherCodes.test.ts`,
  `tests/unit/format.test.ts`.
- **Tipo:** Test · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-01–FR-03, FR-05; AC-01.10, AC-02.2, AC-03.3,
  AC-05.2.

### T-27 — Testar serviço ViaCEP com fetch simulado
- **Status:** [ ] Não verificada

- **Descrição:** Validar requisição, mapeamento e falhas do ViaCEP sem rede real.
- **Critérios de aceite:**
  - Testes verificam URL com CEP normalizado, sucesso e casos de CEP
    inexistente/cidade-UF ausentes.
  - Testes cobrem HTTP inválido, falha de rede e timeout.
  - Testes verificam que CEP inválido não chama `fetch` e que CEP não aparece em
    logs ou mensagens de erro.
- **Dependências:** T-07.
- **Arquivos prováveis:** `tests/services/viacepService.test.ts`.
- **Tipo:** Test · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-01, FR-06; AC-01.2–AC-01.4, AC-01.7, AC-01.8,
  AC-05.5.

### T-28 — Testar serviço de geocoding
- **Status:** [ ] Não verificada

- **Descrição:** Validar parâmetros, filtragem de Brasil/UF e respostas do
  geocoding usando `fetch` simulado.
- **Critérios de aceite:**
  - Testes verificam parâmetros, mapeamento de cidade e resultados múltiplos.
  - Testes verificam filtragem por UF e ausência de CEP na URL/parâmetros.
  - Testes cobrem vazio, resposta inválida, HTTP, rede e timeout.
- **Dependências:** T-08.
- **Arquivos prováveis:** `tests/services/geocodingService.test.ts`.
- **Tipo:** Test · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-01, FR-06; AC-01.1, AC-01.2, AC-01.5, AC-01.8,
  AC-05.5, AC-05.8.

### T-29 — Testar serviço meteorológico
- **Status:** [ ] Não verificada

- **Descrição:** Validar consulta forecast, normalização e falhas usando
  `fetch` simulado.
- **Critérios de aceite:**
  - Testes verificam parâmetros, mapeamento atual/diário e uso do índice zero
    para extremos do dia.
  - Testes cobrem campos ausentes, arrays desalinhados e resposta estruturalmente
    inválida.
  - Testes cobrem previsões válidas com uma a quatro datas e rejeitam ausência
    ou falta de datas utilizáveis, sem completar a lista artificialmente.
  - Testes cobrem HTTP, falha de rede e timeout sem valores fictícios.
  - Testes verificam que qualquer caminho de serviço mantido cobre a leitura do
    corpo JSON no timeout de 10 segundos, inclusive quando o corpo demora após
    os cabeçalhos; caminhos legados removidos não permanecem referenciados em
    produção.
- **Dependências:** T-09, T-45, T-46.
- **Arquivos prováveis:** `tests/services/weatherService.test.ts`.
- **Tipo:** Test · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-02, FR-03, FR-05, FR-06; AC-02.1, AC-02.3,
  AC-03.1–AC-03.4, AC-05.1, AC-05.5–AC-05.7.

### T-30 — Testar estados e concorrência do hook
- **Status:** [ ] Não verificada

- **Descrição:** Cobrir ciclo de busca, seleção, atualização e unidade no hook.
- **Critérios de aceite:**
  - Testes cobrem estados idle, loading, success, error e empty.
  - Testes cobrem retry manual, preservação como desatualizado após falha e
    descarte de resposta obsoleta.
  - Testes distinguem CEP válido/malformado de nome de localidade com algarismos;
    nomes como `Cidade 2` seguem a busca por nome e CEPs malformados não chamam
    serviços externos.
  - Testes confirmam que alternar unidade não chama serviços novamente.
- **Dependências:** T-10, T-11, T-44.
- **Arquivos prováveis:** `tests/hooks/useWeather.test.ts`.
- **Tipo:** Test · **Prioridade:** P0 · **Tamanho:** M.
- **Rastreabilidade:** FR-01, FR-04–FR-06; AC-04.1–AC-04.4,
  AC-05.1–AC-05.8.

### T-31 — Testar busca e seleção de localidades
- **Status:** [ ] Não verificada

- **Descrição:** Testar formulário de busca e lista de resultados com serviços
  simulados.
- **Critérios de aceite:**
  - Testes cobrem envio por teclado, mensagem acessível para busca vazia e
    resultados identificados por cidade/estado/país.
  - Para busca vazia ou só com espaços, a mensagem é associada ao campo e
    anunciada por tecnologia assistiva; nenhum serviço externo é chamado.
  - Testes confirmam seleção explícita e ausência de seleção automática.
  - Estados assíncronos relevantes são verificáveis sem depender da rede.
- **Dependências:** T-12, T-13, T-22, T-43.
- **Arquivos prováveis:** `tests/components/SearchBar.test.tsx`,
  `tests/components/CityResults.test.tsx`.
- **Tipo:** Test · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-01; AC-01.1–AC-01.6, AC-01.9, AC-01.10.

### T-32 — Testar apresentação de clima e previsão
- **Status:** [ ] Não verificada

- **Descrição:** Testar estados de sucesso e dados parciais dos componentes
  meteorológicos.
- **Critérios de aceite:**
  - Testes cobrem campos atuais, previsão diária, condição em pt-BR e dados
    ausentes.
  - Testes verificam todas as temperaturas na unidade escolhida e preservação
    de km/h, mm e porcentagens.
- **Dependências:** T-14–T-16, T-23.
- **Arquivos prováveis:** `tests/components/CurrentWeather.test.tsx`,
  `tests/components/ForecastCard.test.tsx`.
- **Tipo:** Test · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-02–FR-04; AC-02.1–AC-02.3, AC-03.1–AC-03.4,
  AC-04.2, AC-04.3.

### T-33 — Testar unidade e atualização manual
- **Status:** [ ] Não verificada

- **Descrição:** Testar controles de unidade e refresh, incluindo horário e
  sinalização de desatualização.
- **Critérios de aceite:**
  - Testes cobrem alternância acessível sem nova consulta.
  - Testes cobrem atualização manual, horário, limite de 40 minutos e falha sem
    exibir dados antigos como atuais.
- **Dependências:** T-17, T-18, T-23.
- **Arquivos prováveis:** `tests/components/UnitToggle.test.tsx`,
  `tests/components/RefreshButton.test.tsx`.
- **Tipo:** Test · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-04–FR-06; AC-04.1–AC-04.4, AC-05.1–AC-05.6.

### T-34 — Testar estado de carregamento
- **Status:** [ ] Não verificada

- **Descrição:** Validar o anúncio e a usabilidade do estado loading.
- **Critérios de aceite:**
  - Teste verifica semântica acessível e disponibilidade dos controles por
    teclado conforme implementados.
- **Dependências:** T-19, T-22.
- **Arquivos prováveis:** `tests/components/LoadingState.test.tsx`.
- **Tipo:** Test · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-01, FR-06; AC-05.4.

### T-35 — Testar estado vazio
- **Status:** [ ] Não verificada

- **Descrição:** Validar mensagem de ausência de resultados e possibilidade de
  nova busca.
- **Critérios de aceite:**
  - Teste diferencia resultado vazio de falha de serviço e permite iniciar nova
    busca.
- **Dependências:** T-20, T-22.
- **Arquivos prováveis:** `tests/components/EmptyState.test.tsx`.
- **Tipo:** Test · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-01, FR-06; AC-01.8, AC-05.8.

### T-36 — Testar estado de erro
- **Status:** [ ] Não verificada

- **Descrição:** Validar mensagem de erro e retry manual.
- **Critérios de aceite:**
  - Teste verifica ação manual, ausência de repetição automática e ausência de
    CEP/stack trace na mensagem.
  - Sem dados anteriores, não há conteúdo meteorológico de sucesso.
- **Dependências:** T-21, T-22.
- **Arquivos prováveis:** `tests/components/ErrorState.test.tsx`.
- **Tipo:** Test · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-06; AC-05.5–AC-05.7.

### T-37 — Testar E2E do fluxo principal
- **Status:** [ ] Não verificada

- **Descrição:** Validar busca por cidade, seleção, previsão, unidade e
  atualização com respostas de rede controladas.
- **Critérios de aceite:**
  - O fluxo completo funciona sem chamadas dependentes de provedores reais.
  - Seleção de resultado e atualização manual atuam sobre a cidade escolhida.
  - Alternar unidade atualiza temperaturas sem alterar dados não térmicos.
- **Dependências:** T-22–T-23.
- **Arquivos prováveis:** `tests/e2e/weather-flow.spec.ts`.
- **Tipo:** Test · **Prioridade:** P0 · **Tamanho:** M.
- **Rastreabilidade:** FR-01–FR-05; AC-01.1, AC-01.5, AC-01.6, AC-02.1,
  AC-03.1, AC-04.1–AC-04.3, AC-05.1–AC-05.3.

### T-38 — Testar E2E de CEP, vazio e falhas
- **Status:** [ ] Não verificada

- **Descrição:** Validar os fluxos de CEP e recuperação manual usando respostas
  determinísticas.
- **Critérios de aceite:**
  - CEP válido segue ViaCEP e geocoding sem transmitir o CEP ao Open-Meteo;
    CEP inválido não gera requisição.
  - CEP inexistente e geocoding vazio exibem estado vazio.
  - Falha/timeout oferece retry manual; falha de atualização não apresenta
    dados antigos como atuais.
- **Dependências:** T-22, T-23.
- **Arquivos prováveis:** `tests/e2e/search-errors.spec.ts`.
- **Tipo:** Test · **Prioridade:** P0 · **Tamanho:** M.
- **Rastreabilidade:** FR-01, FR-06; AC-01.2–AC-01.4, AC-01.7, AC-01.8,
  AC-05.5–AC-05.8.

## Entrega 7 — Hardening e validações pendentes

### T-39 — Validar viewport móvel e acessibilidade
- **Status:** [ ] Não verificada

- **Descrição:** Verificar responsividade, navegação por teclado e critérios
  automatizados/manuais de acessibilidade.
- **Critérios de aceite:**
  - Playwright verifica viewport de 320 px sem rolagem horizontal e fluxo
    essencial operável por teclado.
  - Verificações automatizadas de acessibilidade não apontam violações críticas
    nos fluxos cobertos.
  - Teste manual de teclado e leitor de tela é executado e seus resultados são
    registrados no resultado da tarefa; automação não é apresentada como
    substituta do teste manual.
- **Dependências:** T-23, T-31–T-37.
- **Arquivos prováveis:** `tests/e2e/responsive-accessibility.spec.ts`.
- **Tipo:** Test · **Prioridade:** P0 · **Tamanho:** M.
- **Rastreabilidade:** NFR-01, NFR-05, NFR-07; FR-01–FR-06.

### T-40 — Verificar compatibilidade entre navegadores
- **Status:** [ ] Não verificada

- **Descrição:** Executar smoke tests nos navegadores e versões definidos pela
  spec.
- **Critérios de aceite:**
  - Fluxo principal é verificado nas duas versões principais mais recentes de
    Chrome, Firefox, Edge e Safari, incluindo Safari iOS e Chrome Android, ou as
    limitações do ambiente de execução são explicitadas.
  - Problemas reproduzíveis são registrados com navegador, versão e etapa.
- **Dependências:** T-37, T-39.
- **Arquivos prováveis:** `playwright.config.ts`,
  `tests/e2e/weather-flow.spec.ts`.
- **Tipo:** Test · **Prioridade:** P1 · **Tamanho:** M.
- **Rastreabilidade:** NFR-06; FR-01–FR-06.

### T-41 — Medir o alvo de desempenho p95
- **Status:** [ ] Não verificada

- **Descrição:** Medir o tempo entre envio da busca e renderização bem-sucedida
  após a definição do dispositivo de referência.
- **Critérios de aceite:**
  - O dispositivo/ambiente de referência é acordado antes da medição; não o
    inferir deste backlog.
  - A medição cobre conexão estável de banda larga ou 4G e reporta p95 para
    consultas bem-sucedidas, separando falhas dos provedores.
  - Resultado e configuração da medição são registrados; desvios do alvo de
    2 segundos são reportados, não ocultados.
- **Dependências:** T-37 e decisão pendente sobre dispositivo de referência
  indicada em `specs/weather-app-spec.md`.
- **Arquivos prováveis:** configuração/relatório do teste de desempenho a
  definir após a decisão; nenhum arquivo de produção presumido.
- **Tipo:** Test · **Prioridade:** P1 · **Tamanho:** M.
- **Rastreabilidade:** NFR-02.

### T-42 — Avaliar sucesso de uso em teste de usabilidade
- **Status:** [ ] Não verificada

- **Descrição:** Avaliar se pelo menos 90% das pessoas participantes conseguem
  buscar uma cidade e consultar o clima sem ajuda, após definição de amostra e
  protocolo.
- **Critérios de aceite:**
  - Tamanho da amostra e protocolo são definidos antes de iniciar a avaliação;
    este backlog não inventa esses parâmetros.
  - Resultado indica numerador, denominador e se o limiar de 90% foi atingido.
  - Achados que impeçam a conclusão são registrados como pendências, sem
    declarar sucesso sem evidência.
- **Dependências:** T-37 e decisão pendente sobre amostra/protocolo indicada em
  `specs/weather-app-spec.md`.
- **Arquivos prováveis:** protocolo/registro de pesquisa a definir; nenhum
  arquivo de produção presumido.
- **Tipo:** Test · **Prioridade:** P2 · **Tamanho:** M.
- **Rastreabilidade:** NFR-08.

## Entrega 8 — Correções pós-review

### T-43 — Informar erro acessível para busca vazia
- **Status:** [x] Concluída

- **Descrição:** Corrigir o submit vazio para apresentar validação no formulário
  em vez de retornar silenciosamente.
- **Critérios de aceite:**
  - Submeter campo vazio ou somente com espaços por botão ou Enter mostra que o
    termo é obrigatório.
  - A mensagem é associada ao campo por semântica acessível e anunciada sem
    depender somente de mudança visual.
  - A validação não chama ViaCEP nem Open-Meteo e é limpa ou atualizada quando a
    entrada passa a ser válida.
- **Dependências:** T-12.
- **Arquivos prováveis:** `src/components/SearchBar.tsx`,
  `tests/unit/SearchBar.test.tsx`.
- **Tipo:** UI · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-01, FR-06; AC-01.9.

### T-44 — Distinguir CEP de nome com algarismos
- **Status:** [ ] Não verificada

- **Descrição:** Substituir a classificação baseada na presença de qualquer
  dígito por uma regra que reconheça formatos de CEP sem interceptar nomes de
  localidades que contenham algarismos.
- **Critérios de aceite:**
  - CEP válido com ou sem hífen segue para ViaCEP após normalização.
  - Entradas com formato claramente semelhante a CEP, mas inválidas, são
    rejeitadas localmente sem chamar serviços externos.
  - Texto que não tenha formato de CEP, inclusive nome de localidade com
    algarismos, segue pelo geocoding por nome.
  - A classificação tem testes para formas válidas, malformadas e nomes com
    algarismos, sem persistir nem registrar CEP.
- **Dependências:** T-03, T-10.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`,
  `tests/unit/useWeather.test.ts`.
- **Tipo:** Data · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-01; AC-01.3, AC-01.4, AC-01.10.

### T-45 — Aceitar previsão diária parcial utilizável
- **Status:** [ ] Não verificada

- **Descrição:** Preservar uma resposta de forecast com menos de cinco datas
  válidas sem criar dias ausentes nem descartar os dados utilizáveis.
- **Critérios de aceite:**
  - Uma a quatro datas locais válidas são mapeadas na ordem recebida, com campos
    ausentes representados como `null`.
  - Arrays não são completados artificialmente; a interface apresenta somente
    os dias recebidos.
  - `daily.time` ausente, vazio ou sem datas utilizáveis continua sendo erro
    explícito da consulta.
  - Testes cobrem resposta parcial, arrays associados e resposta sem dias
    utilizáveis.
- **Dependências:** T-09, T-16.
- **Arquivos prováveis:** `src/services/weatherService.ts`,
  `tests/unit/weatherService.test.ts`, testes do componente de previsão.
- **Tipo:** Data · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-03, FR-06; AC-03.1–AC-03.4, AC-05.7.

### T-46 — Fechar a lacuna de timeout do caminho legado
- **Status:** [ ] Não verificada

- **Descrição:** Auditar consumidores de `searchCities`/`fetchWithTimeout` e
  remover o caminho legado se não houver consumidor de produção; caso seja
  mantido, cobrir com timeout a requisição e a leitura completa do JSON.
- **Critérios de aceite:**
  - A busca de referências identifica e registra se há consumidores de produção
    antes de remover ou refatorar os exports legados.
  - Nenhum serviço mantido fica sem timeout de 10 segundos ativo durante a
    leitura do corpo JSON; o `AbortController` é cancelado no timeout.
  - Se o caminho for mantido, teste com leitura de corpo atrasada confirma que a
    operação rejeita no limite e não fica pendurada após os cabeçalhos.
  - Não são introduzidos retry automático, logs de CEP nem novos hosts de API.
- **Dependências:** T-08, T-09.
- **Arquivos prováveis:** `src/services/weatherService.ts`,
  `tests/unit/weatherService.test.ts`.
- **Tipo:** Data · **Prioridade:** P1 · **Tamanho:** P.
- **Rastreabilidade:** FR-06; AC-05.5.

## Entrega 9 — Correções do review (rodada 2)

Tarefas derivadas da segunda rodada de code review. Os achados dessa rodada que
já possuem tarefa pendente correspondente não geram tarefa nova; o mapeamento
completo está em
[Rastreabilidade dos achados do review — rodada 2](#rastreabilidade-dos-achados-do-review--rodada-2).

### T-47 — Tolerar itens inválidos do geocoding sem falhar a busca
- **Status:** [ ] Não verificada

- **Descrição:** Alterar o mapeamento de resultados do geocoding para descartar
  itens individuais inválidos (sem `admin1`, sem `timezone` ou fora do Brasil)
  em vez de lançar erro que invalida a resposta inteira, como ocorre hoje em
  `mapCity` de `src/services/geocodingService.ts`.
- **Critérios de aceite:**
  - Resposta com mistura de itens válidos e inválidos apresenta somente os
    válidos, sem erro para a pessoa.
  - Resposta composta apenas por itens inválidos resulta no estado sem
    resultados, não em estado de erro.
  - Payload malformado (não objeto, `results` com tipo inesperado) continua
    produzindo erro explícito do serviço.
  - Testes cobrem os três cenários acima.
- **Dependências:** T-08.
- **Arquivos prováveis:** `src/services/geocodingService.ts`,
  `tests/unit/useWeather.test.ts` ou teste dedicado do serviço.
- **Tipo:** Data · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-01, FR-06; AC-01.1, AC-01.10, AC-05.8.

### T-48 — Definir e aplicar a política de correspondência por nome
- **Status:** [ ] Não verificada

- **Descrição:** A busca por nome hoje só retorna igualdade exata do nome
  normalizado ("Rio" não encontra "Rio de Janeiro"). Decidir a política de
  correspondência (ex.: prefixo normalizado), registrá-la no plano e aplicá-la
  em `searchCitiesByName`.
- **Critérios de aceite:**
  - A decisão de correspondência é registrada em
    `plans/weather-app-plan.md` antes da implementação; este backlog não a
    presume.
  - Buscar um prefixo válido (ex.: "Rio") apresenta as correspondências com
    cidade, estado e país para seleção explícita, conforme a política adotada.
  - A normalização de acentos, caixa e espaços repetidos é preservada e fuzzy
    matches não relacionados continuam excluídos.
  - Testes unitários e E2E são atualizados para refletir a política escolhida.
- **Dependências:** T-08, T-47.
- **Arquivos prováveis:** `plans/weather-app-plan.md`,
  `src/services/geocodingService.ts`, `tests/unit/useWeather.test.ts`,
  `tests/e2e/weather.spec.ts`.
- **Tipo:** Data · **Prioridade:** P0 · **Tamanho:** M.
- **Rastreabilidade:** FR-01; AC-01.1, AC-01.5, AC-01.10; NFR-08.

### T-49 — Alinhar mensagens dos estados vazio e de erro na composição
- **Status:** [x] Concluída

- **Descrição:** A raiz da aplicação renderiza o estado vazio com texto
  genérico ("Nenhuma cidade encontrada") ignorando a mensagem produzida pelo
  hook, e o ramo de busca vazia do hook é inalcançável porque o formulário
  retorna em silêncio. Conectar as mensagens específicas de cada causa à tela.
- **Critérios de aceite:**
  - O estado vazio apresenta mensagem correspondente à causa real: sem
    resultados de busca, CEP inexistente ou termo obrigatório.
  - Mensagens de erro/vazio produzidas pelo hook não são descartadas pela
    composição.
  - Ramos inalcançáveis do hook são removidos ou reconectados em coerência com
    a validação do formulário (T-43).
  - O estado vazio permite iniciar nova busca imediatamente.
- **Dependências:** T-22, T-43.
- **Arquivos prováveis:** `src/App.tsx`, `src/hooks/useWeather.ts`,
  `src/components/states/EmptyState.tsx`, `tests/unit/App.test.tsx`.
- **Tipo:** UI · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-06; AC-01.8, AC-01.9, AC-05.8.

### T-50 — Remover código morto e unificar a busca de cidades
- **Status:** [ ] Não verificada

- **Descrição:** Remover artefatos sem consumidor de produção
  (`src/data/mockWeather.ts`, `getShortDate` e `getDayLabel` em
  `src/lib/format.ts`, estado `query` exposto sem uso pelo hook e prop
  `disabled` do formulário se não for adotada) e concluir a unificação da busca
  de cidades iniciada em T-46, apontando os testes para o serviço único.
- **Critérios de aceite:**
  - Nenhum export sem consumidor de produção permanece, salvo justificativa
    registrada na tarefa.
  - Existe um único caminho de busca de cidades em produção; os testes passam a
    exercitar esse caminho.
  - Nenhuma mudança de comportamento visível é introduzida; lint, build e
    testes permanecem verdes.
  - Dados simulados não são importados por código de produção.
- **Dependências:** T-46.
- **Arquivos prováveis:** `src/data/mockWeather.ts`, `src/lib/format.ts`,
  `src/hooks/useWeather.ts`, `src/components/SearchBar.tsx`,
  `src/services/weatherService.ts`, `tests/unit/weatherService.test.ts`,
  `tests/unit/format.test.ts`.
- **Tipo:** Data · **Prioridade:** P1 · **Tamanho:** P.
- **Rastreabilidade:** FR-01, FR-06 (qualidade interna: elimina caminhos
  divergentes de busca e formatação).

### T-51 — Refinar a semântica acessível dos controles
- **Status:** [ ] Não verificada

- **Descrição:** Corrigir detalhes de acessibilidade apontados no review:
  `aria-label="Buscar cidade"` sobrescreve o rótulo visível "Buscar cidade ou
  CEP" no campo de busca; o controle de unidade usa `document.getElementById`
  para foco e mantém os dois botões na ordem de tabulação; a região
  `aria-live` dos resultados é montada condicionalmente e não anuncia.
- **Critérios de aceite:**
  - O campo de busca é anunciado como "Buscar cidade ou CEP", sem `aria-label`
    conflitante com o rótulo visível.
  - O controle de unidade gerencia foco com refs e padrão consistente (roving
    tabindex ou grupo simples), mantendo a operação por setas e por Tab.
  - A região viva que anuncia os resultados existe antes da atualização de
    conteúdo, permitindo o anúncio pelos leitores de tela.
  - Testes cobrem nome acessível do campo e alternância de unidade por teclado.
- **Dependências:** T-12, T-13, T-17.
- **Arquivos prováveis:** `src/components/SearchBar.tsx`,
  `src/components/UnitToggle.tsx`, `src/components/CitySelector.tsx`,
  `tests/unit/SearchBar.test.tsx`, `tests/unit/UnitToggle.test.tsx`.
- **Tipo:** UI · **Prioridade:** P1 · **Tamanho:** P.
- **Rastreabilidade:** NFR-05; AC-01.5.

## Rastreabilidade dos achados aceitos no Code Review

| Achado | Tarefas de implementação | Tarefas de teste |
|---|---|---|
| 1 — Resolver CEP pelo ViaCEP e não enviar CEP ao Open-Meteo | T-07, T-08, T-10 | T-24, T-27, T-28, T-38 |
| 2 — Atualizar manualmente e identificar dados desatualizados | T-11, T-18 | T-30, T-33, T-37, T-38 |
| 3 — Exibir descrição da condição e volume previsto de precipitação | T-15, T-16 | T-32, T-37 |
| 4 — Exigir seleção explícita da localidade | T-10, T-13, T-22 | T-31, T-37 |
| 5 — Permitir nova busca durante carregamento e descartar respostas antigas | T-10, T-19, T-22 | T-30, T-31, T-37 |
| 7 — Manter timeout ativo durante leitura do corpo da resposta | T-07, T-08, T-09 | T-27, T-28, T-29 |
| 8 — Informar busca vazia com mensagem acessível | T-12 | T-31 |
| 9 — Informar busca vazia sem chamada externa | T-43 | T-31 |
| 10 — Não classificar todo nome com algarismos como CEP | T-44 | T-30 |
| 11 — Preservar previsão parcial sem inventar dias | T-45 | T-29, T-32 |
| 12 — Cobrir ou remover timeout legado durante leitura do JSON | T-46 | T-29 |

O achado 6, sobre distinguir resposta de geocoding vazia de resposta inválida,
fica fora desta lista até confirmar o contrato de resposta do Open-Meteo. Se a
API documentar um payload vazio específico, a implementação e o teste devem
tratar esse formato como ausência de resultados; outros payloads malformados
devem continuar sendo erro.

## Rastreabilidade dos achados do review — rodada 2

Mapeamento dos achados da segunda rodada de code review. Achados cobertos por
tarefas já pendentes exigem apenas a verificação dessas tarefas; os demais
geraram as tarefas T-47 a T-51.

| Achado | Severidade | Tarefas de implementação | Tarefas de teste |
|---|---|---|---|
| B1 — FR-05 ausente: atualizar manual, exibir `fetchedAt`, sinalizar >40 min, preservar dados anteriores em falha | Bloqueante | T-11, T-18, T-22 | T-30, T-33, T-37 |
| B2 — Previsão não exibe volume esperado em mm | Bloqueante | T-15 | T-32 |
| B3 — Busca vazia sem mensagem; composição descarta mensagem do hook | Bloqueante | T-12, T-43, T-49 | T-31, T-35 |
| R1 — "Atualizado em" usa hora de observação no fuso errado em vez de `fetchedAt` | Recomendado | T-06, T-18 | T-26, T-33 |
| R2 — Rótulos "Hoje/Amanhã" comparam com o relógio do dispositivo, não com o fuso da cidade | Recomendado | T-06, T-15 | T-26, T-32 |
| R3 — Um item inválido do geocoding derruba a busca inteira | Recomendado | T-47 | T-47 |
| R4 — Filtro de igualdade exata do nome elimina correspondências legítimas | Recomendado | T-48 | T-48 |
| R5 — Qualquer dígito classifica a entrada como CEP | Recomendado | T-44 | T-30 |
| R6/N6 — Duplicação de busca de cidades e código morto (`mockWeather`, helpers de formato, `query` sem uso) | Recomendado | T-46, T-50 | T-29 |
| N1 — Campos ausentes renderizados como "—%" / "— mm" / "— km/h" | Nit | T-14 | T-32 |
| N2–N4 — `aria-label` conflitante, foco por `getElementById`, `aria-live` condicional | Nit | T-51 | T-39, T-51 |
| N5 — Previsão com menos de cinco dias falha por completo | Nit | T-45 | T-29, T-32 |
| Lacunas de teste — AC-05.4 (concorrência), AC-02.3 (campos ausentes na UI), teclado do controle de unidade | Teste | — | T-30, T-32, T-33, T-51 |

## Rastreabilidade dos requisitos funcionais

| Requisito | Tarefas que o implementam ou verificam |
|---|---|
| FR-01 — Buscar e selecionar localidade | T-01–T-03, T-06–T-08, T-10, T-12–T-13, T-22, T-24, T-27–T-28, T-30–T-31, T-37–T-39, T-43–T-44 |
| FR-02 — Consultar clima atual | T-01, T-05, T-09, T-11, T-14, T-22, T-26, T-29–T-30, T-32, T-37, T-39 |
| FR-03 — Consultar previsão de cinco dias | T-01, T-05–T-06, T-09, T-11, T-15–T-16, T-23, T-26, T-29–T-30, T-32, T-37, T-39, T-45 |
| FR-04 — Alternar unidade | T-01, T-04, T-11, T-14–T-15, T-17, T-23, T-25, T-30, T-32–T-33, T-37 |
| FR-05 — Atualizar dados sob demanda | T-06, T-09, T-11, T-18, T-23, T-26, T-29–T-30, T-33, T-37–T-38 |
| FR-06 — Tratar estados vazios e falhas | T-03, T-07–T-11, T-19–T-23, T-27–T-30, T-34–T-38, T-43, T-45–T-46 |

Todos os requisitos funcionais FR-01–FR-06 têm tarefas de implementação e
verificação. Os critérios AC-01.1–AC-05.8 estão cobertos pelas tarefas e
referências acima; casos de erro e estados parciais são exercitados em tarefas
dedicadas de serviço, hook, componentes e E2E.

## Rastreabilidade complementar de requisitos não funcionais

| Requisito | Cobertura / pendência |
|---|---|
| NFR-01 — Responsividade | T-23, T-39. |
| NFR-02 — Desempenho p95 | T-41; bloqueado até definição do dispositivo de referência e ambiente de medição. |
| NFR-03 — Disponibilidade | Sem tarefa implementável no plano atual: hospedagem, monitoramento e processo de medição mensal de disponibilidade não foram definidos. Não assumir uma plataforma nem prometer SLO sem decisão de produto/infra. |
| NFR-04 — Atualidade | T-11, T-18, T-30, T-33, T-37–T-38. |
| NFR-05 — Acessibilidade | T-12–T-13, T-17–T-23, T-31–T-36, T-39. |
| NFR-06 — Compatibilidade | T-40; depende dos ambientes/navegadores disponíveis para validação. |
| NFR-07 — Idioma e localidade | T-05–T-06, T-14–T-16, T-19–T-23, T-26, T-39. |
| NFR-08 — Sucesso de uso | T-42; bloqueado até definição de amostra e protocolo. |
| NFR-09 — Privacidade | T-03, T-07–T-08, T-10, T-22, T-27–T-28, T-38. |

### Pendências de descoberta/validação

- Confirmar cobertura de CEPs e correspondência cidade/UF entre ViaCEP e
  Open-Meteo por teste técnico separado; a spec e o plano identificam esse risco,
  mas não estabelecem amostra ou cobertura mínima. Não se presume um limiar de
  aceite neste backlog.
- Definir o dispositivo de referência para o NFR-02 antes de medir o p95.
- Definir amostra e protocolo para o NFR-08 antes de avaliar o percentual de
  sucesso.
- Definir hospedagem e abordagem de monitoramento antes de decompor o NFR-03 em
  tarefas de infraestrutura.

## Sequência sugerida em fatias verticais

1. **Primeiro resultado visível:** T-01–T-14, T-19–T-22 e os testes T-24–T-31,
   T-34–T-36. Entrega busca, escolha explícita de cidade e clima atual.
2. **Experiência completa do MVP:** T-15–T-18, T-23, T-32–T-33, T-37–T-38.
   Completa previsão, unidades, atualização e recuperação de falhas com cobertura
   de teste.
3. **Hardening e evidências:** T-39–T-42, após resolver as decisões abertas
   aplicáveis; executar também o teste técnico de cobertura CEP/cidade-UF sem
   inventar critério de cobertura.
4. **Correções pós-review:** T-43–T-46 e as coberturas correspondentes em
  T-29–T-31, antes de considerar fechados os achados 9–12.
5. **Correções do review — rodada 2:** T-47–T-49 (bloqueantes e recomendados
   P0) antes de T-50–T-51; verificar também as tarefas pendentes mapeadas na
   rastreabilidade da rodada 2 (T-06, T-11, T-14, T-15, T-18, T-22) antes de
   considerar fechados os achados B1–B3 e R1–R2.

## Prompt de implementação para o Coding Agent — T-01

```text
Implemente somente a tarefa T-01 do backlog `tasks/weather-app-tasks.md`.

Contexto:
- O projeto é um Weather App em React + Vite e TypeScript strict.
- A fonte de verdade de escopo é `specs/weather-app-spec.md`; o contrato técnico
  está em `plans/weather-app-plan.md`.
- O app consulta localidade brasileira, condições atuais e previsão de cinco
  dias; os valores meteorológicos internos usam Celsius, km/h e mm.
- Não altere serviços, componentes, hooks, testes ou outros arquivos nesta
  tarefa.

Tarefa:
Crie `src/types/weather.ts` com os tipos compartilhados `Unit`, `City`,
`CurrentWeather`, `ForecastDay` e `WeatherData`, seguindo os contratos
documentados em `plans/weather-app-plan.md`.

Critérios de aceite:
1. `Unit` representa Celsius e Fahrenheit.
2. `City` inclui identificador, nome, estado, país, latitude, longitude e fuso;
   `stateCode` é opcional.
3. `CurrentWeather` representa horário, temperatura, sensação térmica, umidade,
   vento, precipitação, código de condição, indicador dia/noite e mínima/máxima
   do dia; os valores meteorológicos potencialmente ausentes aceitam `null`.
4. `ForecastDay` representa data, código de condição, mínima/máxima,
   probabilidade e volume de precipitação; campos meteorológicos potencialmente
   ausentes aceitam `null`.
5. `WeatherData` reúne cidade selecionada, clima atual, lista de previsão e
   instante `fetchedAt` em ISO.
6. Temperaturas são armazenadas em Celsius; a unidade escolhida afeta apenas a
   apresentação.
7. O arquivo compila sob TypeScript strict e não usa `any`.

Dependências: nenhuma.
Arquivo permitido: `src/types/weather.ts`.
Não adicione comentários redundantes, dependências ou arquivos extras. Ao
concluir, informe o arquivo alterado e a validação executada.
```
