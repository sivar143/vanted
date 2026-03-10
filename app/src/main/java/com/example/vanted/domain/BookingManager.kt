package com.example.vanted.domain

class BookingManager {
    private val _bookings = mutableListOf<BookingRequest>()
    val bookings: List<BookingRequest> get() = _bookings.toList()

    fun tryCreateBooking(request: BookingRequest): String? {
        val error = BookingValidator.validate(request)
        if (error != null) return error

        _bookings.add(request)
        return null
    }
}
