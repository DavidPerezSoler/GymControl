package com.example.aplicacionfinal.ui.activity

import android.content.Intent
import android.os.Bundle
import android.view.Menu
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.aplicacionfinal.R
import com.example.aplicacionfinal.databinding.ActivityMainBinding
import com.example.aplicacionfinal.ui.adapter.PokemonPagingAdapter
import com.example.aplicacionfinal.ui.viewModels.PokemonViewModel
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private lateinit var pAdapter: PokemonPagingAdapter
    private val viewModel by viewModels<PokemonViewModel> { PokemonViewModel.Factory }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Primero, inicializamos el RecyclerView y pAdapter
        setupRecyclerView()

        // Luego, comenzamos a observar el flujo paginado
        observePokemonPagingFlow()

        // Cargar o refrescar datos
        viewModel.refreshData()

        // Configurar Toolbar
        setSupportActionBar(binding.toolbar)
    }

    private fun setupRecyclerView() {
        // Inicializamos pAdapter antes de asignarlo al RecyclerView
        pAdapter = PokemonPagingAdapter { pokemonId ->
            val intent = Intent(this, DetailActivity::class.java).apply {
                putExtra("POKEMON_ID", pokemonId)
            }
            startActivity(intent)
        }
        binding.recyclerView.apply {
            layoutManager = LinearLayoutManager(this@MainActivity)
            adapter = pAdapter
            setHasFixedSize(true)
        }
    }

    private fun observePokemonPagingFlow() {
        lifecycleScope.launch {
            viewModel.pokemonPagingData.collectLatest { pagingData ->
                pAdapter.submitData(pagingData)
            }
        }
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.main_menu, menu)

        val searchItem = menu.findItem(R.id.action_search)
        val searchView = searchItem.actionView as? androidx.appcompat.widget.SearchView

        searchView?.setOnQueryTextListener(object : androidx.appcompat.widget.SearchView.OnQueryTextListener {
            override fun onQueryTextSubmit(query: String?): Boolean {
                query?.let { viewModel.searchPokemonByName(it) }
                return true
            }

            override fun onQueryTextChange(newText: String?): Boolean {
                // No filtramos localmente, ya que buscamos en la API
                return true
            }
        })

        // Observar el ID del Pokémon para navegar a DetailActivity
        viewModel.pokemonDetailId.observe(this) { pokemonId ->
            pokemonId?.let {
                val intent = Intent(this, DetailActivity::class.java).apply {
                    putExtra("POKEMON_ID", it)
                }
                startActivity(intent)
                viewModel.setPokemonDetailId(null) // Limpiar después de navegar usando null
            }
        }

        // Observar errores de búsqueda
        viewModel.searchError.observe(this) { error ->
            if (!error.isNullOrEmpty()) {
                Toast.makeText(this, error, Toast.LENGTH_SHORT).show()
                viewModel.setSearchError("") // Limpiar después de mostrar
            }
        }
        return true
    }
}