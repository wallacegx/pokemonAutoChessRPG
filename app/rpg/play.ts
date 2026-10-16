import * as readline from "readline/promises"
import { stdin as input, stdout as output } from "process"
import { Pkm } from "../types/enum/Pokemon"
import { Item } from "../types/enum/Item"
import { SaveManager, ISaveData } from "./save-manager"
import { PrologueManager } from "./prologue"
import { STAGES_DATABASE, IRpgStage, StageType } from "./stages"
import { LocalBattleRunner } from "./battle-runner"
import { CaptureSystem, PokeballType } from "./capture"
import { PlayerBox } from "./box"
import { PlayerInventory } from "./items-salvage"

const rl = readline.createInterface({ input, output })

function clear() {
  console.clear()
}

function divider(char = "=", length = 65) {
  console.log(char.repeat(length))
}

function banner() {
  divider("=")
  console.log("   ⚡ POKÉMON AUTO-CHESS: STANDALONE RPG CAMPAIGN ⚡")
  console.log("             Edição Clássica de Kanto")
  divider("=")
}

async function prompt(questionText: string): Promise<string> {
  const answer = await rl.question(questionText)
  return answer.trim()
}

async function pause(): Promise<void> {
  await prompt("\n[Pressione ENTER para continuar...]")
}

