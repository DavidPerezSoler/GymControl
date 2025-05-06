package com.example.aplicacionfinal.ui.viewModels

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider.AndroidViewModelFactory.Companion.APPLICATION_KEY
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import androidx.paging.PagingData
import androidx.paging.cachedIn
import com.example.aplicacionfinal.PokemonApp
import com.example.aplicacionfinal.data.model.api.PokemonDetailResponse
import com.example.aplicacionfinal.data.model.entity.PokemonEntity
import com.example.aplicacionfinal.data.repository.PokemonRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class PokemonViewModel(private val repository: PokemonRepository) : ViewModel() {
    private val _pokemonList = MutableLiveData<List<PokemonEntity>>()
    val pokemonList: LiveData<List<PokemonEntity>> get() = _pokemonList
    val pokemonPagingData: Flow<PagingData<PokemonEntity>> =
        repository.getPokemonPagingData()
            .cachedIn(viewModelScope)

    // LiveData para mostrar mensajes de error
    private val _searchError = MutableLiveData<String>()
    val searchError: LiveData<String> get() = _searchError
    fun setSearchError(errorMessage: String) {
        _searchError.value = errorMessage
    }

    // LiveData para navegar a DetailActivity
    private val _pokemonDetailId = MutableLiveData<Int?>()
    val pokemonDetailId: LiveData<Int?> get() = _pokemonDetailId
    fun setPokemonDetailId(id: Int?) {
        _pokemonDetailId.value = id
    }

    // Obtener la lista de Pokémon de la base de datos (síncrono)
    fun refreshData() {
        viewModelScope.launch {
            repository.refreshPokemonData()  // Refresca los datos
            _pokemonList.value = repository.getPokemonList()  // Obtiene la lista actualizada
        }
    }

    private fun navigateToDetail(pokemonId: Int) {
        // Lanza la navegación a DetailActivity
        _pokemonDetailId.value = pokemonId
    }

    fun searchPokemonByName(name: String) {
        viewModelScope.launch {
            val normalizedName = name.lowercase().trim()
            Log.d("Search", "Searching for Pokémon: $normalizedName")
            val result = repository.searchPokemonByName(normalizedName)
            if (result != null) {
                Log.d("Search", "Found Pokémon with ID: ${result.id}")
                navigateToDetail(result.id)
            } else {
                _searchError.value = "Pokémon not found"
                Log.e("Search", "Pokémon not found for name: $normalizedName")
            }
        }
    }

    companion object {
        val Factory = viewModelFactory {
            initializer {
                val repository = (this[APPLICATION_KEY] as PokemonApp).repository
                PokemonViewModel(repository)
            }
        }
    }
}