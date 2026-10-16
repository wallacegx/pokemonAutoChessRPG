import { Pkm } from "../types/enum/Pokemon"
import { Item } from "../types/enum/Item"
import { PokemonInstance } from "./pokemon-instance"
import { PlayerBox } from "./box"
import { PlayerInventory, ItemRank } from "./items-salvage"
import { STAGES_DATABASE } from "./stages"
import { CaptureSystem, PokeballType } from "./capture"
import { LocalBattleRunner } from "./battle-runner"

function separator(title: string) {
  console.log("\n" + "=".repeat(65))
  console.log(`  🌟 ${title.toUpperCase()}`)
  console.log("=".repeat(65))
}

export function runRpgDemo() {
  separator("1. CRIANDO O JOGADOR E INICIAL")
  
  // 1. Cria a Box e o Inventário do Jogador
  const box = new PlayerBox()
  const inventory = new PlayerInventory()

  // 2. Cria o Pokémon inicial do jogador (ex: Charmander Nv. 5)
  const starter = new PokemonInstance({
    species: Pkm.CHARMANDER,
    level: 5,
    nickname: "Flamez",
    shinyChance: 0.10 // 10% de chance para teste
  })

  box.add(starter)

  console.log(`🎮 Treinador iniciou sua jornada com ${starter.species} ${starter.shiny ? "✨(SHINY!)" : ""}!`)
  console.log(`📊 Status do Inicial (Nv.${starter.level}):`)
  console.log(`   - HP: ${starter.maxHP}`)
  console.log(`   - Ataque: ${starter.atk}`)
  console.log(`   - Defesa: ${starter.def}`)
  console.log(`   - Velocidade: ${starter.speed}`)
  console.log(`   - IVs: [HP: ${starter.ivs.hp}/33, Atk: ${starter.ivs.atk}/33, Def: ${starter.ivs.def}/33, Spe: ${starter.ivs.speed}/33]`)

  separator("2. CARREGANDO FASE 1: ROTA 1 (WILD - 2 INIMIGOS)")
  const stage1 = STAGES_DATABASE["stage_route_1"]
  console.log(`📍 Fase Selecionada: ${stage1.name}`)
  console.log(`   - Tipo: ${stage1.type} (Permite Captura)`)
  console.log(`   - Bioma: ${stage1.biome}`)
  console.log(`   - Inimigos no campo: ${stage1.enemies.map(e => `${e.species} (Nv.${e.level})`).join(", ")} (${stage1.enemies.length} inimigos)`)

  separator("3. TESTANDO AS REGRAS E TRAVAS DO TABULEIRO")
  // Teste A: Tentar posicionar na linha inimiga (Y = 1)
  const testEnemyZone = box.placeOnGrid(starter.uid, 3, 1, stage1)
  console.log(`🚫 Teste Y=1 (Zona Inimiga): ${testEnemyZone.message}`)

  // Teste B: Tentar posicionar em cima de um obstáculo (X=3, Y=2)
  const testObstacle = box.placeOnGrid(starter.uid, 3, 2, stage1)
  console.log(`🚫 Teste Célula com Obstáculo: ${testObstacle.message}`)

  // Teste C: Posicionar corretamente na zona do jogador (X=3, Y=4)
  const validPlacement = box.placeOnGrid(starter.uid, 3, 4, stage1)
  console.log(`✅ Posicionamento Válido: ${validPlacement.message}`)

  separator("4. INICIANDO O COMBATE AUTOMÁTICO NA GRID 8x6")
  const activeTeam = box.getActiveBattleTeam()
  const battleResult = LocalBattleRunner.runBattle(activeTeam, stage1, inventory)

  // Imprime o log da batalha
  battleResult.log.forEach(line => console.log(`   ${line}`))

  separator("5. SISTEMA DE CAPTURA PÓS-FASE (WILD STAGE)")
  if (battleResult.captureCandidate) {
    const candidate = battleResult.captureCandidate
    console.log(`🎯 Você encontrou um ${candidate.species} (Nv.${candidate.level}) enfraquecido!`)
    console.log(`🎒 Arremessando uma GREAT BALL (Multiplicador 1.5x)...`)

    const captureResult = CaptureSystem.attemptCapture(
      candidate.species,
      candidate.level,
      PokeballType.GREAT_BALL
    )

    console.log(`📢 ${captureResult.message}`)

    if (captureResult.success && captureResult.pokemon) {
      box.add(captureResult.pokemon)
      const p = captureResult.pokemon
      console.log(`✨ Pokémon Adicionado à sua Box!`)
      console.log(`   - Espécie: ${p.species} ${p.shiny ? "✨(SHINY!)" : ""}`)
      console.log(`   - Nível: ${p.level}`)
      console.log(`   - HP: ${p.maxHP} | Atk: ${p.atk} | Def: ${p.def} | Speed: ${p.speed}`)
      console.log(`   - IVs Sorteados: [HP: ${p.ivs.hp}/33, Atk: ${p.ivs.atk}/33, Def: ${p.ivs.def}/33, Spe: ${p.ivs.speed}/33]`)
      console.log(`📦 Total de Pokémon na sua Box agora: ${box.pokemons.length}`)
    }
  }

  separator("6. SISTEMA DE DROPS, DESMANCHE (SALVAGE) E UPGRADE")
  console.log(`🎒 Itens dropados nesta vitória:`)
  inventory.items.forEach(it => {
    console.log(`   - ${it.itemId} (Rank ${it.rank})`)
  })

  // Adiciona um item duplicado para desmanchar
  const junkItem = inventory.addItem(Item.SILK_SCARF, ItemRank.RANK_D)
  console.log(`\n♻️ Desmanchando item repetido: ${junkItem.itemId} (Rank ${junkItem.rank})...`)
  const salvageResult = inventory.salvageItem(junkItem.uid)
  console.log(`   ${salvageResult.message}`)
  console.log(`   💰 Saldo atual de Sucatas de Aprimoramento: ${inventory.upgradeScrap}`)

  // Adiciona sucata suficiente para testar o upgrade
  inventory.upgradeScrap += 100
  if (inventory.items.length > 0) {
    const itemToUpgrade = inventory.items[0]
    console.log(`\n⬆️ Aprimorando ${itemToUpgrade.itemId} de Rank ${itemToUpgrade.rank}...`)
    const upgradeResult = inventory.upgradeItem(itemToUpgrade.uid)
    console.log(`   ${upgradeResult.message}`)
    console.log(`   Novos sub-status do item:`, itemToUpgrade.subStats)
  }

  separator("7. PREPARANDO DUELO DO GINÁSIO DO BROCK (FASE 3 - TRAINER)")
  const gymStage = STAGES_DATABASE["stage_pewter_gym"]
  console.log(`🏛️ Desafio do Ginásio: ${gymStage.name}`)
  console.log(`   - Tipo: ${gymStage.type} (Sem Captura - Duelo de Treinador)`)
  console.log(`   - Inimigos do Brock: ${gymStage.enemies.map(e => `${e.species} (Nv.${e.level})`).join(" & ")}`)

  // Limpa o grid anterior e coloca os 2 Pokémon do jogador
  box.clearGrid()
  box.placeOnGrid(box.pokemons[0].uid, 3, 5, gymStage)
  if (box.pokemons[1]) {
    box.placeOnGrid(box.pokemons[1].uid, 4, 5, gymStage)
  }

  console.log(`🛡️ Seu Time Posicionado:`)
  box.getActiveBattleTeam().forEach(p => {
    console.log(`   - ${p.pokemon.species} em (${p.x}, ${p.y}) - Nv.${p.pokemon.level}`)
  })

  const gymBattle = LocalBattleRunner.runBattle(box.getActiveBattleTeam(), gymStage, inventory)
  gymBattle.log.slice(0, 8).forEach(l => console.log(`   ${l}`))
  console.log(`   ... [Combate Intenso] ...`)
  gymBattle.log.slice(-4).forEach(l => console.log(`   ${l}`))

  separator("FIM DA DEMONSTRAÇÃO - TODOS OS SISTEMAS CONECTADOS COM SUCESSO!")
}

// Executa se chamado diretamente
runRpgDemo()
