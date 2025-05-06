package com.example.aplicacionfinal.ui.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.paging.PagingDataAdapter
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.aplicacionfinal.R
import com.example.aplicacionfinal.databinding.ItemPokemonBinding
import com.example.aplicacionfinal.data.model.entity.PokemonEntity

class PokemonPagingAdapter(
    private val onItemClick: (Int) -> Unit
) : PagingDataAdapter<PokemonEntity, PokemonPagingAdapter.ViewHolder>(PokemonDiffCallback) {

    inner class ViewHolder(private val binding: ItemPokemonBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(pokemon: PokemonEntity) {
            binding.tvName.text = pokemon.name
            // Cargar la imagen del Pokémon usando Glide
            Glide.with(binding.root.context)
                .load(pokemon.imageUrl) // Usa la URL de la imagen
                .placeholder(R.drawable.ic_launcher_background) // Imagen de placeholder
                .error(R.drawable.ic_launcher_background) // Imagen de error
                .into(binding.ivPokemon)

            binding.root.setOnClickListener {
                onItemClick(pokemon.id)
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemPokemonBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        getItem(position)?.let { holder.bind(it) }
    }

    companion object {
        val PokemonDiffCallback = object : DiffUtil.ItemCallback<PokemonEntity>() {
            override fun areItemsTheSame(oldItem: PokemonEntity, newItem: PokemonEntity): Boolean {
                return oldItem.id == newItem.id
            }

            override fun areContentsTheSame(oldItem: PokemonEntity, newItem: PokemonEntity): Boolean {
                return oldItem == newItem
            }
        }
    }
}