# Discovery: Weather App

## Contexto

A empresa solicitou uma aplicação de previsão do tempo para que usuários consultem informações meteorológicas de cidades. A experiência deve funcionar em dispositivos móveis e permitir a visualização do clima atual e da previsão para os próximos cinco dias.

Este documento registra os requisitos e decisões iniciais do produto. Os limites de uso do provedor, detalhes de experiência e critérios operacionais ainda precisam ser validados.

## Requisitos Funcionais

- **RF-01 — Buscar localidades:** permitir pesquisar cidades brasileiras pelo nome ou pelo CEP e identificar os resultados por cidade, estado e país.
- **RF-02 — Consultar clima atual:** apresentar temperatura, condição meteorológica com descrição e ícone, sensação térmica, umidade, vento e volume atual de precipitação em milímetros para a cidade selecionada, além das temperaturas mínima e máxima do dia.
- **RF-03 — Consultar previsão:** apresentar um resumo diário para hoje e os quatro dias seguintes, com condição meteorológica, temperaturas mínima e máxima, probabilidade de precipitação e volume esperado em milímetros.
- **RF-04 — Alternar unidades:** permitir alternar entre Celsius e Fahrenheit e aplicar a unidade selecionada a todas as temperaturas exibidas.

## Requisitos Não-Funcionais

- **RNF-01 — Responsividade:** conteúdo e controles devem se adaptar a telas a partir de 320 px de largura, sem rolagem horizontal na visualização principal.
- **RNF-02 — Usabilidade:** busca, consulta e troca de unidade devem ser compreensíveis e fáceis de acessar.
- **RNF-03 — Desempenho:** em consultas bem-sucedidas, apresentar os dados meteorológicos em até 2 segundos no percentil 95, medidos da submissão da busca à renderização dos dados em conexão estável de banda larga ou 4G; falhas do provedor devem ser monitoradas separadamente.
- **RNF-04 — Acessibilidade:** atender ao nível AA da WCAG 2.2, incluindo operação por teclado, foco visível, contraste adequado e compatibilidade com leitores de tela; validar com ferramentas automatizadas e testes manuais de teclado e leitor de tela.
- **RNF-05 — Disponibilidade:** manter a interface do app acessível em 99,5% do tempo por mês; monitorar separadamente a disponibilidade do Open-Meteo e informar claramente quando os dados não puderem ser atualizados.
- **RNF-06 — Atualização dos dados:** atualizar os dados ao buscar ou selecionar uma cidade e sob solicitação manual; exibir o horário da última atualização e sinalizar os dados como desatualizados após 40 minutos.
- **RNF-07 — Compatibilidade:** suportar as duas versões principais mais recentes de Chrome, Firefox, Edge e Safari, incluindo Safari no iOS e Chrome no Android.
- **RNF-08 — Sucesso de uso:** pelo menos 90% dos participantes dos testes de usabilidade devem conseguir buscar uma cidade e consultar o clima sem ajuda.

As metas de desempenho e disponibilidade e o limite de 40 minutos para sinalizar dados desatualizados foram definidos para o MVP. A frequência de atualização e a disponibilidade do provedor devem ser consideradas ao interpretar esse limite.

## Riscos

- **Indisponibilidade da fonte de dados:** falhas ou lentidão no serviço meteorológico podem impedir ou atrasar consultas.
- **Resultados ambíguos:** cidades com nomes iguais ou semelhantes podem levar à seleção de uma localização incorreta.
- **Dependências da busca por CEP:** a consulta depende da disponibilidade e cobertura do ViaCEP, além do mapeamento correto de cidade/UF para os resultados do Open-Meteo.
- **Dados desatualizados ou imprecisos:** a aplicação depende da qualidade e da frequência de atualização da fonte meteorológica.
- **Conversão ou apresentação incorreta de unidades:** inconsistências entre Celsius e Fahrenheit podem comprometer a interpretação dos dados.
- **Limitações em telas pequenas:** informações ou controles podem ficar difíceis de visualizar e usar em dispositivos móveis.

## Decisões

