import * as fs from "fs"
import * as path from "path"
import { Item } from "../types/enum/Item"
import { Pkm } from "../types/enum/Pokemon"
import { PokemonInstance, IPokemonIVs } from "./pokemon-instance"
import { PlayerBox } from "./box"
import { PlayerInventory, RpgEquipment, ItemRank, IItemSubStat } from "./items-salvage"
import { PokeballType } from "./capture"

export interface ISavedPokemon {
  uid: string
  species: Pkm
  level: number
  currentXP: number
  ivs: IPokemonIVs
  shiny: boolean
  nickname?: string
  equippedItems: Item[]
}

export interface ISavedEquipment {
  uid: string
  itemId: Item
  rank: ItemRank
  level: number
  subStats: IItemSubStat[]
}

export interface ISaveData {
  version: number
  updatedAt: string
  player: {
    name: string
    gold: number
    upgradeScrap: number
    pokeballs: Record<PokeballType, number>
    items: ISavedEquipment[]
  }
  box: ISavedPokemon[]
  placements: Record<string, { x: number; y: number }>
  progress: {
    currentStageId: string
    completedStages: string[]
  }
}

const SAVE_FILE_PATH = path.resolve(__dirname, "save.json")

export class SaveManager {
  static getSavePath(): string {
    return SAVE_FILE_PATH
  }

  static hasSave(): boolean {
    return fs.existsSync(SAVE_FILE_PATH)
  }

  static deleteSave(): boolean {
    if (fs.existsSync(SAVE_FILE_PATH)) {
      fs.unlinkSync(SAVE_FILE_PATH)
      return true
    }
    return false
  }

  static loadSave(): ISaveData | null {
    if (!this.hasSave()) return null
    try {
      const raw = fs.readFileSync(SAVE_FILE_PATH, "utf-8")
      return JSON.parse(raw) as ISaveData
    } catch (err) {
      console.error("Erro ao carregar o arquivo de save:", err)
      return null
    }
  }

  static saveGame(
    playerName: string,
    gold: number,
    inventory: PlayerInventory,
    pokeballs: Record<PokeballType, number>,
    box: PlayerBox,
    currentStageId: string,
    completedStages: string[]
  ): boolean {
    try {
      const placementsRecord: Record<string, { x: number; y: number }> = {}
      for (const [uid, pos] of box.placements.entries()) {
        placementsRecord[uid] = pos
      }

      const savedBox: ISavedPokemon[] = box.pokemons.map((p) => ({
        uid: p.uid,
        species: p.species,
        level: p.level,
        currentXP: p.currentXP,
        ivs: p.ivs,
        shiny: p.shiny,
        nickname: p.nickname,
        equippedItems: Array.from(p.equippedItems)
      }))

      const savedItems: ISavedEquipment[] = inventory.items.map((it) => ({
        uid: it.uid,
        itemId: it.itemId,
        rank: it.rank,
        level: it.level,
        subStats: it.subStats
      }))

      const saveData: ISaveData = {
        version: 1,
        updatedAt: new Date().toISOString(),
        player: {
          name: playerName,
          gold,
          upgradeScrap: inventory.upgradeScrap,
          pokeballs,
          items: savedItems
        },
        box: savedBox,
        placements: placementsRecord,
        progress: {
          currentStageId,
          completedStages
        }
      }

      fs.writeFileSync(SAVE_FILE_PATH, JSON.stringify(saveData, null, 2), "utf-8")
      return true
    } catch (err) {
      console.error("Erro ao salvar o jogo:", err)
      return false
    }
  }

  /**
   * Reconstrói as instâncias de Box, Inventário e Pokémons a partir do Save
   */
  static restoreGameState(saveData: ISaveData): {
    box: PlayerBox
    inventory: PlayerInventory
    pokeballs: Record<PokeballType, number>
  } {
    const box = new PlayerBox()
    const inventory = new PlayerInventory()
    inventory.upgradeScrap = saveData.player.upgradeScrap

    // Restaura itens
    saveData.player.items.forEach((it) => {
      const equip = new RpgEquipment(it.itemId, it.rank)
      equip.uid = it.uid
      equip.level = it.level
      equip.subStats = it.subStats
      inventory.items.push(equip)
    })

    // Restaura Pokémons da Box
    saveData.box.forEach((pData) => {
      const p = new PokemonInstance({
        species: pData.species,
        level: pData.level,
        ivs: pData.ivs,
        shiny: pData.shiny,
        nickname: pData.nickname
      })
      p.uid = pData.uid
      p.currentXP = pData.currentXP
      pData.equippedItems.forEach((it) => p.equippedItems.push(it))
      p.recalculateStats()
      box.add(p)
    })

    // Restaura posicionamento
    for (const [uid, pos] of Object.entries(saveData.placements)) {
      if (box.pokemons.some((p) => p.uid === uid)) {
        box.placements.set(uid, pos)
      }
    }

    return {
      box,
      inventory,
      pokeballs: saveData.player.pokeballs
    }
  }
}
