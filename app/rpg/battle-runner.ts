import { Pkm } from "../types/enum/Pokemon"
import { Synergy } from "../types/enum/Synergy"
import { PokemonInstance, getSpeciesBaseData } from "./pokemon-instance"
import { IRpgStage, StageType } from "./stages"
import { RpgEquipment, PlayerInventory, ItemRank } from "./items-salvage"
import { calculateAttackMultipliers } from "./type-chart"
import { getMoveType } from "./move-types"

export interface IBattleResult {
  winner: "PLAYER" | "ENEMY"
  rounds: number
  log: string[]
  defeatedEnemies: Array<{ species: Pkm; level: number }>
  rewardsGained?: {
    exp: number
    gold: number
    drops: Array<{ item: string; rank: ItemRank }>
  }
  captureCandidate?: { species: Pkm; level: number }
}

interface ICombatUnit {
  uid: string
  name: string
  species: Pkm
  team: "PLAYER" | "ENEMY"
  level: number
  x: number
  y: number
  hp: number
  maxHP: number
  atk: number
  def: number
  speDef: number
  speed: number
  range: number
  pp: number
  maxPP: number
  skill: string
  types: Synergy[]
  originalInstance?: PokemonInstance
}

export class LocalBattleRunner {
  /**
   * Executa a batalha completa da fase no grid 8x6.
   */
  static runBattle(
    playerGridTeam: Array<{ pokemon: PokemonInstance; x: number; y: number }>,
    stage: IRpgStage,
    inventory?: PlayerInventory
  ): IBattleResult {
    const log: string[] = []
    log.push(`\n⚔️ INÍCIO DA BATALHA: [${stage.name}] (Bioma: ${stage.biome.toUpperCase()})`)

    if (playerGridTeam.length === 0) {
      log.push("❌ Nenhum Pokémon posicionado no tabuleiro!")
      return { winner: "ENEMY", rounds: 0, log, defeatedEnemies: [] }
    }

    // 1. Monta as unidades do jogador
    const playerUnits: ICombatUnit[] = playerGridTeam.map(({ pokemon, x, y }) => ({
      uid: pokemon.uid,
      name: `${pokemon.species} ${pokemon.shiny ? "✨" : ""}`,
      species: pokemon.species,
      team: "PLAYER",
      level: pokemon.level,
      x,
      y,
      hp: pokemon.maxHP,
      maxHP: pokemon.maxHP,
      atk: pokemon.atk,
      def: pokemon.def,
      speDef: pokemon.speDef,
      speed: pokemon.speed,
      range: pokemon.range,
      pp: 0,
      maxPP: pokemon.maxPP,
      skill: pokemon.selectedSkill,
      types: pokemon.types,
      originalInstance: pokemon
    }))

    // 2. Monta as unidades inimigas da fase
    const enemyUnits: ICombatUnit[] = stage.enemies.map((e, idx) => {
      const enemyData = getSpeciesBaseData(e.species)
      // Status escalados com nível (níveis baixos são acessíveis)
      const baseHp = 45 + e.level * 14
      const baseAtk = 9 + e.level * 2.5
      const baseDef = 6 + e.level * 1.8
      return {
        uid: `enemy_${idx}`,
        name: `Inimigo ${e.species} (Nv.${e.level})`,
        species: e.species,
        team: "ENEMY",
        level: e.level,
        x: e.x,
        y: e.y,
        hp: baseHp,
        maxHP: baseHp,
        atk: baseAtk,
        def: baseDef,
        speDef: baseDef,
        speed: 45 + e.level,
        range: enemyData.range || 1,
        pp: 0,
        maxPP: 100,
        skill: enemyData.skill || "TACKLE",
        types: enemyData.types || [Synergy.NORMAL]
      }
    })

    const allUnits = [...playerUnits, ...enemyUnits]
    let round = 1
    const maxRounds = 40
    const defeatedEnemies: Array<{ species: Pkm; level: number }> = []

    // 3. Loop de Turnos de Combate
    while (round <= maxRounds) {
      const alivePlayers = allUnits.filter(u => u.team === "PLAYER" && u.hp > 0)
      const aliveEnemies = allUnits.filter(u => u.team === "ENEMY" && u.hp > 0)

      if (alivePlayers.length === 0 || aliveEnemies.length === 0) {
        break
      }

      // Ordena ação por velocidade (maior Speed age primeiro)
      const activeUnits = allUnits
        .filter(u => u.hp > 0)
        .sort((a, b) => b.speed - a.speed)

      for (const unit of activeUnits) {
        if (unit.hp <= 0) continue

        const enemies = allUnits.filter(u => u.team !== unit.team && u.hp > 0)
        if (enemies.length === 0) break

        // Encontra o inimigo mais próximo (distância de Chebyshev)
        let closestEnemy: ICombatUnit | null = null
        let closestDist = 999

        for (const enemy of enemies) {
          const dist = Math.max(Math.abs(enemy.x - unit.x), Math.abs(enemy.y - unit.y))
          if (dist < closestDist) {
            closestDist = dist
            closestEnemy = enemy
          }
        }

        if (!closestEnemy) continue

        // Verifica se está ao alcance de ataque
        if (closestDist <= unit.range) {
          // ATAQUE!
          const isSkillReady = unit.pp >= unit.maxPP
          let damage = 0

          if (isSkillReady) {
            // Golpe Especial com Tipagem Elemental e Bônus de STAB!
            const moveType = getMoveType(unit.skill, unit.types[0])
            const { totalMultiplier, feedbackText } = calculateAttackMultipliers(
              moveType,
              unit.types,
              closestEnemy.types
            )

            const baseDmg = Math.round(unit.atk * 1.85)
            damage = totalMultiplier === 0 ? 0 : Math.max(3, Math.round(baseDmg * totalMultiplier))
            unit.pp = 0

            const effText = feedbackText ? ` ${feedbackText}` : ""
            log.push(`🔥 [Turno ${round}] ${unit.name} usou ${unit.skill} [${moveType}] em ${closestEnemy.name}! Dano: ${damage}${effText}`)
          } else {
            // Ataque Básico (Usa o tipo primário do Pokémon com STAB natural)
            const attackType = unit.types[0] || Synergy.NORMAL
            const { totalMultiplier, feedbackText } = calculateAttackMultipliers(
              attackType,
              unit.types,
              closestEnemy.types
            )

            const rawDmg = (unit.atk * 1.2) - (closestEnemy.def * 0.3)
            damage = totalMultiplier === 0 ? 0 : Math.max(3, Math.round(Math.max(5, rawDmg) * totalMultiplier))
            unit.pp = Math.min(unit.maxPP, unit.pp + 25) // Ganha PP

            const effText = feedbackText ? ` ${feedbackText}` : ""
            log.push(`💥 [Turno ${round}] ${unit.name} atacou ${closestEnemy.name}! Dano: ${damage}${effText} (HP: ${Math.max(0, closestEnemy.hp - damage)}/${closestEnemy.maxHP})`)
          }

          closestEnemy.hp -= damage

          if (closestEnemy.hp <= 0) {
            log.push(`💀 ${closestEnemy.name} foi DERROTADO!`)
            if (closestEnemy.team === "ENEMY") {
              defeatedEnemies.push({ species: closestEnemy.species, level: closestEnemy.level })
            }
          }
        } else {
          // MOVIMENTO: Dá 1 passo em direção ao inimigo (contornando obstáculos)
          const stepX = Math.sign(closestEnemy.x - unit.x)
          const stepY = Math.sign(closestEnemy.y - unit.y)
          const targetX = unit.x + stepX
          const targetY = unit.y + stepY

          // Checa se a célula está bloqueada por parede, água ou outro Pokémon
          const isCellBlocked = 
            stage.walls.some(([wx, wy]) => wx === targetX && wy === targetY) ||
            stage.water.some(([wx, wy]) => wx === targetX && wy === targetY) ||
            stage.obstacles.some(([ox, oy]) => ox === targetX && oy === targetY) ||
            allUnits.some(u => u.hp > 0 && u.x === targetX && u.y === targetY)

          if (!isCellBlocked) {
            unit.x = targetX
            unit.y = targetY
          }
        }
      }

      round++
    }

    const alivePlayersFinal = allUnits.filter(u => u.team === "PLAYER" && u.hp > 0)
    const playerWon = alivePlayersFinal.length > 0

    log.push(`\n🏁 FIM DO COMBATE: ${playerWon ? "VITÓRIA DO JOGADOR! 🎉" : "DERROTA DO JOGADOR! ❌"}`)

    if (!playerWon) {
      return { winner: "ENEMY", rounds: round, log, defeatedEnemies }
    }

    // 4. Se o jogador venceu: Distribui XP para todos os participantes
    playerUnits.forEach(u => {
      if (u.originalInstance) {
        const leveledUp = u.originalInstance.gainXP(stage.rewards.exp)
        if (leveledUp) {
          log.push(`⭐ ${u.name} SUBIU PARA O NÍVEL ${u.originalInstance.level}! Atributos amplificados!`)
        }
      }
    })

    // 5. Rola Drops de Itens
    const earnedDrops: Array<{ item: string; rank: ItemRank }> = []
    if (stage.rewards.itemDrops && inventory) {
      for (const drop of stage.rewards.itemDrops) {
        if (Math.random() <= drop.chance) {
          const equipped = inventory.addItem(drop.item, drop.rank)
          earnedDrops.push({ item: drop.item, rank: drop.rank })
          log.push(`🎁 DROP OBTIDO: ${drop.item} (Rank ${drop.rank})! Adicionado ao inventário!`)
        }
      }
    }

    // 6. Candidato a Captura (Se a fase for WILD)
    let captureCandidate: { species: Pkm; level: number } | undefined = undefined
    if (stage.type === StageType.WILD && defeatedEnemies.length > 0) {
      // O Pokémon mais forte derrotado vira o candidato de captura
      captureCandidate = defeatedEnemies[defeatedEnemies.length - 1]
      log.push(`\n🎯 FASE DE CAPTURA DISPONÍVEL! Um ${captureCandidate.species} selvagem (Nv.${captureCandidate.level}) está pronto para ser capturado!`)
    }

    return {
      winner: "PLAYER",
      rounds: round,
      log,
      defeatedEnemies,
      rewardsGained: {
        exp: stage.rewards.exp,
        gold: stage.rewards.gold,
        drops: earnedDrops
      },
      captureCandidate
    }
  }
}
