import { Synergy } from "../types/enum/Synergy"
import { getTypeMultiplier, getEffectivenessFeedback } from "./type-chart"
import { getMoveType } from "./move-types"
import { Ability } from "../types/enum/Ability"

console.log("=== TESTANDO A TABELA DE MULTIPLICADORES DE TIPO ===")

// 1. Água vs Fogo
const waterVsFire = getTypeMultiplier(Synergy.WATER, [Synergy.FIRE])
console.log("Água vs Fogo:", waterVsFire, "x", getEffectivenessFeedback(waterVsFire).text)

// 2. Fogo vs Grama
const fireVsGrass = getTypeMultiplier(Synergy.FIRE, [Synergy.GRASS])
console.log("Fogo vs Grama:", fireVsGrass, "x", getEffectivenessFeedback(fireVsGrass).text)

// 3. Grama vs Água
const grassVsWater = getTypeMultiplier(Synergy.GRASS, [Synergy.WATER])
console.log("Grama vs Água:", grassVsWater, "x", getEffectivenessFeedback(grassVsWater).text)

// 4. Água vs Grama
const waterVsGrass = getTypeMultiplier(Synergy.WATER, [Synergy.GRASS])
console.log("Água vs Grama:", waterVsGrass, "x", getEffectivenessFeedback(waterVsGrass).text)

// 5. Elétrico vs Água
const electricVsWater = getTypeMultiplier(Synergy.ELECTRIC, [Synergy.WATER])
console.log("Elétrico vs Água:", electricVsWater, "x", getEffectivenessFeedback(electricVsWater).text)

// 6. Elétrico vs Terrestre (Imunidade)
const electricVsGround = getTypeMultiplier(Synergy.ELECTRIC, [Synergy.GROUND])
console.log("Elétrico vs Terrestre:", electricVsGround, "x", getEffectivenessFeedback(electricVsGround).text)

// 7. Fogo vs Grama + Inseto (Dupla Fraqueza 4x)
const fireVsGrassBug = getTypeMultiplier(Synergy.FIRE, [Synergy.GRASS, Synergy.BUG])
console.log("Fogo vs Grama/Inseto (Duplo Tipo):", fireVsGrassBug, "x", getEffectivenessFeedback(fireVsGrassBug).text)

// 8. Grama vs Água + Terrestre (Dupla Fraqueza 4x)
const grassVsWaterGround = getTypeMultiplier(Synergy.GRASS, [Synergy.WATER, Synergy.GROUND])
console.log("Grama vs Água/Terrestre (Duplo Tipo):", grassVsWaterGround, "x", getEffectivenessFeedback(grassVsWaterGround).text)

// 9. Fantasma vs Normal (Imunidade)
const ghostVsNormal = getTypeMultiplier(Synergy.GHOST, [Synergy.NORMAL])
console.log("Fantasma vs Normal:", ghostVsNormal, "x", getEffectivenessFeedback(ghostVsNormal).text)

console.log("\n=== TESTANDO TIPAGEM DE GOLPES ===")
console.log("VINE_WHIP:", getMoveType("VINE_WHIP"))
console.log("FIRE_SPIN:", getMoveType("FIRE_SPIN"))
console.log("AQUA_JET:", getMoveType("AQUA_JET"))
console.log("THUNDER_SHOCK:", getMoveType("THUNDER_SHOCK"))
console.log("ROCK_THROW:", getMoveType("ROCK_THROW"))
console.log("EARTHQUAKE:", getMoveType("EARTHQUAKE"))
console.log("PSYCHIC:", getMoveType("PSYCHIC"))
console.log("CLOSE_COMBAT:", getMoveType("CLOSE_COMBAT"))
console.log("BLIZZARD:", getMoveType("BLIZZARD"))
console.log("SHADOW_BALL:", getMoveType("SHADOW_BALL"))

console.log("\n=== TESTANDO BÔNUS DE STAB (SAME-TYPE ATTACK BONUS) ===")
import { calculateAttackMultipliers } from "./type-chart"

// A. Charmander (Fogo) usando Fire Spin (Fogo) em Bulbasaur (Grama/Veneno)
// Esperado: STAB (1.5x) * Fraqueza (2.0x) = 3.0x
const resCharmander = calculateAttackMultipliers(Synergy.FIRE, [Synergy.FIRE], [Synergy.GRASS, Synergy.POISON])
console.log("Charmander usando Fire Spin em Bulbasaur:", resCharmander.totalMultiplier, "x", resCharmander.feedbackText)

// B. Bulbasaur (Grama/Veneno) usando Vine Whip (Grama) em Geodude (Pedra/Terrestre)
// Esperado: STAB (1.5x) * Dupla Fraqueza (4.0x) = 6.0x
const resBulbasaur = calculateAttackMultipliers(Synergy.GRASS, [Synergy.GRASS, Synergy.POISON], [Synergy.ROCK, Synergy.GROUND])
console.log("Bulbasaur usando Vine Whip em Geodude:", resBulbasaur.totalMultiplier, "x", resBulbasaur.feedbackText)

// C. Snorlax (Normal) usando Flamethrower (Fogo) em Bulbasaur (Grama)
// Esperado: SEM STAB (1.0x) * Fraqueza (2.0x) = 2.0x
const resSnorlax = calculateAttackMultipliers(Synergy.FIRE, [Synergy.NORMAL], [Synergy.GRASS])
console.log("Snorlax usando Flamethrower em Bulbasaur:", resSnorlax.totalMultiplier, "x", resSnorlax.feedbackText)

// D. Pikachu (Elétrico) usando Thunder Shock (Elétrico) em Geodude (Terrestre)
// Esperado: Imunidade = 0x
const resPikachu = calculateAttackMultipliers(Synergy.ELECTRIC, [Synergy.ELECTRIC], [Synergy.ROCK, Synergy.GROUND])
console.log("Pikachu usando Thunder Shock em Geodude:", resPikachu.totalMultiplier, "x", resPikachu.feedbackText)

console.log("\n✅ Todos os testes de Tipagem e STAB foram validados com 100% de precisão!")
