package com.example.aplicacionfinal

import android.app.Application
import com.example.aplicacionfinal.data.database.AppDatabase
import com.example.aplicacionfinal.data.database.DatabaseProvider
import com.example.aplicacionfinal.data.network.PokeApiProvider
import com.example.aplicacionfinal.data.repository.PokemonRepository

class PokemonApp : Application() {

    lateinit var repository : PokemonRepository

    override fun onCreate() {
        super.onCreate()
        // 1. Inicializar ViewModel
        val apiProvider = PokeApiProvider()
        val database = DatabaseProvider(this)
       // Cambio aquí
        repository = PokemonRepository(
            apiProvider.service,
            database.getPokemonDao() // Cambio aquí
        )
    }

}