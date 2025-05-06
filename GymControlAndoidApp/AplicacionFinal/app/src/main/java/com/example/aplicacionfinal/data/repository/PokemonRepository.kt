package com.example.aplicacionfinal.data.repository

import PokeApiService
import android.util.Log
import androidx.paging.Pager
import androidx.paging.PagingConfig
import androidx.paging.PagingData
import com.example.aplicacionfinal.data.database.PokemonDao
import com.example.aplicacionfinal.data.model.api.PokemonDetailResponse
import com.example.aplicacionfinal.data.model.entity.PokemonEntity
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.firstOrNull

class PokemonRepository(
    private val apiService: PokeApiService,
    private val pokemonDao: PokemonDao
) {

    // Refresca datos desde la API; si falla (sin internet) se mantienen los datos locales
    suspend fun refreshPokemonData() {
        try {
            val response = apiService.getPokemonList(
                offset = 0,
                limit = 1500
            )
            val pokemons = response.results.map { result ->
                PokemonEntity(
                    id = extractIdFromUrl(result.url),
                    name = result.name.capitalize(),
                    imageUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${extractIdFromUrl(result.url)}.png"
                )
            }.filter { it.id != null && it.name.isNotEmpty() && it.imageUrl.isNotEmpty() }
            pokemonDao.insertAll(pokemons)
        } catch (e: Exception) {
            Log.e("PokemonRepository", "Error refreshing data from API, using local data", e)
            // Se atrapa la excepción, por lo que se usarán los datos guardados previamente en la base de datos
        }
    }

    // Devuelve la lista de Pokémon desde la base de datos (síncrono)
    suspend fun getPokemonList(): List<PokemonEntity> {
        return pokemonDao.getAll().first()
    }

    private fun extractIdFromUrl(url: String): Int {
        return url.split("/")
            .filterNot { it.isBlank() }
            .last()
            .toInt()
    }

    suspend fun searchPokemonByName(name: String): PokemonDetailResponse? {
        // Buscar en la base de datos
        val pokemonFromDb = pokemonDao.searchByName(name).firstOrNull()
        if (pokemonFromDb != null) {
            return try {
                // Si está en la base de datos, intentamos obtener el detalle desde la API
                apiService.getPokemonDetail(pokemonFromDb.id.toString())
            } catch (e: Exception) {
                Log.e("PokemonRepository", "Error fetching detail from API, using local data", e)
                null
            }
        }
        // Si no se encuentra en la BD, se busca en la API y se inserta en la base de datos
        return try {
            val response = apiService.getPokemonDetail(name.lowercase())
            val pokemonEntity = PokemonEntity(
                id = response.id,
                name = response.name,
                imageUrl = response.sprites.frontDefault
            )
            pokemonDao.insertAll(listOf(pokemonEntity))
            response
        } catch (e: Exception) {
            Log.e("PokemonRepository", "Error searching Pokemon in API", e)
            null
        }
    }

    // Nuevo método de paginación que usa el PagingSource de la base de datos
    fun getPokemonPagingData(): Flow<PagingData<PokemonEntity>> {
        return Pager(
            config = PagingConfig(
                pageSize = 20,
                enablePlaceholders = false
            ),
            pagingSourceFactory = { pokemonDao.getAllPaging() }
        ).flow
    }
}
