package com.example.vanted

import com.example.vanted.data.InMemoryServiceRepository
import com.example.vanted.domain.BookingManager
import com.example.vanted.domain.BookingRequest
import com.example.vanted.domain.BookingValidator
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class ExampleUnitTest {

    private val repository = InMemoryServiceRepository()

    @Test
    fun repository_containsExpectedCategoryNames() {
        val categories = repository.getCategories()

        assertEquals(listOf("Driver", "Home Needs", "Courier"), categories.map { it.name })
    }

    @Test
    fun repository_servicesHavePositiveEtaAndPrice() {
        val services = repository.getCategories().flatMap { it.options }

        assertTrue(services.all { it.estimatedArrivalMinutes > 0 && it.basePriceInr > 0 })
    }

    @Test
    fun repository_searchOptions_filtersByServiceOrCategory() {
        val byService = repository.searchOptions("car")
        val byCategory = repository.searchOptions("home")

        assertTrue(byService.any { it.name == "Car" })
        assertTrue(byCategory.any { it.name == "Electrician" })
    }

    @Test
    fun bookingValidator_acceptsValidRequest() {
        val error = BookingValidator.validate(
            BookingRequest(
                serviceName = "Car",
                customerName = "Rahul",
                address = "22 MG Road, Bengaluru"
            )
        )

        assertNull(error)
    }

    @Test
    fun bookingValidator_rejectsInvalidRequest() {
        val error = BookingValidator.validate(
            BookingRequest(
                serviceName = "",
                customerName = "AB",
                address = "short"
            )
        )

        assertEquals("Please select a service", error)
    }

    @Test
    fun bookingManager_addsOnlyValidBookings() {
        val manager = BookingManager()

        val invalidError = manager.tryCreateBooking(
            BookingRequest(serviceName = "", customerName = "A", address = "short")
        )
        val validError = manager.tryCreateBooking(
            BookingRequest(serviceName = "Bike", customerName = "Aman", address = "5 Residency Road")
        )

        assertEquals("Please select a service", invalidError)
        assertNull(validError)
        assertEquals(1, manager.bookings.size)
        assertEquals("Bike", manager.bookings.first().serviceName)
    }
}
