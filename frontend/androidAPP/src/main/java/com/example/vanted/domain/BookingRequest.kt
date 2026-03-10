package com.example.vanted.domain

data class BookingRequest(
    val serviceName: String,
    val customerName: String,
    val address: String,
    val notes: String = ""
)
