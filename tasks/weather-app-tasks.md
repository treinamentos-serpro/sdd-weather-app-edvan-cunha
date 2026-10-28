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

- **Descrição:** Consultar o ViaCEP com CEP já validado e normalizado e mapear
  somente cidade e UF para o fluxo interno.
- **Critérios de aceite:**
  - O serviço não inicia uma requisição para CEP inválido.
  - Trata `erro: true`, cidade/UF ausentes, HTTP não bem-sucedido, falha de rede
    e timeout como falha de resolução.
  - Usa `AbortController` e timeout de 10 segundos por requisição.
  - Não inclui CEP em logs ou mensagens de erro.
- **Dependências:** T-01, T-03.
- **Arquivos prováveis:** `src/services/viacepService.ts`.
- **Tipo:** Data · **Prioridade:** P0 · **Tamanho:** M.
- **Rastreabilidade:** FR-01, FR-06; AC-01.2, AC-01.7–AC-01.9, AC-05.5.

### T-08 — Implementar busca de localidades no Open-Meteo

- **Descrição:** Buscar cidades brasileiras e filtrar resultados de busca por
  CEP pela UF resolvida no ViaCEP.
- **Critérios de aceite:**
  - A requisição limita a busca ao Brasil e solicita resultados em pt-BR.
  - Resultados são mapeados para `City` com identificador, cidade, estado,
    país, coordenadas e fuso.
  - Busca por CEP compara o estado após normalização e não envia o CEP ao
    Open-Meteo.
  - Resultado vazio, resposta inválida, HTTP, rede e timeout são tratados
    explicitamente; timeout por requisição é de 10 segundos.
- **Dependências:** T-01, T-02, T-06.
- **Arquivos prováveis:** `src/services/geocodingService.ts`.
- **Tipo:** Data · **Prioridade:** P0 · **Tamanho:** M.
- **Rastreabilidade:** FR-01, FR-06; AC-01.1, AC-01.2, AC-01.5, AC-01.8,
  AC-01.10, AC-05.5, AC-05.8.

### T-09 — Implementar consulta de clima e previsão

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
  - Usa timeout de 10 segundos por requisição e registra `fetchedAt` em ISO
    somente após sucesso.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data · **Prioridade:** P0 · **Tamanho:** M.
- **Rastreabilidade:** FR-02, FR-03, FR-05, FR-06; AC-01.6, AC-02.1, AC-02.3,
  AC-03.1–AC-03.4, AC-05.1, AC-05.5–AC-05.7.

## Entrega 3 — Orquestração do estado

### T-10 — Orquestrar busca e seleção de localidade

- **Descrição:** Implementar no hook a busca por nome/CEP, estados idle/loading/
  empty/error e seleção explícita dos resultados.
- **Critérios de aceite:**
  - Entrada vazia ou CEP inválido é rejeitado sem chamada externa.
  - CEP não resolvido no ViaCEP termina em `empty` e não chama geocoding.
  - Busca por nome e CEP preserva todos os resultados relevantes e exige
    seleção explícita; nenhum resultado é selecionado automaticamente.
  - Uma busca recente invalida respostas anteriores usando cancelamento quando
    possível e controle monotônico de requisição.
- **Dependências:** T-03, T-07, T-08.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data · **Prioridade:** P0 · **Tamanho:** M.
- **Rastreabilidade:** FR-01, FR-06; AC-01.1–AC-01.5, AC-01.8–AC-01.10,
  AC-05.4, AC-05.8.

### T-11 — Gerenciar consulta, atualização e dados desatualizados

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

- **Descrição:** Criar formulário acessível para busca por nome de cidade ou CEP.
- **Critérios de aceite:**
  - Campo e botão têm nomes acessíveis e são operáveis por teclado.
  - Envio encaminha o termo ao hook e impede submissão acidental de formulário.
  - Entrada vazia é comunicada sem expor nem persistir CEP.
- **Dependências:** T-10.
- **Arquivos prováveis:** `src/components/SearchBar.tsx`.
- **Tipo:** UI · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-01, FR-06; AC-01.1–AC-01.4, AC-01.9, AC-01.10.

### T-13 — Exibir resultados de localidades

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

- **Descrição:** Criar apresentação isolada de um dia da previsão.
- **Critérios de aceite:**
  - Apresenta condição, mínima/máxima, probabilidade e volume de precipitação
    quando disponíveis.
  - Campos ausentes são marcados como indisponíveis sem esconder valores
    válidos.
  - Data usa o fuso da cidade e formato pt-BR.
- **Dependências:** T-01, T-04, T-05, T-06.
- **Arquivos prováveis:** `src/components/ForecastCard.tsx`.
- **Tipo:** UI · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-03, FR-04; AC-03.1–AC-03.4, AC-04.2, AC-04.3.

### T-16 — Exibir lista de previsão

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

- **Descrição:** Expor a atualização da cidade selecionada com indicação de
  horário e estado desatualizado.
- **Critérios de aceite:**
  - A ação solicita atualização manual da cidade ativa e não dispara
    atualização periódica.
  - Exibe horário da última consulta bem-sucedida e sinalização após 40 minutos.
  - Falha não apresenta dados antigos como atuais.
