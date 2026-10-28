# Weather App — Especificação de Produto

## Overview

O Weather App é uma aplicação web responsiva para pessoas no Brasil consultarem as condições meteorológicas de uma cidade. A pessoa pode buscar por nome de cidade ou CEP brasileiro, consultar o clima atual e um resumo diário para hoje e os quatro dias seguintes, e alternar as temperaturas entre Celsius e Fahrenheit.

A interface será em pt-BR. Os dados meteorológicos virão do Open-Meteo. Para buscas por CEP, o ViaCEP resolverá o CEP para cidade e UF; a localidade correspondente será então identificada no Open-Meteo. O produto não exige conta e não persiste dados ou preferências.

## Functional Requirements

- **FR-01 — Buscar e selecionar uma localidade:** aceitar nome de cidade brasileira ou CEP brasileiro. Para CEP, validar e normalizar a entrada, consultar o ViaCEP para obter cidade e UF e localizar a correspondência no Open-Meteo. Apresentar os resultados com cidade, estado e país para seleção explícita.
- **FR-02 — Consultar clima atual:** para a localidade selecionada, apresentar temperatura, condição com descrição em pt-BR e ícone, sensação térmica, umidade, vento em km/h, volume atual de precipitação em mm e temperaturas mínima e máxima do dia.
- **FR-03 — Consultar previsão de cinco dias:** apresentar um resumo diário para hoje e os quatro dias seguintes, com condição, temperaturas mínima e máxima, probabilidade de precipitação e volume esperado em mm.
- **FR-04 — Alternar unidade de temperatura:** iniciar em Celsius e permitir alternar entre Celsius e Fahrenheit. Aplicar a seleção a todas as temperaturas exibidas; manter a escolha somente durante a sessão.
- **FR-05 — Atualizar dados sob demanda:** atualizar após uma busca ou seleção de cidade e oferecer uma ação manual para atualizar os dados da localidade selecionada. Exibir o horário da última atualização e sinalizar os dados como desatualizados quando tiverem mais de 40 minutos.
- **FR-06 — Tratar estados vazios e falhas:** informar quando a busca não retornar resultados ou quando ViaCEP/Open-Meteo estiver indisponível. Oferecer nova tentativa manual, sem repetição automática; nunca apresentar dados antigos como atuais.

## User Stories

- **US-01:** Como pessoa no Brasil que consulta o tempo, quero buscar uma cidade pelo nome ou CEP para encontrar a localidade correta.
- **US-02:** Como pessoa que planeja o dia, quero consultar as condições meteorológicas atuais para decidir como me preparar.
- **US-03:** Como pessoa que planeja os próximos dias, quero ver a previsão de hoje mais quatro dias para organizar minhas atividades.
- **US-04:** Como pessoa que prefere outra unidade de temperatura, quero alternar entre Celsius e Fahrenheit para interpretar os valores com facilidade.
- **US-05:** Como pessoa que consulta a previsão, quero saber quando os dados estão desatualizados ou indisponíveis e poder tentar novamente para avaliar se ainda são úteis.

## Acceptance Criteria

### FR-01 / US-01 — Busca

- **AC-01.1** — **Given** um nome de cidade brasileira válido, **When** a pessoa enviar a busca, **Then** o sistema apresenta localidades correspondentes no Brasil identificadas por cidade, estado e país.
- **AC-01.2** — **Given** um CEP brasileiro válido com oito dígitos, **When** a pessoa buscar, **Then** o sistema consulta o ViaCEP, usa cidade e UF para localizar correspondências no Open-Meteo e apresenta os resultados para seleção.
- **AC-01.3** — **Given** um CEP com pontuação aceita, **When** a pessoa enviar a busca, **Then** o sistema normaliza o valor para oito dígitos antes de consultar o ViaCEP.
- **AC-01.4** — **Given** um CEP com formato inválido ou quantidade diferente de oito dígitos, **When** a busca for enviada, **Then** o sistema informa o erro sem chamar serviços externos.
- **AC-01.5** — **Given** uma busca que retorne mais de uma localidade, **When** os resultados forem apresentados, **Then** cada opção inclui cidade, estado e país e exige seleção explícita; o sistema não escolhe automaticamente o primeiro resultado.
- **AC-01.6** — **Given** uma localidade selecionada, **When** a consulta meteorológica terminar com sucesso, **Then** os dados exibidos correspondem à localidade selecionada.
- **AC-01.7** — **Given** um CEP submetido para busca, **When** a consulta terminar, **Then** a aplicação não o persiste nem o inclui em seus logs.
- **AC-01.8** — **Given** um CEP que o ViaCEP identifique como inexistente ou sem cidade/UF, **When** a busca terminar, **Then** a aplicação informa que não encontrou a localidade e não consulta o Open-Meteo.
- **AC-01.9** — **Given** uma busca vazia ou contendo apenas espaços, **When** for enviada, **Then** a aplicação informa que o termo é obrigatório e não chama serviços externos.
- **AC-01.10** — **Given** um nome contendo acentos, espaços repetidos ou caracteres especiais, **When** a pessoa buscar, **Then** a aplicação trata a entrada sem falhar e apresenta correspondências válidas ou o estado sem resultados.

