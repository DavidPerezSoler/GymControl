package com.example.aplicacionfinal.data.model.api

import com.squareup.moshi.Json

data class Sprites(
    @Json(name = "front_default") val frontDefault: String
)