- **Fonte de dados — Open-Meteo, sem API key:** usar Open-Meteo para obter os dados meteorológicos. Isso simplifica a integração inicial e evita gerenciamento de chave de API; resolve a pergunta sobre qual provedor será usado. Limites e disponibilidade do provedor ainda precisam ser considerados.
- **Busca por CEP — ViaCEP seguido de Open-Meteo:** normalizar e validar o CEP brasileiro, consultar o ViaCEP para obter cidade e UF e então buscar a localidade no Open-Meteo, filtrando os resultados para Brasil e estado correspondente. Não selecionar o primeiro resultado sem validar a correspondência. CEP inválido ou sem localidade correspondente gera estado sem resultados; indisponibilidade de serviço gera erro com nova tentativa manual. Não registrar nem persistir o CEP; ele será transmitido ao ViaCEP para a consulta.
- **Previsão — resumo diário de hoje mais quatro dias:** apresentar condição, temperaturas mínima/máxima, probabilidade de precipitação e volume esperado em milímetros para o dia atual e os quatro seguintes. Previsão por hora fica fora do escopo do MVP.
- **Unidade padrão — Celsius:** exibir temperaturas em Celsius inicialmente, mantendo a opção de alternar para Fahrenheit. A escolha permanece somente durante a sessão, conforme decisão registrada.
- **Preferência de unidade — somente durante a sessão:** manter a unidade escolhida durante a sessão e voltar a Celsius em uma nova visita, sem persistir a preferência localmente nem no servidor.
- **Unidade de vento — km/h:** exibir a velocidade do vento em quilômetros por hora, unidade familiar para o público geral no Brasil.
- **Atualização — sob demanda:** atualizar ao buscar ou selecionar uma cidade e quando o usuário solicitar atualização manual; não fazer atualização periódica automática. Isso limita chamadas desnecessárias ao provedor; o horário da última consulta será exibido.
- **Dados desatualizados — 40 minutos:** sinalizar os dados como desatualizados quando a última atualização tiver mais de 40 minutos. Isso define o limite para comunicar a idade dos dados sem afirmar que eles continuam atuais.
- **Desempenho — p95 de até 2 segundos:** medir consultas bem-sucedidas da submissão da busca à renderização dos dados em conexão estável de banda larga ou 4G; monitorar falhas do provedor separadamente.
- **Disponibilidade — app e provedor separados:** definir 99,5% ao mês para a interface do app e monitorar a disponibilidade dos dados do Open-Meteo como dependência externa, sem assumir SLA do provedor.
- **Compatibilidade — navegadores atuais:** suportar as duas versões principais mais recentes de Chrome, Firefox, Edge e Safari, incluindo Safari no iOS e Chrome no Android.
- **Acessibilidade — validação WCAG 2.2 AA:** combinar verificações automatizadas com testes manuais de teclado e leitor de tela.
- **Métrica de sucesso — conclusão de tarefa:** pelo menos 90% dos participantes dos testes de usabilidade devem buscar uma cidade e consultar o clima sem ajuda; não exige telemetria de usuários no MVP.
- **Sem autenticação e sem persistência:** permitir o uso sem conta e não armazenar preferências nem dados do usuário localmente ou em servidor; a unidade fica apenas na sessão.
- **Idioma da interface — pt-BR:** apresentar a interface, datas e horários em formato pt-BR; agrupar a previsão pelo fuso horário local da cidade consultada.
- **Localização — busca manual restrita ao Brasil:** não solicitar geolocalização nem oferecer cidades favoritas no MVP; permitir busca por nome de cidade brasileira ou CEP e identificar os resultados por cidade, estado e país.
- **Campos meteorológicos:** incluir temperatura, condição com descrição e ícone, sensação térmica, umidade, vento, volume atual de precipitação, além de mínima/máxima do dia; a previsão diária inclui probabilidade e volume esperado de precipitação em milímetros.
- **Busca sem resultados e falha de atualização:** informar claramente quando não houver resultados; se a atualização falhar, mostrar o horário da última atualização e oferecer nova tentativa manual, sem retry automático nem apresentar dados antigos como atuais.
- **Precipitação — probabilidade e volume:** exibir a probabilidade de precipitação e o volume esperado por dia, ambos fornecidos pelo provedor, além do volume atual quando disponível. Volumes são apresentados em milímetros.

## Suposições

- A busca é manual, restrita ao Brasil e permite consultar uma cidade por vez pelo nome ou CEP; geolocalização e favoritas não fazem parte do MVP.
- O usuário seleciona explicitamente uma cidade antes de visualizar seus dados.
- A previsão apresenta resumo diário com condição e temperaturas mínima/máxima para hoje e os quatro dias seguintes, conforme a decisão registrada.
- A previsão diária apresenta probabilidade de precipitação e volume esperado em milímetros; o volume atual também é informado quando disponível.
- A velocidade do vento é exibida em quilômetros por hora (km/h).
- A preferência de unidade dura somente durante a sessão e volta a Celsius em uma nova visita.
- Os dados são atualizados ao buscar ou selecionar uma cidade e por solicitação manual, sem atualização periódica automática.
- Os dados são sinalizados como desatualizados após 40 minutos desde a última atualização.
- A meta de desempenho p95 de até 2 segundos aplica-se a consultas bem-sucedidas em conexão estável; a disponibilidade mensal de 99,5% aplica-se à interface do app, não ao provedor externo.
- A troca entre Celsius e Fahrenheit altera a unidade exibida, sem mudar a cidade ou o período consultado; a preferência não é sincronizada por servidor.
- Se a busca não retornar resultados, o app informa o usuário; se a atualização falhar, oferece nova tentativa manual e mostra o horário da última atualização, sem retry automático nem dados antigos apresentados como atuais.
- Datas e horários são formatados em pt-BR e seguem o fuso horário local da cidade consultada.
- A compatibilidade cobre as duas versões principais mais recentes dos navegadores definidos, e pelo menos 90% dos participantes dos testes de usabilidade concluem a consulta sem ajuda.
- “Usar em dispositivos móveis” implica uma interface responsiva, sem exigir um aplicativo nativo.
- O aplicativo usará Open-Meteo sem API key, conforme a decisão registrada.
- O usuário poderá acessar as funcionalidades sem criar uma conta; dados não serão persistidos e a unidade escolhida permanecerá apenas durante a sessão.
- A interface será apresentada em português do Brasil, conforme a decisão registrada.