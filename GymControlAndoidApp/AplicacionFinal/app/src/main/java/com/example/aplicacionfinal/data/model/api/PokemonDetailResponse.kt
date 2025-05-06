package com.example.aplicacionfinal.data.model.api

import com.squareup.moshi.Json

data class PokemonDetailResponse(
    val id: Int,
    val name: String,
    val height: Float,
    val weight: Int,
    val sprites: Sprites,
    val types: List<TypeEntry>,
    val abilities: List<AbilityEntry>,
    val stats: List<StatEntry>
)

data class TypeEntry(
    val slot: Int?,
    val type: Type
)

data class Type(
    val name: String,
    val url: String
)

data class AbilityEntry(
    val ability: Ability,
    val isHidden: Boolean? = null,
    val slot: Int
)

data class Ability(
    val name: String,
    val url: String
)

data class StatEntry(
    @Json(name = "base_stat") val baseStat: Int?,
    val effort: Int?,
    val stat: Stat?
)

data class Stat(
    val name: String?,
    val url: String?
)