- **Dependências:** T-06, T-11.
- **Arquivos prováveis:** `src/components/RefreshButton.tsx`.
- **Tipo:** UI · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-05, FR-06; AC-05.1–AC-05.3, AC-05.5, AC-05.6.

### T-19 — Criar estado de carregamento

- **Descrição:** Apresentar carregamento sem bloquear teclado ou ocultar o
  contexto necessário.
- **Critérios de aceite:**
  - O estado é anunciado semanticamente e pode indicar a etapa em andamento.
  - Controles necessários continuam utilizáveis por teclado.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/components/states/LoadingState.tsx`.
- **Tipo:** UI · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-01, FR-06; AC-05.4.

### T-20 — Criar estado vazio

- **Descrição:** Apresentar busca sem correspondência e permitir nova busca.
- **Critérios de aceite:**
  - A mensagem distingue ausência de resultado de erro de serviço.
  - A pessoa consegue iniciar uma nova busca por teclado.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/components/states/EmptyState.tsx`.
- **Tipo:** UI · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-01, FR-06; AC-01.8, AC-05.8.

### T-21 — Criar estado de erro

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

- **Descrição:** Validar consulta forecast, normalização e falhas usando
  `fetch` simulado.
- **Critérios de aceite:**
  - Testes verificam parâmetros, mapeamento atual/diário e uso do índice zero
    para extremos do dia.
  - Testes cobrem campos ausentes, arrays desalinhados e resposta estruturalmente
    inválida.
  - Testes cobrem HTTP, falha de rede e timeout sem valores fictícios.
- **Dependências:** T-09.
- **Arquivos prováveis:** `tests/services/weatherService.test.ts`.
- **Tipo:** Test · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-02, FR-03, FR-05, FR-06; AC-02.1, AC-02.3,
  AC-03.1–AC-03.4, AC-05.1, AC-05.5–AC-05.7.

### T-30 — Testar estados e concorrência do hook

- **Descrição:** Cobrir ciclo de busca, seleção, atualização e unidade no hook.
- **Critérios de aceite:**
  - Testes cobrem estados idle, loading, success, error e empty.
  - Testes cobrem retry manual, preservação como desatualizado após falha e
    descarte de resposta obsoleta.
  - Testes confirmam que alternar unidade não chama serviços novamente.
- **Dependências:** T-10, T-11.
- **Arquivos prováveis:** `tests/hooks/useWeather.test.ts`.
- **Tipo:** Test · **Prioridade:** P0 · **Tamanho:** M.
- **Rastreabilidade:** FR-01, FR-04–FR-06; AC-04.1–AC-04.4,
  AC-05.1–AC-05.8.

### T-31 — Testar busca e seleção de localidades

- **Descrição:** Testar formulário de busca e lista de resultados com serviços
  simulados.
- **Critérios de aceite:**
  - Testes cobrem envio por teclado, busca vazia e resultados identificados por
    cidade/estado/país.
  - Testes confirmam seleção explícita e ausência de seleção automática.
  - Estados assíncronos relevantes são verificáveis sem depender da rede.
- **Dependências:** T-12, T-13, T-22.
- **Arquivos prováveis:** `tests/components/SearchBar.test.tsx`,
  `tests/components/CityResults.test.tsx`.
- **Tipo:** Test · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-01; AC-01.1–AC-01.6, AC-01.9, AC-01.10.

### T-32 — Testar apresentação de clima e previsão

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

- **Descrição:** Validar o anúncio e a usabilidade do estado loading.
- **Critérios de aceite:**
  - Teste verifica semântica acessível e disponibilidade dos controles por
    teclado conforme implementados.
- **Dependências:** T-19, T-22.
- **Arquivos prováveis:** `tests/components/LoadingState.test.tsx`.
- **Tipo:** Test · **Prioridade:** P0 · **Tamanho:** P.
- **Rastreabilidade:** FR-01, FR-06; AC-05.4.

### T-35 — Testar estado vazio

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

## Rastreabilidade dos requisitos funcionais

| Requisito | Tarefas que o implementam ou verificam |
|---|---|
| FR-01 — Buscar e selecionar localidade | T-01–T-03, T-06–T-08, T-10, T-12–T-13, T-22, T-24, T-27–T-28, T-30–T-31, T-37–T-39 |
| FR-02 — Consultar clima atual | T-01, T-05, T-09, T-11, T-14, T-22, T-26, T-29–T-30, T-32, T-37, T-39 |
| FR-03 — Consultar previsão de cinco dias | T-01, T-05–T-06, T-09, T-11, T-15–T-16, T-23, T-26, T-29–T-30, T-32, T-37, T-39 |
| FR-04 — Alternar unidade | T-01, T-04, T-11, T-14–T-15, T-17, T-23, T-25, T-30, T-32–T-33, T-37 |
| FR-05 — Atualizar dados sob demanda | T-06, T-09, T-11, T-18, T-23, T-26, T-29–T-30, T-33, T-37–T-38 |
| FR-06 — Tratar estados vazios e falhas | T-03, T-07–T-11, T-19–T-23, T-27–T-30, T-34–T-38 |

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
