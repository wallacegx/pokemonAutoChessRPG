import { PrologueManager } from "./prologue"
import { SaveManager } from "./save-manager"
import { Pkm } from "../types/enum/Pokemon"

console.log("=== TESTANDO O PRÓLOGO ===")
const battle = PrologueManager.runTutorialBattle()
console.log("Vitória do Pikachu:", battle.success)
console.log("Total de linhas de combate:", battle.log.length)

// Exemplo das últimas linhas de combate
battle.log.slice(-6).forEach(l => console.log("  ", l))

console.log("\n=== CONCLUINDO PRÓLOGO COM SQUIRTLE ===")
const res = PrologueManager.finishPrologue("Red", Pkm.SQUIRTLE)
console.log("Inicial:", res.starter.species, "Nv.", res.starter.level)
console.log("Status:", { hp: res.starter.maxHP, atk: res.starter.atk, def: res.starter.def })
console.log("IVs:", res.starter.ivs)
console.log("Box Pokémons:", res.box.pokemons.map(p => p.species))
console.log("Inventário Pokeballs:", res.pokeballs)

console.log("\n=== TESTANDO SAVE/LOAD ===")
console.log("Save existe no disco?", SaveManager.hasSave())
const loaded = SaveManager.loadSave()
console.log("Save carregado para jogador:", loaded?.player.name, "| Ouro:", loaded?.player.gold)
console.log("Box do Save:", loaded?.box.map(b => b.species))

console.log("\n=== TESTANDO EASTER EGG: FECHAR CAPTURA E RECEBER PIKACHU ===")
const resPika = PrologueManager.finishPrologue("Ash", Pkm.PIKACHU)
console.log("Inicial Secreto:", resPika.starter.species, "Nv.", resPika.starter.level)
console.log("Golpe do Pikachu:", resPika.starter.selectedSkill)
console.log("Box do Jogador:", resPika.box.pokemons.map(p => p.species))
console.log("Posicionado no tabuleiro:", resPika.box.placements.get(resPika.starter.uid))

SaveManager.deleteSave()
console.log("\nSave temporário limpo. Pronto para o jogador!")

console.log("\n✅ Todos os testes do Prólogo passaram com sucesso!")