// ==========================================
// PRÓLOGO DO PROFESSOR CARVALHO
// ==========================================
async function runPrologueFlow(): Promise<{
  playerName: string
  gold: number
  box: PlayerBox
  inventory: PlayerInventory
  pokeballs: Record<PokeballType, number>
  currentStageId: string
  completedStages: string[]
}> {
  clear()
  banner()
  console.log("\n👴 PROF. CARVALHO:")
  console.log('   "Olá, jovem aspirante a Treinador Pokémon!"')
  console.log('   "Antes de você sair pelo mundo desbravando Kanto, preciso testar')
  console.log('    sua aptidão no combate tático de tabuleiro 8x6!"')
  console.log()

  let playerName = await prompt("👉 Como você se chama, Treinador? (Padrão: Red): ")
  if (!playerName) playerName = "Red"

  console.log(`\n👴 PROF. CARVALHO:`)
  console.log(`   "Muito bem, ${playerName}! Três monstrinhos acabaram de escapar`)
  console.log(`    das minhas bancadas do laboratório e estão inquietos no campo!"`)
  console.log(`   "Para este teste, vou te emprestar temporariamente o meu fiel PIKACHU veterano (Nv. 25)!"`)
  console.log(`   "Ele está posicionado na sua retaguarda (Linha Y=4). Observe como ele luta!"`)

  await pause()

  clear()
  divider("-")
  console.log("⚔️ BATALHA DE TUTORIAL: PIKACHU DO CARVALHO vs BULBASAUR, SQUIRTLE & CHARMANDER")
  divider("-")

  const tutorialBattle = PrologueManager.runTutorialBattle()
  tutorialBattle.log.forEach(l => console.log(`   ${l}`))

  console.log("\n🎉 VITÓRIA DO PIKACHU!")
  console.log("\n👴 PROF. CARVALHO:")
  console.log('   "Sensacional! Você entendeu a movimentação, o ataque e o acúmulo de PP!"')
  console.log('   "Todos os 3 iniciais ficaram impressionados com sua habilidade."')
  console.log('   "Como prometido, agora você pode escolher e capturar 1 DELES!')
  console.log('    Tome esta Pokébola Especial do Laboratório (100% de Taxa de Captura)!"')

  console.log("\nQUAL INICIAL VOCÊ DESEJA ESCOLHER PARA SUA JORNADA?")
  console.log("   [1] 🌱 Bulbasaur (Planta / Veneno) - Golpe: Vine Whip")
  console.log("   [2] 🔥 Charmander (Fogo) - Golpe: Fire Spin")
  console.log("   [3] 💧 Squirtle (Água) - Golpe: Aqua Jet")
  console.log("   [0] ⚡ Fechar Captura (Não quero nenhum dos três...)")

  let choice = await prompt("\n👉 Escolha [1, 2, 3 ou 0]: ")
  while (choice !== "1" && choice !== "2" && choice !== "3" && choice !== "0") {
    choice = await prompt("Opção inválida! Digite 1, 2, 3 ou 0 (Fechar): ")
  }

  const isPikachuSecret = choice === "0"
  const starterSpecies = isPikachuSecret
    ? Pkm.PIKACHU
    : choice === "1"
    ? Pkm.BULBASAUR
    : choice === "2"
    ? Pkm.CHARMANDER
    : Pkm.SQUIRTLE
  
  clear()
  divider("*")
  if (isPikachuSecret) {
    console.log("❌ Você fechou a captura e recusou os três iniciais de Kanto!")
    console.log("\n👴 PROF. CARVALHO:")
    console.log('   "Espere aí! Você não quer o Bulbasaur, nem o Charmander, nem o Squirtle?!"')
    console.log('   "Pika... PIKACHU! ⚡"')
    console.log('   "Hahaha! Parece que você e o Pikachu criaram uma conexão incrível na batalha!"')
    console.log('   "Ele se recusa a voltar para o laboratório e decidiu continuar com você como seu parceiro oficial!"')
    console.log("   1... 2... 3... CLIQUE! ⭐")
    console.log("🎉 PIKACHU (Nv. 25) do Carvalho decidiu ficar no seu time para a jornada!")
  } else {
    console.log(`🎯 Você arremessou a Pokébola Especial do Laboratório em ${starterSpecies}...`)
    console.log("   1... 2... 3... CLIQUE! ⭐")
    console.log(`🎉 Gotcha! ${starterSpecies} foi capturado com 100% de sucesso!`)
  }
  divider("*")

  const prologueResult = PrologueManager.finishPrologue(playerName, starterSpecies)
  const starter = prologueResult.starter

  console.log(`\n📊 DADOS DO SEU INICIAL:`)
  console.log(`   - Espécie: ${starter.species} ${starter.shiny ? "✨(SHINY!)" : ""}`)
  console.log(`   - Nível: ${starter.level}`)
  console.log(`   - HP: ${starter.maxHP}`)
  console.log(`   - Ataque: ${starter.atk}`)
  console.log(`   - Defesa: ${starter.def}`)
  console.log(`   - Velocidade: ${starter.speed}`)
  console.log(`   - IVs: [HP: ${starter.ivs.hp}/33, Atk: ${starter.ivs.atk}/33, Def: ${starter.ivs.def}/33, Spe: ${starter.ivs.speed}/33]`)

  console.log(`\n👴 PROF. CARVALHO:`)
  if (isPikachuSecret) {
    console.log(`   "Cuide muito bem do Pikachu, ${playerName}! Ele tem uma eletricidade muito especial!"`)
  } else {
    console.log(`   "O meu Pikachu volta comigo para o laboratório."`)
    console.log(`   "Agora a sua aventura começa com o seu próprio ${starter.species}!"`)
  }
  console.log(`   "Tome aqui de presente 5 Pokébolas, 1 Great Ball, 1 Cachecol de Seda e 150 Moedas."`)
  console.log(`   "Siga para o norte até a Rota 1. Boa sorte, ${playerName}!"`)

  console.log(`\n💾 Jogo inicial salvo com sucesso em save.json!`)
  await pause()

  return {
    playerName,
    gold: 150,
    box: prologueResult.box,
    inventory: prologueResult.inventory,
    pokeballs: prologueResult.pokeballs,
    currentStageId: "stage_route_1",
    completedStages: ["stage_oak_lab"]
  }
}

