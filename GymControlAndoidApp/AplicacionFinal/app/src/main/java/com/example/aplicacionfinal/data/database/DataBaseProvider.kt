package com.example.aplicacionfinal.data.database

import android.content.Context
import androidx.room.Room

class DatabaseProvider(context: Context) {
     val appDatabase: AppDatabase by lazy {
        Room.databaseBuilder(
            context.applicationContext, // Usar ApplicationContext
            AppDatabase::class.java,
            "pokemon_db" // Nombre de la BD en minúsculas
        ).fallbackToDestructiveMigration() // Para desarrollo, eliminar en producción
            .build()
    }

    fun getPokemonDao(): PokemonDao = appDatabase.pokemonDao()
}