### FR-02 / US-02 — Clima atual

- **AC-02.1** — **Given** uma localidade selecionada com consulta bem-sucedida, **When** os dados atuais forem exibidos, **Then** a tela mostra temperatura, sensação térmica, condição em texto e ícone, umidade, vento em km/h, precipitação em mm e mínima/máxima do dia.
- **AC-02.2** — **Given** um código de condição meteorológica retornado pelo provedor, **When** a condição for apresentada, **Then** o texto correspondente está em português do Brasil.
- **AC-02.3** — **Given** que o provedor não retorne um dos campos atuais, **When** os demais dados forem exibidos, **Then** o campo ausente é marcado como indisponível sem inventar valor nem ocultar os demais campos válidos.

### FR-03 / US-03 — Previsão

- **AC-03.1** — **Given** uma localidade com previsão disponível, **When** a previsão for exibida, **Then** são apresentados cinco dias locais: hoje e os quatro dias seguintes.
- **AC-03.2** — **Given** cada um dos cinco dias, **When** a previsão diária for exibida, **Then** ela inclui condição, temperaturas mínima e máxima, probabilidade de precipitação e volume esperado em mm, quando fornecidos pelo serviço.
- **AC-03.3** — **Given** uma cidade em fuso horário diferente do dispositivo, **When** os dias forem agrupados e formatados, **Then** as datas seguem o fuso local da cidade e o formato pt-BR.
- **AC-03.4** — **Given** que um campo da previsão esteja ausente para um dia, **When** os demais dados desse dia forem exibidos, **Then** o campo ausente é marcado como indisponível e os valores válidos permanecem visíveis.

### FR-04 / US-04 — Unidades

- **AC-04.1** — **Given** uma nova sessão, **When** a primeira consulta for exibida, **Then** todas as temperaturas são apresentadas em Celsius.
- **AC-04.2** — **Given** uma consulta visível em Celsius, **When** a pessoa selecionar Fahrenheit, **Then** todas as temperaturas, incluindo sensação térmica e mínimas/máximas, passam a Fahrenheit.
- **AC-04.3** — **Given** uma alternância entre Celsius e Fahrenheit, **When** os dados meteorológicos forem atualizados, **Then** umidade, vento em km/h e precipitação em mm não são alterados pela alternância.
- **AC-04.4** — **Given** uma nova sessão após a pessoa ter usado Fahrenheit, **When** uma consulta for exibida, **Then** a unidade volta a Celsius e a escolha anterior não foi persistida localmente nem no servidor.

### FR-05 e FR-06 / US-05 — Atualização e falhas

- **AC-05.1** — **Given** uma busca de localidade ou uma localidade já selecionada, **When** a pessoa envia a busca ou aciona atualizar, **Then** o sistema solicita dados meteorológicos atuais para essa localidade.
- **AC-05.2** — **Given** uma atualização bem-sucedida, **When** os dados forem exibidos, **Then** a interface mostra a data e hora da última atualização em pt-BR.
- **AC-05.3** — **Given** que a última atualização bem-sucedida tenha ocorrido há mais de 40 minutos, **When** os dados forem exibidos, **Then** eles são sinalizados visualmente como desatualizados.
- **AC-05.4** — **Given** uma solicitação em andamento, **When** a pessoa iniciar outra busca, **Then** a interface mostra carregamento e somente o resultado da busca mais recente pode substituir o conteúdo.
- **AC-05.5** — **Given** que ViaCEP ou Open-Meteo falhe ou exceda o timeout definido no plano técnico, **When** a falha for detectada, **Then** a aplicação informa o problema e oferece nova tentativa manual sem repetição automática.
- **AC-05.6** — **Given** que uma atualização falhe e existam dados anteriores, **When** a tela permanecer visível, **Then** os dados anteriores aparecem acompanhados do horário e de sinalização de desatualização, nunca como atuais.
- **AC-05.7** — **Given** uma falha sem dados anteriores, **When** o estado de erro for exibido, **Then** nenhum dado meteorológico fictício é apresentado.
- **AC-05.8** — **Given** que a busca não encontre resultados, **When** a resposta for exibida, **Then** uma mensagem clara informa que a localidade não foi encontrada e permite iniciar uma nova busca.

