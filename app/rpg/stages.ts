import { Pkm } from "../types/enum/Pokemon"
import { Item } from "../types/enum/Item"
import { ItemRank } from "./items-salvage"

export enum StageType {
  WILD = "WILD",       // Fase de exploração / selvagem (permite capturar após vencer)
  TRAINER = "TRAINER", // Duelo contra treinador (não permite captura, dá drops/ouro)
  BOSS = "BOSS"        // Líder de Ginásio / Chefe épico
}

export interface IStageEnemy {
  species: Pkm
  level: number
  x: number // 0 a 7
  y: number // 0 a 2 (lado inimigo)
}

export interface IStageReward {
  exp: number
  gold: number
  itemDrops: Array<{
    item: Item
    rank: ItemRank
    chance: number // 0.0 a 1.0 (ex: 0.5 = 50%)
  }>
}

export interface IRpgStage {
  id: string
  name: string
  type: StageType
  biome: "forest" | "cave" | "volcano" | "beach"
  walls: [number, number][]     // Coordenadas [x, y] de paredes
  water: [number, number][]     // Coordenadas [x, y] de água/lava
  obstacles: [number, number][] // Coordenadas [x, y] de pilares/pedras com HP
  enemies: IStageEnemy[]
  rewards: IStageReward
}

export const STAGES_DATABASE: Record<string, IRpgStage> = {
  // Fase 1: Rota 1 (Iniciação com 2 Pokémon selvagens)
  stage_route_1: {
    id: "stage_route_1",
    name: "Rota 1 - Entrada de Pallet",
    type: StageType.WILD,
    biome: "forest",
    walls: [],
    water: [],
    obstacles: [
      [3, 2] // 1 tronco caído perto do centro
    ],
    enemies: [
      { species: Pkm.PIDGEY, level: 2, x: 2, y: 1 },
      { species: Pkm.RATTATA, level: 3, x: 5, y: 1 }
    ],
    rewards: {
      exp: 100,
      gold: 50,
      itemDrops: [
        { item: Item.ORAN_BERRY, rank: ItemRank.RANK_D, chance: 0.8 },
        { item: Item.SILK_SCARF, rank: ItemRank.RANK_D, chance: 0.3 }
      ]
    }
  },

  // Fase 2: Floresta de Viridian (Choke point com árvores e 3 inimigos)
  stage_viridian_forest: {
    id: "stage_viridian_forest",
    name: "Floresta de Viridian - Clareira Densa",
    type: StageType.WILD,
    biome: "forest",
    walls: [
      [0, 2], [1, 2], [6, 2], [7, 2] // Árvores fechando as laterais, forçando o centro
    ],
    water: [],
    obstacles: [
      [3, 2] // Tronco bloqueando parcialmente o gargalo
    ],
    enemies: [
      { species: Pkm.CATERPIE, level: 4, x: 2, y: 0 },
      { species: Pkm.WEEDLE, level: 4, x: 5, y: 0 },
      { species: Pkm.PIKACHU, level: 5, x: 4, y: 1 } // Raro no centro!
    ],
    rewards: {
      exp: 250,
      gold: 120,
      itemDrops: [
        { item: Item.SITRUS_BERRY, rank: ItemRank.RANK_C, chance: 0.6 },
        { item: Item.MAGNET, rank: ItemRank.RANK_C, chance: 0.25 }
      ]
    }
  },

  // Fase 3: Ginásio de Pewter (Líder Brock - Duelo de Treinador sem captura)
  stage_pewter_gym: {
    id: "stage_pewter_gym",
    name: "Ginásio de Pewter - Líder Brock",
    type: StageType.TRAINER,
    biome: "cave",
    walls: [
      [2, 2], [5, 2] // Paredes de rocha bruta
    ],
    water: [],
    obstacles: [
      [1, 1], [6, 1], [3, 2], [4, 2] // Pilares de pedra que servem de cobertura
    ],
    enemies: [
      { species: Pkm.GEODUDE, level: 10, x: 2, y: 0 },
      { species: Pkm.ONIX, level: 12, x: 4, y: 1 }
    ],
    rewards: {
      exp: 600,
      gold: 500,
      itemDrops: [
        { item: Item.KINGS_ROCK, rank: ItemRank.RANK_B, chance: 0.9 },
        { item: Item.LEFTOVERS, rank: ItemRank.RANK_B, chance: 0.4 }
      ]
    }
  }
}
