package com.example.aplicacionfinal.ui.activity

import android.os.Bundle
import android.util.Log
import androidx.appcompat.app.AppCompatActivity
import com.bumptech.glide.Glide
import com.example.aplicacionfinal.R
import com.example.aplicacionfinal.databinding.ActivityDetailBinding
import com.example.aplicacionfinal.data.network.PokeApiProvider
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class DetailActivity : AppCompatActivity() {

    private lateinit var binding: ActivityDetailBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityDetailBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val pokemonId = intent.getIntExtra("POKEMON_ID", 1)
        loadPokemonDetails(pokemonId)
    }

    private fun loadPokemonDetails(id: Int) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val apiService = PokeApiProvider().service
                val response = apiService.getPokemonDetail(id.toString())

                if (response == null || response.id == null) {
                    withContext(Dispatchers.Main) {
                        binding.tvNameDetail.text = "Pokémon not found"
                    }
                    return@launch
                }

                withContext(Dispatchers.Main) {
                    binding.apply {
                        Glide.with(this@DetailActivity)
                            .load(response.sprites.frontDefault)
                            .placeholder(R.drawable.ic_launcher_background)
                            .error(R.drawable.ic_launcher_background)
                            .into(ivDetail)

                        tvNameDetail.text = response.name.capitalize()
                        tvHeight.text = "Height: ${response.height/10} m"
                        tvWeight.text = "Weight: ${response.weight/10} kg"

                        // Mostrar tipos
                        val typesText = response.types.joinToString { it.type.name.capitalize() }
                        tvTypes.text = "Types: $typesText"

                        // Mostrar habilidades
                        val abilitiesText = response.abilities
                            .filter { it.ability != null && it.ability.name.isNotEmpty() }
                            .joinToString { "${it.ability.name.capitalize()}${if (it.isHidden == true) " (Hidden)" else ""}" }
                        tvAbilities.text = "Abilities: $abilitiesText"

                        // Mostrar estadísticas
                        val statsText = response.stats
                            .mapNotNull { stat ->
                                val statName = stat.stat?.name?.capitalize() ?: "Unknown"
                                val baseStat = stat.baseStat ?: 0
                                "$statName: $baseStat" // Incluye todas las entradas, incluso si baseStat <= 0
                            }
                            .joinToString("\n")

                        if (statsText.isEmpty()) {
                            Log.w("DetailActivity", "No stats found after processing")
                        }

                        tvStats.text = if (statsText.isNotEmpty()) {
                            "Stats:\n$statsText"
                        } else {
                            "Stats: No stats found"
                        }
                        }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    binding.tvNameDetail.text = "Error loading data"
                    Log.e("DetailActivity", "Error loading Pokémon details for ID: $id", e)
                }
            }
        }
    }
}