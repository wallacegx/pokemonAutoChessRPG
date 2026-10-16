import { Ability } from "../types/enum/Ability"
import { Item } from "../types/enum/Item"
import { Pkm } from "../types/enum/Pokemon"
import { Synergy } from "../types/enum/Synergy"

export interface IPokemonIVs {
  hp: number     // 0 a 33
  atk: number    // 0 a 33
  def: number    // 0 a 33
  speDef: number // 0 a 33
  speed: number  // 0 a 33
}

export function getIvMultiplier(iv: number): number {
  if (iv <= 0) return 1.0
  const bonusPercent = 1 + iv * 3
  return 1 + bonusPercent / 100
}

export function generateRandomIVs(): IPokemonIVs {
  return {
    hp: Math.floor(Math.random() * 34),
    atk: Math.floor(Math.random() * 34),
    def: Math.floor(Math.random() * 34),
    speDef: Math.floor(Math.random() * 34),
    speed: Math.floor(Math.random() * 34)
  }
}

/**
 * Curva progressiva oficial de status (Nível 1 ao 100):
 * - Nível 1 = 1.0x (base)
 * - Nível 100 = ~12.0x (12x mais forte!)
 * Possui base linear (+5%/lvl) + aceleração quadrática (+0.00062 * (lvl-1)^2)
 */
export function getLevelStatMultiplier(level: number): number {
  if (level <= 1) return 1.0
  const l = Math.min(100, Math.max(1, level)) - 1
  const linearBonus = l * 0.05
  const curveBonus = Math.pow(l, 2) * 0.00062
  return Number((1.0 + linearBonus + curveBonus).toFixed(3))
}

export interface IBaseSpeciesStats {
  hp: number
  atk: number
  def: number
  speDef: number
  speed: number
  range: number
  pp: number
  skill: Ability
  types: Synergy[]
}

export const BASE_POKEMON_STATS: Partial<Record<Pkm, IBaseSpeciesStats>> = {
  [Pkm.CHARMANDER]: { hp: 60, atk: 12, def: 8, speDef: 8, speed: 65, range: 1, pp: 70, skill: Ability.FIRE_SPIN, types: [Synergy.FIRE] },
  [Pkm.BULBASAUR]: { hp: 65, atk: 10, def: 9, speDef: 10, speed: 45, range: 1, pp: 70, skill: Ability.VINE_WHIP, types: [Synergy.GRASS, Synergy.POISON] },
  [Pkm.SQUIRTLE]: { hp: 64, atk: 10, def: 11, speDef: 10, speed: 43, range: 1, pp: 70, skill: Ability.AQUA_JET, types: [Synergy.WATER] },
  [Pkm.PIDGEY]: { hp: 70, atk: 11, def: 8, speDef: 8, speed: 56, range: 1, pp: 70, skill: Ability.GUST, types: [Synergy.NORMAL, Synergy.FLYING] },
  [Pkm.RATTATA]: { hp: 65, atk: 13, def: 7, speDef: 7, speed: 72, range: 1, pp: 60, skill: Ability.QUICK_ATTACK, types: [Synergy.NORMAL] },
  [Pkm.CATERPIE]: { hp: 60, atk: 7, def: 7, speDef: 5, speed: 45, range: 1, pp: 50, skill: Ability.STRING_SHOT, types: [Synergy.BUG] },
  [Pkm.WEEDLE]: { hp: 60, atk: 8, def: 6, speDef: 5, speed: 50, range: 1, pp: 50, skill: Ability.POISON_STING, types: [Synergy.BUG, Synergy.POISON] },
  [Pkm.PIKACHU]: { hp: 70, atk: 15, def: 8, speDef: 10, speed: 90, range: 2, pp: 75, skill: Ability.THUNDER_SHOCK, types: [Synergy.ELECTRIC] },
  [Pkm.GEODUDE]: { hp: 80, atk: 17, def: 20, speDef: 6, speed: 20, range: 1, pp: 90, skill: Ability.ROCK_THROW, types: [Synergy.ROCK, Synergy.GROUND] },
  [Pkm.ONIX]: { hp: 95, atk: 13, def: 32, speDef: 9, speed: 70, range: 1, pp: 100, skill: Ability.ROCK_TOMB, types: [Synergy.ROCK, Synergy.GROUND] }
}

