import { PokemonInstance } from "./pokemon-instance"
import { IRpgStage } from "./stages"

export interface IGridPlacement {
  pokemon: PokemonInstance
  x: number // 0 a 7
  y: number // 3 a 5 (zona do jogador)
}

export class PlayerBox {
  // Todos os Pokémon capturados e salvos no PC
  pokemons: PokemonInstance[] = []

  // Pokémon atualmente posicionados no tabuleiro de combate
  placements: Map<string, { x: number; y: number }> = new Map()

  /**
   * Adiciona um Pokémon capturado à Box.
   */
  add(pokemon: PokemonInstance): void {
    this.pokemons.push(pokemon)
  }

  /**
   * Remove um Pokémon da Box (ex: soltar ou transferir).
   */
  remove(uid: string): boolean {
    const idx = this.pokemons.findIndex(p => p.uid === uid)
    if (idx !== -1) {
      this.placements.delete(uid)
      this.pokemons.splice(idx, 1)
      return true
    }
    return false
  }

  /**
   * Posiciona um Pokémon da Box na Grid de Batalha com verificação de regras.
   */
  placeOnGrid(
    pokemonUid: string,
    x: number,
    y: number,
    stage: IRpgStage
  ): { success: boolean; message: string } {
    const pokemon = this.pokemons.find(p => p.uid === pokemonUid)
    if (!pokemon) {
      return { success: false, message: "Pokémon não encontrado na sua Box!" }
    }

    // Regra 1: Coordenadas válidas no lado do jogador (Y = 3, 4, 5)
    if (x < 0 || x > 7 || y < 3 || y > 5) {
      return {
        success: false,
        message: `Posição (${x}, ${y}) inválida! Você só pode posicionar no seu lado do campo (Linhas Y = 3 a 5 e Colunas X = 0 a 7).`
      }
    }

    // Regra 2: Célula não pode ser parede, água ou obstáculo
    const isWall = stage.walls.some(([wx, wy]) => wx === x && wy === y)
    if (isWall) {
      return { success: false, message: `A célula (${x}, ${y}) é uma parede! Escolha um chão livre.` }
    }

    const isWater = stage.water.some(([wx, wy]) => wx === x && wy === y)
    if (isWater) {
      return { success: false, message: `A célula (${x}, ${y}) é água! Escolha um chão livre.` }
    }

    const isObstacle = stage.obstacles.some(([ox, oy]) => ox === x && oy === y)
    if (isObstacle) {
      return { success: false, message: `A célula (${x}, ${y}) contém um pilar/obstáculo! Escolha um chão livre.` }
    }

    // Regra 3: Célula já ocupada por outro aliado
    for (const [otherUid, pos] of this.placements.entries()) {
      if (otherUid !== pokemonUid && pos.x === x && pos.y === y) {
        return { success: false, message: `A célula (${x}, ${y}) já está ocupada por outro Pokémon seu!` }
      }
    }

    // Regra 4: Limite Máximo da Fase (Mesma quantidade de inimigos ou no máximo 6)
    const enemyCount = stage.enemies.length
    const maxAllowedOnGrid = Math.min(enemyCount, 6)
    const isAlreadyOnGrid = this.placements.has(pokemonUid)

    if (!isAlreadyOnGrid && this.placements.size >= maxAllowedOnGrid) {
      return {
        success: false,
        message: `Limite atingido! Esta fase possui ${enemyCount} inimigo(s). Você só pode colocar no máximo ${maxAllowedOnGrid} Pokémon no tabuleiro!`
      }
    }

    // Tudo certo! Registra o posicionamento
    this.placements.set(pokemonUid, { x, y })
    return {
      success: true,
      message: `${pokemon.species} posicionado com sucesso em (${x}, ${y})!`
    }
  }

  /**
   * Tira um Pokémon do tabuleiro de volta para o descanso na Box.
   */
  removeFromGrid(pokemonUid: string): boolean {
    return this.placements.delete(pokemonUid)
  }

  /**
   * Limpa todo o tabuleiro.
   */
  clearGrid(): void {
    this.placements.clear()
  }

  /**
   * Retorna os Pokémon atualmente ativos no tabuleiro prontos para a batalha.
   */
  getActiveBattleTeam(): IGridPlacement[] {
    const team: IGridPlacement[] = []
    for (const [uid, pos] of this.placements.entries()) {
      const poke = this.pokemons.find(p => p.uid === uid)
      if (poke) {
        team.push({ pokemon: poke, x: pos.x, y: pos.y })
      }
    }
    return team
  }
}