## Non-Functional Requirements

- **NFR-01 — Responsividade:** a visualização principal deve funcionar a partir de 320 px de largura sem rolagem horizontal; controles e informações devem permanecer utilizáveis em telas móveis.
- **NFR-02 — Desempenho:** em consultas bem-sucedidas, o tempo entre o envio da busca e a renderização dos dados deve ser de até 2 segundos no percentil 95, em conexão estável de banda larga ou 4G. Falhas dos provedores são monitoradas separadamente.
- **NFR-03 — Disponibilidade:** a interface do app deve estar acessível em 99,5% do tempo por mês. A disponibilidade do Open-Meteo e do ViaCEP deve ser monitorada como dependência externa e reportada separadamente.
- **NFR-04 — Atualidade dos dados:** dados com mais de 40 minutos desde a última atualização bem-sucedida devem ser sinalizados como desatualizados.
- **NFR-05 — Acessibilidade:** atender WCAG 2.2 nível AA, incluindo operação por teclado, foco visível, contraste adequado e compatibilidade com leitores de tela. Validar com ferramentas automatizadas e testes manuais de teclado e leitor de tela.
- **NFR-06 — Compatibilidade:** suportar as duas versões principais mais recentes de Chrome, Firefox, Edge e Safari, incluindo Safari no iOS e Chrome no Android.
- **NFR-07 — Idioma e localidade:** interface, mensagens, datas e horários em pt-BR; previsão agrupada pelo fuso horário local da cidade.
- **NFR-08 — Sucesso de uso:** pelo menos 90% das pessoas participantes dos testes de usabilidade devem conseguir buscar uma cidade e consultar o clima sem ajuda. Não é necessária telemetria de usuários para medir esse critério.
- **NFR-09 — Privacidade:** não exigir conta, não persistir dados ou preferências localmente ou em servidor e não registrar CEPs nos logs da aplicação. O CEP é transmitido ao ViaCEP apenas para resolução da localidade.

## Edge Cases

- **Busca vazia ou só com espaços:** informar que a busca é obrigatória e não enviar requisição.
- **CEP malformado ou inexistente:** informar formato inválido localmente; para CEP bem-formado mas inexistente, apresentar resultado vazio sem consultar meteorologia.
- **Caracteres especiais, acentos e espaços no nome:** preservar a entrada como texto de busca, tratar a codificação corretamente e apresentar correspondências ou mensagem sem resultados.
- **CEP sem correspondência meteorológica:** se ViaCEP resolver cidade/UF mas Open-Meteo não tiver localidade correspondente no Brasil/UF, informar que não foi possível localizar a cidade para previsão e permitir nova busca.
- **Resultados de geocodificação ambíguos:** apresentar cada correspondência com cidade, estado e país e exigir seleção da pessoa.
- **Falha, timeout ou limite de requisições no ViaCEP ou Open-Meteo:** informar qual consulta não pôde ser concluída e oferecer retry manual, sem retry automático.
- **Resposta parcial ou campo ausente:** marcar somente os campos indisponíveis; manter visíveis os demais valores recebidos.
- **Busca concorrente:** descartar respostas de buscas anteriores quando uma consulta mais recente já tiver sido enviada.
- **Dados antigos ou ainda não carregados:** sinalizar dados com mais de 40 minutos; se não houver dados prévios, mostrar carregamento ou erro sem valores fictícios.
- **Fuso local diferente do dispositivo ou consulta perto da meia-noite:** agrupar previsão pelas datas locais da cidade selecionada.
- **Mudança de unidade durante carregamento:** renderizar todos os valores de temperatura na unidade atualmente selecionada, sem converter vento, umidade ou precipitação.

## Assumptions