export function getSpeciesBaseData(species: Pkm): IBaseSpeciesStats {
  return BASE_POKEMON_STATS[species] ?? {
    hp: 75,
    atk: 12,
    def: 10,
    speDef: 10,
    speed: 50,
    range: 1,
    pp: 80,
    skill: Ability.DEFAULT,
    types: [Synergy.NORMAL]
  }
}

export class PokemonInstance {
  uid: string
  species: Pkm
  nickname?: string
  shiny: boolean
  level: number
  currentXP: number
  ivs: IPokemonIVs

  // Status Calculados (Base * Level * IV)
  maxHP = 100
  currentHP = 100
  atk = 10
  def = 10
  speDef = 10
  speed = 50
  range = 1
  maxPP = 100

  // Tipos e Habilidades
  types: Synergy[] = []
  unlockedSkills: Ability[] = []
  selectedSkill: Ability = Ability.DEFAULT

  // Equipamentos da Bag
  equippedItems: Item[] = []

  constructor(params: {
    species: Pkm
    level?: number
    ivs?: IPokemonIVs
    shiny?: boolean
    shinyChance?: number
    nickname?: string
    selectedSkill?: Ability
  }) {
    this.uid = crypto.randomUUID()
    this.species = params.species
    this.level = params.level ?? 1
    this.currentXP = 0
    
    const chance = params.shinyChance ?? 0.01
    this.shiny = params.shiny !== undefined ? params.shiny : Math.random() < chance
    this.nickname = params.nickname
    this.ivs = params.ivs ?? generateRandomIVs()

    const baseData = getSpeciesBaseData(this.species)
    this.types = [...baseData.types]
    this.range = baseData.range || 1
    this.maxPP = baseData.pp || 100

    const initialSkill = params.selectedSkill ?? baseData.skill
    this.unlockedSkills = [initialSkill]
    this.selectedSkill = initialSkill

    this.recalculateStats()
  }

  recalculateStats() {
    const base = getSpeciesBaseData(this.species)
    const levelFactor = getLevelStatMultiplier(this.level)

    this.maxHP = Math.round(base.hp * levelFactor * getIvMultiplier(this.ivs.hp))
    this.atk = Math.round(base.atk * levelFactor * getIvMultiplier(this.ivs.atk))
    this.def = Math.round(base.def * levelFactor * getIvMultiplier(this.ivs.def))
    this.speDef = Math.round(base.speDef * levelFactor * getIvMultiplier(this.ivs.speDef))
    this.speed = Math.round(base.speed * levelFactor * getIvMultiplier(this.ivs.speed))

    if (this.currentHP > this.maxHP || this.currentHP === 0) {
      this.currentHP = this.maxHP
    }
  }

  get xpForNextLevel(): number {
    return Math.floor(100 * Math.pow(this.level, 1.5))
  }

  gainXP(amount: number): boolean {
    this.currentXP += amount
    let leveledUp = false
    while (this.currentXP >= this.xpForNextLevel) {
      this.currentXP -= this.xpForNextLevel
      this.level++
      leveledUp = true
    }
    if (leveledUp) {
      this.recalculateStats()
      this.currentHP = this.maxHP
    }
    return leveledUp
  }

  toBattlePokemon(): any {
    try {
      const factory = require("../models/pokemon-factory").default
      const battleMon = factory.createPokemonFromName(this.species, { shiny: this.shiny })
      battleMon.id = this.uid
      battleMon.shiny = this.shiny
      battleMon.hp = this.currentHP
      battleMon.maxHP = this.maxHP
      battleMon.atk = this.atk
      battleMon.def = this.def
      battleMon.speDef = this.speDef
      battleMon.speed = this.speed
      battleMon.range = this.range
      battleMon.maxPP = this.maxPP
      battleMon.skill = this.selectedSkill
      this.equippedItems.forEach((item) => battleMon.items.add(item))
      return battleMon
    } catch {
      return this
    }
  }
}
