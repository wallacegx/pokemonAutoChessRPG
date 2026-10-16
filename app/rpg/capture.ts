import { Pkm } from "../types/enum/Pokemon"
import { PokemonInstance, generateRandomIVs, IPokemonIVs } from "./pokemon-instance"

export enum PokeballType {
  POKEBALL = "POKEBALL",
  GREAT_BALL = "GREAT_BALL",
  ULTRA_BALL = "ULTRA_BALL",
  MASTER_BALL = "MASTER_BALL"
}

export const BALL_MULTIPLIERS: Record<PokeballType, number> = {
  [PokeballType.POKEBALL]: 1.0,
  [PokeballType.GREAT_BALL]: 1.5,
  [PokeballType.ULTRA_BALL]: 2.0,
  [PokeballType.MASTER_BALL]: 255.0
}

export interface ICaptureResult {
  success: boolean
  pokemon?: PokemonInstance
  message: string
  details?: {
    species: Pkm
    level: number
    ivs: IPokemonIVs
    shiny: boolean
  }
}

export class CaptureSystem {
  /**
   * Tenta capturar um Pokémon derrotado no final de uma fase WILD.
   * 
   * @param species Espécie do Pokémon
   * @param level Nível do Pokémon derrotado
   * @param ball Tipo de Pokébola usada
   * @param bonusChance Bônus percentual opcional (ex: por comida ou item)
   */
  static attemptCapture(
    species: Pkm,
    level: number,
    ball: PokeballType = PokeballType.POKEBALL,
    bonusChance: number = 0
  ): ICaptureResult {
    const ballMult = BALL_MULTIPLIERS[ball]

    if (ball === PokeballType.MASTER_BALL) {
      return this.createCapturedPokemon(species, level, "Captura Garantida com Master Ball! ⭐")
    }

    // Fórmula de captura pós-batalha:
    // Base rate de 45%, modulado pelo nível e pela qualidade da bola
    const baseRate = Math.max(0.20, 0.65 - (level * 0.015)) // Níveis mais altos são mais difíceis
    const finalRate = Math.min(0.95, (baseRate * ballMult) + bonusChance)
    const roll = Math.random()

    if (roll <= finalRate) {
      return this.createCapturedPokemon(species, level, `Gotcha! ${species} foi capturado com sucesso! 🎉`)
    } else {
      return {
        success: false,
        message: `Ah não! O ${species} selvagem quebrou a ${ball} e fugiu!`
      }
    }
  }

  private static createCapturedPokemon(
    species: Pkm,
    level: number,
    successMessage: string
  ): ICaptureResult {
    // Rola IVs de 0 a 33
    const ivs = generateRandomIVs()

    // Rola Shiny com 1% de chance base
    const isShiny = Math.random() < 0.01

    const newPokemon = new PokemonInstance({
      species,
      level,
      ivs,
      shiny: isShiny
    })

    return {
      success: true,
      pokemon: newPokemon,
      message: successMessage,
      details: {
        species,
        level,
        ivs,
        shiny: isShiny
      }
    }
  }
}