- O MVP atende somente localidades brasileiras e permite consultar uma cidade por vez.
- As User Stories usam personas por tarefa derivadas do contexto de uso; o discovery não estabelece perfis demográficos distintos.
- A busca por CEP usa ViaCEP para obter cidade/UF e Open-Meteo para resolver a localidade e fornecer meteorologia; o CEP não é enviado ao Open-Meteo.
- “Hoje mais quatro dias” é interpretado no fuso horário local da cidade consultada.
- A unidade padrão é Celsius; a seleção de Fahrenheit dura apenas a sessão atual.
- Os dados meteorológicos são atualizados sob demanda, sem atualização periódica automática.
- A disponibilidade de dados depende de serviços externos e pode ser diferente da disponibilidade da interface do app.
- “Clima atual” corresponde aos campos atuais fornecidos pelo Open-Meteo; a aplicação não promete observação direta de uma estação meteorológica local.

## Risks

| Risco | Impacto | Mitigação |
|---|---|---|
| ViaCEP indisponível ou sem cobertura para um CEP | A busca por CEP não consegue resolver a cidade/UF. | Definir timeout, exibir erro com nova tentativa manual e validar cobertura brasileira em teste técnico antes do aceite final. |
| Open-Meteo retorna localidades ambíguas ou incompatíveis com a UF | Pode-se exibir clima da cidade errada. | Filtrar por Brasil e UF, exigir seleção quando houver várias correspondências e testar cidades homônimas. |
| Falha ou limite de requisições de um dos provedores | Busca ou consulta meteorológica fica indisponível. | Tratar erros e timeouts por serviço, não repetir automaticamente e monitorar disponibilidade de cada dependência separadamente. |
| Dados meteorológicos ausentes ou antigos | A pessoa pode interpretar valores incompletos como atuais. | Exibir horário, sinalizar idade superior a 40 minutos e marcar campos ausentes como indisponíveis. |
| O alvo de desempenho depende da rede e de terceiros | A meta de 2 segundos pode não ser atingida mesmo com a interface responsiva. | Medir em conexão estável conforme definido, registrar falhas do provedor separadamente e revisar tempos após integração. |
| Conversão ou formatação incorreta de unidade | Valores podem induzir a interpretação errada do clima. | Testar conversão de todas as temperaturas e manter vento em km/h e precipitação em mm. |

## Out of Scope

- Aplicativo nativo para iOS ou Android.
- Autenticação, contas, sincronização ou persistência em servidor.
- Geolocalização do dispositivo, cidades favoritas e comparação de várias cidades.
- Previsão por hora, alertas meteorológicos ou notificações push.
- Busca de localidades fora do Brasil.
- Atualização automática periódica ou funcionamento offline com cache persistente.
- Analytics de usuários ou armazenamento de CEPs.

## Open Questions

- A cobertura real de CEPs brasileiros pelo ViaCEP e a correspondência cidade/UF no Open-Meteo devem ser confirmadas em um teste técnico antes do aceite final da especificação.
- O timeout de cada serviço deve ser definido no plano técnico antes da implementação; os critérios de erro e retry manual já estão definidos.
- O dispositivo de referência para medir o percentil 95 de desempenho deve ser definido no plano de validação.
- O tamanho da amostra e o protocolo dos testes de usabilidade devem ser definidos antes de avaliar o critério de sucesso de 90%.

## Traceability

| User Story | Requisito(s) funcional(is) | Critérios de aceite | Requisitos não funcionais relevantes |
|---|---|---|---|
| US-01 — Buscar localidade | FR-01 | AC-01.1 a AC-01.10 | NFR-02, NFR-03, NFR-05, NFR-06, NFR-09 |
| US-02 — Consultar clima atual | FR-02 | AC-02.1 a AC-02.3 | NFR-01, NFR-02, NFR-03, NFR-05, NFR-06, NFR-07 |
| US-03 — Consultar previsão | FR-03 | AC-03.1 a AC-03.4 | NFR-01, NFR-02, NFR-03, NFR-05, NFR-06, NFR-07 |
| US-04 — Alternar unidades | FR-04 | AC-04.1 a AC-04.4 | NFR-01, NFR-05, NFR-06, NFR-09 |
| US-05 — Atualização e falhas | FR-05, FR-06 | AC-05.1 a AC-05.8 | NFR-02, NFR-03, NFR-04, NFR-05, NFR-06, NFR-09 |