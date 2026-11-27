# ERA: Evolution — Ciclo 17 · Consolidação técnica (primeira rodada)

## Diagnóstico do disparo distante

O código da versão 1.6.0 tinha duas limitações mensuráveis:

1. Os projéteis descontavam `delta` completo do tempo de vida, mas o deslocamento era limitado a 40 ms por frame. Em 18 FPS (~55,6 ms), percorriam somente ~72% do alcance esperado antes de desaparecerem.
2. A verificação de acerto usava o **ponto dos pés** (`creature.y - 8`), enquanto os sprites ocupam uma região vertical mais alta. Isso fazia tiros que atravessavam visualmente o corpo não registrarem dano. Além disso, tiros laterais do Leque Prismático são deliberadamente angulados e podem errar.

## Correções implementadas

- Movimento dos projéteis simulado em subetapas de até 24 ms, com distância e duração compatíveis em FPS diferentes.
- Colisão contínua do segmento percorrido no frame contra cápsulas verticais aproximando a **silhueta** do corpo dos inimigos e chefes.
- Alvos selecionados pelo centro visual do corpo, mantendo o Leque Prismático com projéteis divergentes (sem mira automática para cada projétil).
- Indicador F4 ampliado com **acertos / projéteis disparados** para verificar precisão em campo. Em ataques perfurantes ou com explosão, um único tiro pode causar mais de um acerto.

## Desempenho

- HUD usa atualização condicional dos textos, cores e tamanho da fonte; impede recriar texturas do texto se nada mudou.
- Depuração de rotas F3 não limpa nem redesenha seu objeto `Graphics` continuamente quando desativada.
- Texturas dos sprites só são redefinidas ao mudar o quadro da animação.
- O desenho estático das centenas de tiles do terreno pode ser transformado numa textura de imagem. O recurso inclui fallback para GPUs com texturas pequenas e limpa a textura ao trocar de era.
- O FPS real varia entre placas, navegadores, modo de economia e densidade de entidades. O indicador F4 permite confrontar as Eras 01 e 04 a 0, 40 e 90 eliminações. **Não afirmar melhoria de FPS em percentagem sem benchmark na mesma máquina.**

## Balanceamento de todas as dez eras

- Inimigos comuns continuam com 3 pontos de vida; velocidade e agressividade continuam progressivas a cada dez eliminações e entre eras.
- Os máximos simultâneos por era vão de 17 (Cretáceo) a 26 (Extinção), mas são alcançados progressivamente durante a era.
- As cinco armas continuam com perfis distintos; as melhorias são preservadas entre eras, com escalada de poder. Evitar alterações drásticas antes dos testes comparativos do Ciclo 17.
- O tempo do tiro e a colisão deixaram de variar artificialmente com o FPS: isso aumenta a previsibilidade e também representa um ajuste de equilíbrio no combate.

## Interface e próximas verificações

- Ajustado o posicionamento do título na tela de transição para ficar dentro do painel.
- F4 agora permite inspecionar FPS, criaturas, projéteis e proporção acumulada de impactos/disparos.
- O polimento visual completo (arte, animações, efeitos sonoros, contraste, HUD móvel) e a otimização de objetos estáticos de cenário permanecem como próximos trabalhos.

## Roteiro de validação manual

1. Na Era 10, escolher Lança Solar ou Artefato Verde e verificar dano em criaturas distantes dentro do alcance da arma. Tentar também o Leque Prismático, observando que seus tiros laterais não são teleguiados.
2. Pressionar F4 e observar FPS e impactos/disparos nas Eras 01, 04 e 10 em situações equivalentes.
3. Testar cada chefe diretamente com `?testeChefe=N`, principalmente tiros nas partes altas de chefes grandes.
4. Mover-se pela arena, recolher fragmentos, obter relíquias, trocar armas e testar a esquiva.
5. Testar uma transição entre eras e o título de conclusão do capítulo.
