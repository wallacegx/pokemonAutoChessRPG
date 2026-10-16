import { Pkm } from "../types/enum/Pokemon"
import { PokemonInstance } from "./pokemon-instance"
import { LocalBattleRunner } from "./battle-runner"
import { STAGE_OAK_LAB } from "./prologue"

function testPikachuLevel(level: number) {
  const pika = new PokemonInstance({
    species: Pkm.PIKACHU,
    level: level,
    nickname: "Pikachu do Carvalho"
  })

  const team = [{ pokemon: pika, x: 3, y: 4 }]
  const result = LocalBattleRunner.runBattle(team, STAGE_OAK_LAB)

  console.log(`\n--- TESTANDO PIKACHU LV ${level} ---`)
  console.log(`Status do Pikachu (Nv.${level}): HP: ${pika.maxHP}, Atk: ${pika.atk}, Def: ${pika.def}, Spe: ${pika.speed}`)
  console.log(`Resultado: ${result.winner === "PLAYER" ? "VITÓRIA! 🎉" : "DERROTA! ❌"} em ${result.rounds} turnos`)
  console.log(`Sobrevivência do Pikachu: HP ${Math.max(0, pika.currentHP)}/${pika.maxHP}`)
  return result.winner === "PLAYER"
}

[15, 18, 20, 22, 25].forEach(lvl => testPikachuLevel(lvl))