// ==========================================
// LOOP PRINCIPAL DO JOGO
// ==========================================
async function main() {
  clear()
  banner()

  let playerName = "Red"
  let gold = 150
  let box: PlayerBox
  let inventory: PlayerInventory
  let pokeballs: Record<PokeballType, number>
  let currentStageId = "stage_route_1"
  let completedStages: string[] = []

  // Verifica se existe save salvo
  if (!SaveManager.hasSave()) {
    console.log("Nenhum save encontrado. Iniciando Prólogo do Laboratório...")
    await pause()
    const initData = await runPrologueFlow()
    playerName = initData.playerName
    gold = initData.gold
    box = initData.box
    inventory = initData.inventory
    pokeballs = initData.pokeballs
    currentStageId = initData.currentStageId
    completedStages = initData.completedStages
  } else {
    const loaded = SaveManager.loadSave()!
    const restored = SaveManager.restoreGameState(loaded)
    playerName = loaded.player.name
    gold = loaded.player.gold
    box = restored.box
    inventory = restored.inventory
    pokeballs = restored.pokeballs
    currentStageId = loaded.progress.currentStageId
    completedStages = loaded.progress.completedStages
    console.log(`✅ Save carregado com sucesso! Bem-vindo de volta, ${playerName}!`)
    console.log(`   - Pokémons na Box: ${box.pokemons.length}`)
    console.log(`   - Moedas: $${gold} | Sucata: ${inventory.upgradeScrap}`)
    console.log(`   - Próxima Fase: ${currentStageId}`)
    await pause()
  }

  function saveCurrentGame() {
    SaveManager.saveGame(
      playerName,
      gold,
      inventory,
      pokeballs,
      box,
      currentStageId,
      completedStages
    )
  }

  // LOOP DO MENU
  while (true) {
    clear()
    banner()
    const stage = STAGES_DATABASE[currentStageId] || STAGES_DATABASE["stage_route_1"]
    console.log(`👤 Treinador: ${playerName} | 💰 Moedas: $${gold} | ⚙️ Sucata: ${inventory.upgradeScrap}`)
    console.log(`📍 Fase Atual: ${stage.name} (${stage.type === StageType.WILD ? "🌿 Selvagem" : "🏛️ Treinador"})`)
    console.log(`👥 Time no Campo (${box.placements.size}/${Math.min(stage.enemies.length, 6)}): ${box.getActiveBattleTeam().map(t => `${t.pokemon.species} Nv.${t.pokemon.level}`).join(", ") || "(Vazio)"}`)
    divider("-")
    console.log("ESCOLHA UMA AÇÃO:")
    console.log("  [1] ⚔️ Batalhar na Fase Atual")
    console.log("  [2] 📦 Minha Box & Posicionamento no Tabuleiro")
    console.log("  [3] 🎒 Mochila (Itens, Pokébolas, Aprimorar)")
    console.log("  [4] 🗺️ Selecionar Outra Fase")
    console.log("  [5] 💾 Salvar Jogo")
    console.log("  [9] 🗑️ Reiniciar Jogo (Novo Prólogo)")
    console.log("  [0] 🚪 Sair do Jogo")
    divider("-")

    const option = await prompt("👉 Opção: ")

    if (option === "1") {
      // BATALHAR NA FASE ATUAL
      await battleFlow(stage)
    } else if (option === "2") {
      // BOX & POSICIONAMENTO
      await boxMenuFlow(stage)
    } else if (option === "3") {
      // MOCHILA
      await inventoryMenuFlow()
    } else if (option === "4") {
      // SELECIONAR FASE
      await stageSelectFlow()
    } else if (option === "5") {
      saveCurrentGame()
      console.log("\n✅ Jogo salvo com sucesso!")
      await pause()
    } else if (option === "9") {
      const confirm = await prompt("⚠️ Tem certeza que deseja apagar o save e recomeçar do Prólogo? (s/N): ")
      if (confirm.toLowerCase() === "s") {
        SaveManager.deleteSave()
        const initData = await runPrologueFlow()
        playerName = initData.playerName
        gold = initData.gold
        box = initData.box
        inventory = initData.inventory
        pokeballs = initData.pokeballs
        currentStageId = initData.currentStageId
        completedStages = initData.completedStages
      }
    } else if (option === "0") {
      saveCurrentGame()
      console.log(`\n👋 Até a próxima aventura, ${playerName}! Progresso salvo.`)
      break
    }
  }

  rl.close()

  // ==========================================
  // SUB-FLUXOS DO JOGO
  // ==========================================

  async function battleFlow(stage: IRpgStage) {
    clear()
    divider("=")
    console.log(`⚔️ INICIANDO COMBATE: ${stage.name}`)
    console.log(`   - Bioma: ${stage.biome}`)
    console.log(`   - Inimigos: ${stage.enemies.map(e => `${e.species} (Nv.${e.level})`).join(", ")}`)
    divider("=")

    const activeTeam = box.getActiveBattleTeam()
    if (activeTeam.length === 0) {
      console.log("\n❌ Seu time no tabuleiro está vazio! Vá em [2] Minha Box e posicione pelo menos 1 Pokémon!")
      await pause()
      return
    }

    console.log(`\n🛡️ Seu Time Posicionado:`)
    activeTeam.forEach(t => {
      console.log(`   - ${t.pokemon.species} ${t.pokemon.shiny ? "✨" : ""} (Nv.${t.pokemon.level}) em (${t.x}, ${t.y}) | HP: ${t.pokemon.maxHP} | Atk: ${t.pokemon.atk}`)
    })

    const ready = await prompt("\n👉 Iniciar o combate agora? (S/n): ")
    if (ready.toLowerCase() === "n") return

    clear()
    divider("-")
    console.log("🥊 RELATÓRIO DO COMBATE:")
    divider("-")

    const result = LocalBattleRunner.runBattle(activeTeam, stage, inventory)
    result.log.forEach(l => console.log(`   ${l}`))

    divider("-")
    if (result.winner === "PLAYER") {
      console.log("🎉 VITÓRIA! O campo foi dominado pelo seu time!")
      gold += stage.rewards.gold
      console.log(`💰 +$${stage.rewards.gold} Moedas ganhas!`)

      if (!completedStages.includes(stage.id)) {
        completedStages.push(stage.id)
      }

      // Se for WILD e tiver candidato a captura
      if (stage.type === StageType.WILD && result.captureCandidate) {
        const candidate = result.captureCandidate
        console.log(`\n🎯 Um ${candidate.species} selvagem (Nv.${candidate.level}) foi enfraquecido e está vulnerável!`)
        console.log(`🎒 SUAS POKÉBOLAS:`)
        console.log(`   [1] Pokéball (${pokeballs[PokeballType.POKEBALL]} disponíveis)`)
        console.log(`   [2] Great Ball (${pokeballs[PokeballType.GREAT_BALL]} disponíveis)`)
        console.log(`   [3] Ultra Ball (${pokeballs[PokeballType.ULTRA_BALL]} disponíveis)`)
        console.log(`   [0] Não capturar`)

        const ballChoice = await prompt("👉 Qual bola arremessar? [1, 2, 3 ou 0]: ")
        let selectedBall: PokeballType | null = null

        if (ballChoice === "1" && pokeballs[PokeballType.POKEBALL] > 0) {
          pokeballs[PokeballType.POKEBALL]--
          selectedBall = PokeballType.POKEBALL
        } else if (ballChoice === "2" && pokeballs[PokeballType.GREAT_BALL] > 0) {
          pokeballs[PokeballType.GREAT_BALL]--
          selectedBall = PokeballType.GREAT_BALL
        } else if (ballChoice === "3" && pokeballs[PokeballType.ULTRA_BALL] > 0) {
          pokeballs[PokeballType.ULTRA_BALL]--
          selectedBall = PokeballType.ULTRA_BALL
        }

        if (selectedBall) {
          console.log(`\nArremessando ${selectedBall}...`)
          const capResult = CaptureSystem.attemptCapture(candidate.species, candidate.level, selectedBall)
          console.log(`📢 ${capResult.message}`)
          if (capResult.success && capResult.pokemon) {
            box.add(capResult.pokemon)
            console.log(`✨ ${capResult.pokemon.species} ${capResult.pokemon.shiny ? "✨" : ""} foi enviado para a sua Box!`)
          }
        }
      }

      // Desbloqueia próxima fase se houver
      const allStageKeys = Object.keys(STAGES_DATABASE)
      const currentIndex = allStageKeys.indexOf(stage.id)
      if (currentIndex !== -1 && currentIndex < allStageKeys.length - 1) {
        currentStageId = allStageKeys[currentIndex + 1]
        console.log(`\n🗺️ Próxima fase desbloqueada: ${STAGES_DATABASE[currentStageId].name}!`)
      }

      saveCurrentGame()
    } else {
      console.log("☠️ DERROTA! Seus Pokémon foram derrotados.")
      console.log("💡 Dica: Suba o nível dos seus Pokémon nas fases anteriores ou aprimore seus equipamentos com sucata!")
    }

    await pause()
  }

  async function boxMenuFlow(stage: IRpgStage) {
    while (true) {
      clear()
      divider("=")
      console.log("📦 MINHA BOX DE POKÉMON")
      divider("=")
      console.log(`Total de Pokémon na Box: ${box.pokemons.length}`)
      console.log(`Limite nesta fase (${stage.name}): ${Math.min(stage.enemies.length, 6)} Pokémon simultâneos`)
      divider("-")

      box.pokemons.forEach((p, idx) => {
        const placement = box.placements.get(p.uid)
        const posStr = placement ? `📍 No Campo em (${placement.x}, ${placement.y})` : "💤 Na Reserva"
        console.log(`[${idx + 1}] ${p.species} ${p.shiny ? "✨(SHINY)" : ""} (Nv.${p.level}) - ${posStr}`)
        console.log(`    HP: ${p.maxHP} | Atk: ${p.atk} | Def: ${p.def} | Spe: ${p.speed}`)
        console.log(`    IVs: [HP:${p.ivs.hp}/33, Atk:${p.ivs.atk}/33, Def:${p.ivs.def}/33, Spe:${p.ivs.speed}/33]`)
      })

      divider("-")
      console.log("  [P] Posicionar um Pokémon no Tabuleiro")
      console.log("  [R] Remover um Pokémon do Tabuleiro (voltar pra reserva)")
      console.log("  [L] Limpar todo o Tabuleiro")
      console.log("  [0] Voltar ao Menu Principal")

      const act = await prompt("👉 Opção: ")
      if (act.toLowerCase() === "p") {
        const monIdxStr = await prompt("Número do Pokémon na lista para posicionar: ")
        const monIdx = parseInt(monIdxStr) - 1
        if (monIdx >= 0 && monIdx < box.pokemons.length) {
          const targetMon = box.pokemons[monIdx]
          const xStr = await prompt("Coluna X (0 a 7): ")
          const yStr = await prompt("Linha Y (3 a 5 - lado do jogador): ")
          const x = parseInt(xStr)
          const y = parseInt(yStr)
          const res = box.placeOnGrid(targetMon.uid, x, y, stage)
          console.log(`\n${res.success ? "✅" : "❌"} ${res.message}`)
          saveCurrentGame()
          await pause()
        }
      } else if (act.toLowerCase() === "r") {
        const monIdxStr = await prompt("Número do Pokémon para tirar do campo: ")
        const monIdx = parseInt(monIdxStr) - 1
        if (monIdx >= 0 && monIdx < box.pokemons.length) {
          box.removeFromGrid(box.pokemons[monIdx].uid)
          console.log("\n✅ Pokémon removido do tabuleiro para a reserva!")
          saveCurrentGame()
          await pause()
        }
      } else if (act.toLowerCase() === "l") {
        box.clearGrid()
        console.log("\n✅ Tabuleiro limpo!")
        saveCurrentGame()
        await pause()
      } else if (act === "0") {
        break
      }
    }
  }

  async function inventoryMenuFlow() {
    while (true) {
      clear()
      divider("=")
      console.log("🎒 MOCHILA & EQUIPAMENTOS")
      divider("=")
      console.log(`💰 Moedas: $${gold} | ⚙️ Sucata de Aprimoramento: ${inventory.upgradeScrap}`)
      console.log(`🔴 Pokéballs: ${pokeballs[PokeballType.POKEBALL]} | 🔵 Great: ${pokeballs[PokeballType.GREAT_BALL]} | 🟡 Ultra: ${pokeballs[PokeballType.ULTRA_BALL]}`)
      divider("-")
      console.log("EQUIPAMENTOS:")
      if (inventory.items.length === 0) {
        console.log("  (Nenhum equipamento na mochila)")
      } else {
        inventory.items.forEach((it, idx) => {
          const statsStr = it.subStats.map(s => `+${s.value} ${s.stat}`).join(", ") || "Sem bônus"
          console.log(`  [${idx + 1}] ${it.itemId} (Rank ${it.rank}) - Bônus: [${statsStr}]`)
        })
      }
      divider("-")
      console.log("  [C] Comprar Pokébolas na Loja ($50 cada)")
      console.log("  [A] Aprimorar Rank de um Equipamento (Usa Sucata)")
      console.log("  [D] Desmanchar Equipamento (Gera Sucata)")
      console.log("  [0] Voltar ao Menu Principal")

      const act = await prompt("👉 Opção: ")
      if (act.toLowerCase() === "c") {
        if (gold >= 50) {
          gold -= 50
          pokeballs[PokeballType.POKEBALL]++
          console.log("\n✅ Comprou 1x Pokéball por $50!")
          saveCurrentGame()
        } else {
          console.log("\n❌ Moedas insuficientes! Você precisa de $50.")
        }
        await pause()
      } else if (act.toLowerCase() === "a") {
        if (inventory.items.length === 0) {
          console.log("\n❌ Nenhum item para aprimorar.")
          await pause()
          continue
        }
        const itemIdxStr = await prompt("Número do item para aprimorar: ")
        const itemIdx = parseInt(itemIdxStr) - 1
        if (itemIdx >= 0 && itemIdx < inventory.items.length) {
          const res = inventory.upgradeItem(inventory.items[itemIdx].uid)
          console.log(`\n${res.success ? "✅" : "❌"} ${res.message}`)
          saveCurrentGame()
          await pause()
        }
      } else if (act.toLowerCase() === "d") {
        if (inventory.items.length === 0) {
          console.log("\n❌ Nenhum item para desmanchar.")
          await pause()
          continue
        }
        const itemIdxStr = await prompt("Número do item para desmanchar: ")
        const itemIdx = parseInt(itemIdxStr) - 1
        if (itemIdx >= 0 && itemIdx < inventory.items.length) {
          const res = inventory.salvageItem(inventory.items[itemIdx].uid)
          console.log(`\n${res.success ? "✅" : "❌"} ${res.message}`)
          saveCurrentGame()
          await pause()
        }
      } else if (act === "0") {
        break
      }
    }
  }

  async function stageSelectFlow() {
    clear()
    divider("=")
    console.log("🗺️ SELEÇÃO DE FASES DA CAMPANHA")
    divider("=")
    const allStageKeys = Object.keys(STAGES_DATABASE)
    allStageKeys.forEach((k, idx) => {
      const s = STAGES_DATABASE[k]
      const isDone = completedStages.includes(k) ? "✅ Concluída" : "⏳ Pendente"
      const isCurrent = k === currentStageId ? "👉 [SELECIONADA]" : ""
      console.log(`[${idx + 1}] ${s.name} (${s.type}) - ${isDone} ${isCurrent}`)
    })
    divider("-")
    const choiceStr = await prompt("Digite o número da fase para selecionar (ou 0 para voltar): ")
    const choice = parseInt(choiceStr) - 1
    if (choice >= 0 && choice < allStageKeys.length) {
      currentStageId = allStageKeys[choice]
      console.log(`\n✅ Fase alterada para: ${STAGES_DATABASE[currentStageId].name}!`)
      saveCurrentGame()
      await pause()
    }
  }
}

// Executa se chamado diretamente
if (require.main === module) {
  main().catch(console.error)
}
