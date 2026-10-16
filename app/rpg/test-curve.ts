import { Pkm } from "../types/enum/Pokemon"
import { PokemonInstance } from "./pokemon-instance"
import { LocalBattleRunner } from "./battle-runner"
import { STAGE_OAK_LAB } from "./prologue"

function testWithNaturalStats(level: number) {
  // Cria o Pikachu sem nenhum buff artificial manual - apenas o nível natural
  const pika = new PokemonInstance({
    species: Pkm.PIKACHU,
    level: level,
    nickname: "Pikachu do Carvalho"
  })

  const team = [{ pokemon: pika, x: 3, y: 4 }]
  const result = LocalBattleRunner.runBattle(team, STAGE_OAK_LAB)

  console.log(`\n=== PIKACHU NATURAL NV.${level} ===`)
  console.log(`HP: ${pika.maxHP} | Atk: ${pika.atk} | Def: ${pika.def} | Spe: ${pika.speed}`)
  console.log(`Resultado: ${result.winner === "PLAYER" ? "VITÓRIA! 🎉" : "DERROTA! ❌"} em ${result.rounds} turnos`)
  console.log(`HP Restante: ${Math.max(0, pika.currentHP)}/${pika.maxHP}`)
  return result
}

testWithNaturalStats(15)
testWithNaturalStats(20)
testWithNaturalStats(25)
