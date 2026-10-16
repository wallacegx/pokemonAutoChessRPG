import { Pkm } from "../types/enum/Pokemon"
import { Item } from "../types/enum/Item"
import { PokemonInstance } from "./pokemon-instance"
import { PlayerBox } from "./box"
import { PlayerInventory, ItemRank } from "./items-salvage"
import { PokeballType, CaptureSystem } from "./capture"
import { LocalBattleRunner } from "./battle-runner"
import { IRpgStage, StageType } from "./stages"
import { SaveManager } from "./save-manager"

export const STAGE_OAK_LAB: IRpgStage = {
  id: "stage_oak_lab",
  name: "Laboratório do Prof. Carvalho (Pallet Town)",
  type: StageType.WILD,
  biome: "AppleWoods",
  walls: [
    [0, 0], [7, 0]
  ],
  water: [],
  obstacles: [
    [1, 2], [6, 2] // Bancadas do laboratório
  ],
  enemies: [
    { species: Pkm.BULBASAUR, level: 5, x: 2, y: 1 },
    { species: Pkm.SQUIRTLE, level: 5, x: 3, y: 1 },
    { species: Pkm.CHARMANDER, level: 5, x: 5, y: 1 }
  ],
  rewards: {
    exp: 80,
    gold: 100,
    itemDrops: []
  }
}

export class PrologueManager {
  static oakPikachuInstance: PokemonInstance | null = null

  /**
   * Cria o Pikachu veterano do Prof. Carvalho no Nível 25 (100% natural, sem buffs manuais)
   */
  static createOakPikachu(): PokemonInstance {
    const oakPika = new PokemonInstance({
      species: Pkm.PIKACHU,
      level: 25,
      nickname: "Pikachu do Carvalho"
    })
    this.oakPikachuInstance = oakPika
    return oakPika
  }

  /**
   * Executa a batalha de tutorial do laboratório
   */
  static runTutorialBattle(): {
    success: boolean
    log: string[]
  } {
    const oakPika = this.createOakPikachu()
    const oakTeam = [{ pokemon: oakPika, x: 3, y: 4 }]
    const dummyInventory = new PlayerInventory()

    const battleResult = LocalBattleRunner.runBattle(oakTeam, STAGE_OAK_LAB, dummyInventory)
    return {
      success: battleResult.winner === "PLAYER",
      log: battleResult.log
    }
  }

  /**
   * Conclui a captura do inicial escolhido com 100% de taxa.
   * Se o jogador fechar a captura dos 3 iniciais, ganha ESSE EXATO Pikachu da luta!
   */
  static finishPrologue(
    playerName: string,
    chosenSpecies: Pkm.BULBASAUR | Pkm.CHARMANDER | Pkm.SQUIRTLE | Pkm.PIKACHU
  ): {
    starter: PokemonInstance
    box: PlayerBox
    inventory: PlayerInventory
    pokeballs: Record<PokeballType, number>
  } {
    let starter: PokemonInstance

    if (chosenSpecies === Pkm.PIKACHU && this.oakPikachuInstance) {
      // O jogador ganha ESSE EXATO Pikachu veterano da batalha!
      starter = this.oakPikachuInstance
      starter.currentHP = starter.maxHP
    } else {
      // Captura do inicial escolhido no Nv. 5 com 100% de taxa
      const capture = CaptureSystem.attemptCapture(chosenSpecies, 5, PokeballType.MASTER_BALL)
      starter = capture.pokemon!
    }

    // 2. Inicializa Box do jogador com o inicial escolhido
    const box = new PlayerBox()
    box.add(starter)
    box.placements.set(starter.uid, { x: 3, y: 4 })

    // 3. Inicializa Inventário inicial de presente do Professor
    const inventory = new PlayerInventory()
    inventory.addItem(Item.SILK_SCARF, ItemRank.RANK_D) // Cachecol da Sorte
    inventory.upgradeScrap = 30 // Sucata inicial

    const pokeballs: Record<PokeballType, number> = {
      [PokeballType.POKEBALL]: 5,
      [PokeballType.GREAT_BALL]: 1,
      [PokeballType.ULTRA_BALL]: 0,
      [PokeballType.MASTER_BALL]: 0
    }

    const gold = 150

    // 4. Salva o novo jogo!
    SaveManager.saveGame(
      playerName,
      gold,
      inventory,
      pokeballs,
      box,
      "stage_route_1",
      ["stage_oak_lab"]
    )

    return {
      starter,
      box,
      inventory,
      pokeballs
    }
  }
}
