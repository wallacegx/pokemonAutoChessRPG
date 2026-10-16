import { Item } from "../types/enum/Item"

export enum ItemRank {
  RANK_D = "D", // Comum (+0% bônus)
  RANK_C = "C", // Incomum (+25% bônus)
  RANK_B = "B", // Raro (+60% bônus)
  RANK_A = "A", // Épico (+110% bônus)
  RANK_S = "S"  // Lendário (+180% bônus)
}

export const RANK_MULTIPLIERS: Record<ItemRank, number> = {
  [ItemRank.RANK_D]: 1.0,
  [ItemRank.RANK_C]: 1.25,
  [ItemRank.RANK_B]: 1.60,
  [ItemRank.RANK_A]: 2.10,
  [ItemRank.RANK_S]: 2.80
}

export const SCRAP_SALVAGE_VALUE: Record<ItemRank, number> = {
  [ItemRank.RANK_D]: 10,
  [ItemRank.RANK_C]: 30,
  [ItemRank.RANK_B]: 80,
  [ItemRank.RANK_A]: 200,
  [ItemRank.RANK_S]: 500
}

export const SCRAP_UPGRADE_COST: Record<ItemRank, number> = {
  [ItemRank.RANK_D]: 50,  // Para subir de D -> C
  [ItemRank.RANK_C]: 150, // Para subir de C -> B
  [ItemRank.RANK_B]: 400, // Para subir de B -> A
  [ItemRank.RANK_A]: 1000,// Para subir de A -> S
  [ItemRank.RANK_S]: 0
}

export interface IItemSubStat {
  stat: "atk" | "def" | "speDef" | "hp" | "speed"
  value: number
}

export class RpgEquipment {
  uid: string
  itemId: Item
  rank: ItemRank
  level: number
  subStats: IItemSubStat[]

  constructor(itemId: Item, rank: ItemRank = ItemRank.RANK_D) {
    this.uid = crypto.randomUUID()
    this.itemId = itemId
    this.rank = rank
    this.level = 1
    this.subStats = this.rollSubStats()
  }

  rollSubStats(): IItemSubStat[] {
    const statsPool: ("atk" | "def" | "speDef" | "hp" | "speed")[] = ["atk", "def", "speDef", "hp", "speed"]
    const count = this.rank === ItemRank.RANK_S ? 3 : this.rank === ItemRank.RANK_A ? 2 : this.rank === ItemRank.RANK_B ? 1 : 0
    const chosen: IItemSubStat[] = []

    for (let i = 0; i < count; i++) {
      const stat = statsPool[Math.floor(Math.random() * statsPool.length)]
      const mult = RANK_MULTIPLIERS[this.rank]
      const baseVal = stat === "hp" ? 25 : 5
      chosen.push({
        stat,
        value: Math.round(baseVal * mult)
      })
    }

    return chosen
  }

  getMultiplier(): number {
    return RANK_MULTIPLIERS[this.rank]
  }
}

export class PlayerInventory {
  items: RpgEquipment[] = []
  upgradeScrap = 0 // Poeira / Sucata de Aprimoramento

  addItem(itemId: Item, rank: ItemRank = ItemRank.RANK_D): RpgEquipment {
    const item = new RpgEquipment(itemId, rank)
    this.items.push(item)
    return item
  }

  /**
   * Desmancha um item em sucata de aprimoramento.
   */
  salvageItem(itemUid: string): { success: boolean; scrapGained: number; message: string } {
    const index = this.items.findIndex(it => it.uid === itemUid)
    if (index === -1) {
      return { success: false, scrapGained: 0, message: "Item não encontrado no inventário!" }
    }

    const item = this.items[index]
    const scrapGained = SCRAP_SALVAGE_VALUE[item.rank]
    this.upgradeScrap += scrapGained
    this.items.splice(index, 1)

    return {
      success: true,
      scrapGained,
      message: `Desmanchou ${item.itemId} (Rank ${item.rank}) e obteve +${scrapGained} Sucatas de Aprimoramento!`
    }
  }

  /**
   * Sobe o rank de um item usando sucata.
   */
  upgradeItem(itemUid: string): { success: boolean; newRank?: ItemRank; message: string } {
    const item = this.items.find(it => it.uid === itemUid)
    if (!item) {
      return { success: false, message: "Item não encontrado!" }
    }

    if (item.rank === ItemRank.RANK_S) {
      return { success: false, message: "Este item já está no Rank Máximo (S)!" }
    }

    const cost = SCRAP_UPGRADE_COST[item.rank]
    if (this.upgradeScrap < cost) {
      return {
        success: false,
        message: `Sucata insuficiente! Necessário: ${cost}, você tem: ${this.upgradeScrap}. Desmanche itens para obter mais!`
      }
    }

    this.upgradeScrap -= cost
    const rankProgression = [ItemRank.RANK_D, ItemRank.RANK_C, ItemRank.RANK_B, ItemRank.RANK_A, ItemRank.RANK_S]
    const nextRank = rankProgression[rankProgression.indexOf(item.rank) + 1]
    item.rank = nextRank
    item.subStats = item.rollSubStats() // Rola novos sub-status mais fortes para o novo rank

    return {
      success: true,
      newRank: nextRank,
      message: `Sucesso! O item subiu para Rank ${nextRank}! Bônus de status amplificado para ${Math.round(RANK_MULTIPLIERS[nextRank] * 100)}%!`
    }
  }
}
