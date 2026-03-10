package com.example.vanted.domain

object BookingValidator {
    fun validate(request: BookingRequest): String? {
        if (request.serviceName.isBlank()) return "Please select a service"
        if (request.customerName.trim().length < 3) return "Name must be at least 3 characters"
        if (request.address.trim().length < 10) return "Address must be at least 10 characters"
        return null
    }
}
