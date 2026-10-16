import { Synergy } from "../types/enum/Synergy"

/**
 * Normaliza sinergias extras do auto-chess para os 18 tipos elementais clássicos
 */
export function normalizeType(type: Synergy): Synergy {
  switch (type) {
    case Synergy.FLORA:
      return Synergy.GRASS
    case Synergy.AQUATIC:
      return Synergy.WATER
    case Synergy.MONSTER:
    case Synergy.FIELD:
    case Synergy.BABY:
    case Synergy.HUMAN:
    case Synergy.WILD:
    case Synergy.SOUND:
    case Synergy.GOURMET:
    case Synergy.FOSSIL:
    case Synergy.ARTIFICIAL:
      return Synergy.NORMAL
    case Synergy.LIGHT:
      return Synergy.FAIRY
    case Synergy.AMORPHOUS:
      return Synergy.GHOST
    default:
      return type
  }
}

/**
 * Tabela Oficial de Efetividade de Tipos (18 Tipos Pokémon)
 * Estrutura: TYPE_CHART[Ataque][Defensor] = Multiplicador
 * Valores omitidos são 1.0 (Dano Neutro)
 */
export const TYPE_CHART: Partial<Record<Synergy, Partial<Record<Synergy, number>>>> = {
  [Synergy.NORMAL]: {
    [Synergy.ROCK]: 0.5,
    [Synergy.STEEL]: 0.5,
    [Synergy.GHOST]: 0.0
  },
  [Synergy.FIRE]: {
    [Synergy.GRASS]: 2.0,
    [Synergy.ICE]: 2.0,
    [Synergy.BUG]: 2.0,
    [Synergy.STEEL]: 2.0,
    [Synergy.FIRE]: 0.5,
    [Synergy.WATER]: 0.5,
    [Synergy.ROCK]: 0.5,
    [Synergy.DRAGON]: 0.5
  },
  [Synergy.WATER]: {
    [Synergy.FIRE]: 2.0,
    [Synergy.GROUND]: 2.0,
    [Synergy.ROCK]: 2.0,
    [Synergy.WATER]: 0.5,
    [Synergy.GRASS]: 0.5,
    [Synergy.DRAGON]: 0.5
  },
  [Synergy.GRASS]: {
    [Synergy.WATER]: 2.0,
    [Synergy.GROUND]: 2.0,
    [Synergy.ROCK]: 2.0,
    [Synergy.FIRE]: 0.5,
    [Synergy.GRASS]: 0.5,
    [Synergy.POISON]: 0.5,
    [Synergy.FLYING]: 0.5,
    [Synergy.BUG]: 0.5,
    [Synergy.DRAGON]: 0.5,
    [Synergy.STEEL]: 0.5
  },
  [Synergy.ELECTRIC]: {
    [Synergy.WATER]: 2.0,
    [Synergy.FLYING]: 2.0,
    [Synergy.ELECTRIC]: 0.5,
    [Synergy.GRASS]: 0.5,
    [Synergy.DRAGON]: 0.5,
    [Synergy.GROUND]: 0.0
  },
  [Synergy.ICE]: {
    [Synergy.GRASS]: 2.0,
    [Synergy.GROUND]: 2.0,
    [Synergy.FLYING]: 2.0,
    [Synergy.DRAGON]: 2.0,
    [Synergy.FIRE]: 0.5,
    [Synergy.WATER]: 0.5,
    [Synergy.ICE]: 0.5,
    [Synergy.STEEL]: 0.5
  },
  [Synergy.FIGHTING]: {
    [Synergy.NORMAL]: 2.0,
    [Synergy.ICE]: 2.0,
    [Synergy.ROCK]: 2.0,
    [Synergy.DARK]: 2.0,
    [Synergy.STEEL]: 2.0,
    [Synergy.POISON]: 0.5,
    [Synergy.FLYING]: 0.5,
    [Synergy.PSYCHIC]: 0.5,
    [Synergy.BUG]: 0.5,
    [Synergy.FAIRY]: 0.5,
    [Synergy.GHOST]: 0.0
  },
  [Synergy.POISON]: {
    [Synergy.GRASS]: 2.0,
    [Synergy.FAIRY]: 2.0,
    [Synergy.POISON]: 0.5,
    [Synergy.GROUND]: 0.5,
    [Synergy.ROCK]: 0.5,
    [Synergy.GHOST]: 0.5,
    [Synergy.STEEL]: 0.0
  },
  [Synergy.GROUND]: {
    [Synergy.FIRE]: 2.0,
    [Synergy.ELECTRIC]: 2.0,
    [Synergy.POISON]: 2.0,
    [Synergy.ROCK]: 2.0,
    [Synergy.STEEL]: 2.0,
    [Synergy.GRASS]: 0.5,
    [Synergy.BUG]: 0.5,
    [Synergy.FLYING]: 0.0
  },
  [Synergy.FLYING]: {
    [Synergy.GRASS]: 2.0,
    [Synergy.FIGHTING]: 2.0,
    [Synergy.BUG]: 2.0,
    [Synergy.ELECTRIC]: 0.5,
    [Synergy.ROCK]: 0.5,
    [Synergy.STEEL]: 0.5
  },
  [Synergy.PSYCHIC]: {
    [Synergy.FIGHTING]: 2.0,
    [Synergy.POISON]: 2.0,
    [Synergy.PSYCHIC]: 0.5,
    [Synergy.STEEL]: 0.5,
    [Synergy.DARK]: 0.0
  },
  [Synergy.BUG]: {
    [Synergy.GRASS]: 2.0,
    [Synergy.PSYCHIC]: 2.0,
    [Synergy.DARK]: 2.0,
    [Synergy.FIRE]: 0.5,
    [Synergy.FIGHTING]: 0.5,
    [Synergy.POISON]: 0.5,
    [Synergy.FLYING]: 0.5,
    [Synergy.GHOST]: 0.5,
    [Synergy.STEEL]: 0.5,
    [Synergy.FAIRY]: 0.5
  },
  [Synergy.ROCK]: {
    [Synergy.FIRE]: 2.0,
    [Synergy.ICE]: 2.0,
    [Synergy.FLYING]: 2.0,
    [Synergy.BUG]: 2.0,
    [Synergy.FIGHTING]: 0.5,
    [Synergy.GROUND]: 0.5,
    [Synergy.STEEL]: 0.5
  },
  [Synergy.GHOST]: {
    [Synergy.PSYCHIC]: 2.0,
    [Synergy.GHOST]: 2.0,
    [Synergy.DARK]: 0.5,
    [Synergy.NORMAL]: 0.0
  },
  [Synergy.DRAGON]: {
    [Synergy.DRAGON]: 2.0,
    [Synergy.STEEL]: 0.5,
    [Synergy.FAIRY]: 0.0
  },
  [Synergy.STEEL]: {
    [Synergy.ICE]: 2.0,
    [Synergy.ROCK]: 2.0,
    [Synergy.FAIRY]: 2.0,
    [Synergy.FIRE]: 0.5,
    [Synergy.WATER]: 0.5,
    [Synergy.ELECTRIC]: 0.5,
    [Synergy.STEEL]: 0.5
  },
  [Synergy.DARK]: {
    [Synergy.PSYCHIC]: 2.0,
    [Synergy.GHOST]: 2.0,
    [Synergy.FIGHTING]: 0.5,
    [Synergy.DARK]: 0.5,
    [Synergy.FAIRY]: 0.5
  },
  [Synergy.FAIRY]: {
    [Synergy.FIGHTING]: 2.0,
    [Synergy.DRAGON]: 2.0,
    [Synergy.DARK]: 2.0,
    [Synergy.FIRE]: 0.5,
    [Synergy.POISON]: 0.5,
    [Synergy.STEEL]: 0.5
  }
}

