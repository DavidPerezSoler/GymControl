package com.example.aplicacionfinal.ui.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.aplicacionfinal.R
import com.example.aplicacionfinal.databinding.ItemPokemonBinding
import com.example.aplicacionfinal.data.model.entity.PokemonEntity

class PokemonAdapter(
    private val onItemClick: (Int) -> Unit
) : RecyclerView.Adapter<PokemonAdapter.ViewHolder>() {
    private var pokemons = emptyList<PokemonEntity>()

    inner class ViewHolder(private val binding: ItemPokemonBinding) :
        RecyclerView.ViewHolder(binding.root) {
        fun bind(pokemon: PokemonEntity) {
            with(binding) {
                tvName.text = pokemon.name.ifEmpty { "Unknown" } // Mostrar "Unknown" si el nombre está vacío
                Glide.with(root.context)
                    .load(pokemon.imageUrl)
                    .placeholder(R.drawable.ic_launcher_background)
                    .error(R.drawable.ic_launcher_background)
                    .into(ivPokemon)
                root.setOnClickListener {
                    onItemClick(pokemon.id)
                }
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemPokemonBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(pokemons[position])
    }

    override fun getItemCount() = pokemons.size

    fun submitList(newList: List<PokemonEntity>) {
        pokemons = newList
        notifyDataSetChanged() // Notifica al RecyclerView sobre los cambios
    }
}