package com.example.vanted.data

data class ServiceOption(
    val name: String,
    val estimatedArrivalMinutes: Int,
    val basePriceInr: Int
)

data class ServiceCategory(
    val name: String,
    val subtitle: String,
    val options: List<ServiceOption>
)