/**
 * Calcula o multiplicador total de dano de um ataque contra os tipos do defensor (suporta duplo-tipo).
 */
export function getTypeMultiplier(attackerType: Synergy, defenderTypes: Synergy[]): number {
  const normAttacker = normalizeType(attackerType)
  const normDefenders = defenderTypes.map(normalizeType)

  if (normDefenders.length === 0) return 1.0

  let totalMultiplier = 1.0
  const uniqueDefenders = Array.from(new Set(normDefenders))

  for (const defType of uniqueDefenders) {
    const table = TYPE_CHART[normAttacker]
    if (table && table[defType] !== undefined) {
      totalMultiplier *= table[defType]!
    }
  }

  return totalMultiplier
}

/**
 * Retorna texto e formatação visual para o log de combate
 */
export function getEffectivenessFeedback(multiplier: number): {
  text: string
  isSuper: boolean
  isResist: boolean
  isImmune: boolean
} {
  if (multiplier === 0) {
    return { text: "🚫 Não teve efeito! (0x)", isSuper: false, isResist: false, isImmune: true }
  } else if (multiplier >= 2.0) {
    return { text: `💥 É SUPER EFETIVO! (${multiplier}x)`, isSuper: true, isResist: false, isImmune: false }
  } else if (multiplier < 1.0) {
    return { text: `🛡️ Não é muito efetivo... (${multiplier}x)`, isSuper: false, isResist: true, isImmune: false }
  }
  return { text: "", isSuper: false, isResist: false, isImmune: false }
}

/**
 * Multiplicador oficial de STAB (Same-Type Attack Bonus): +50% de dano (1.5x)
 */
export const STAB_MULTIPLIER = 1.5

/**
 * Verifica se o Pokémon atacante possui STAB com o tipo do golpe
 */
export function hasStab(moveType: Synergy, userTypes: Synergy[]): boolean {
  const normMove = normalizeType(moveType)
  return userTypes.some((t) => normalizeType(t) === normMove)
}

/**
 * Calcula os multiplicadores completos de um ataque:
 * Efetividade de Tipos (Fraqueza/Resistência/Imunidade) + Bônus de STAB
 */
export function calculateAttackMultipliers(
  moveType: Synergy,
  attackerTypes: Synergy[],
  defenderTypes: Synergy[]
): {
  typeMultiplier: number
  stabMultiplier: number
  totalMultiplier: number
  isStab: boolean
  feedbackText: string
} {
  const typeMultiplier = getTypeMultiplier(moveType, defenderTypes)
  const isStab = hasStab(moveType, attackerTypes)
  const stabMultiplier = isStab ? STAB_MULTIPLIER : 1.0
  const totalMultiplier = typeMultiplier === 0 ? 0 : Number((typeMultiplier * stabMultiplier).toFixed(2))

  const feedback = getEffectivenessFeedback(typeMultiplier)
  const stabTag = isStab && totalMultiplier > 0 ? "⚡ [STAB 1.5x]" : ""
  const feedbackText = [stabTag, feedback.text].filter(Boolean).join(" ")

  return {
    typeMultiplier,
    stabMultiplier,
    totalMultiplier,
    isStab,
    feedbackText
  }
}
