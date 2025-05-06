package com.example.aplicacionfinal.data.datasource

import PokeApiService
import androidx.paging.PagingSource
import androidx.paging.PagingState
import com.example.aplicacionfinal.data.model.api.PokemonListResponse
import com.example.aplicacionfinal.data.model.entity.PokemonEntity
import retrofit2.HttpException
import java.io.IOException
import java.util.Locale

class PokemonDataSource(private val apiService: PokeApiService) : PagingSource<Int, PokemonEntity>() {

    override suspend fun load(params: LoadParams<Int>): LoadResult<Int, PokemonEntity> {
        return try {
            val position = params.key ?: 0
            val response: PokemonListResponse = apiService.getPokemonList(
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

            LoadResult.Page(
                data = pokemons,
                prevKey = if (position == 0) null else position - 1,
                nextKey = if (pokemons.isEmpty()) null else position + 1
            )
        } catch (exception: IOException) {
            LoadResult.Error(exception)
        } catch (exception: HttpException) {
            LoadResult.Error(exception)
        }
    }

    override fun getRefreshKey(state: PagingState<Int, PokemonEntity>): Int? {
        return state.anchorPosition?.let { anchorPosition ->
            state.closestPageToPosition(anchorPosition)?.prevKey?.plus(1)
                ?: state.closestPageToPosition(anchorPosition)?.nextKey?.minus(1)
        }
    }

    private fun extractIdFromUrl(url: String): Int {
        return url.split("/")
            .filterNot { it.isBlank() }
            .last()
            .toInt()
    }
}