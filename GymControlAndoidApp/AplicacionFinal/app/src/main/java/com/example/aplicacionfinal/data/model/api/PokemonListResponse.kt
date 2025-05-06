package com.example.aplicacionfinal.data.model.api

data class PokemonListResponse(
    val count: Int,
    val results: List<PokemonResult>
)