package com.example.vanted.data

interface ServiceRepository {
    fun getCategories(): List<ServiceCategory>

    fun findOptionByName(name: String): ServiceOption? =
        getCategories().asSequence().flatMap { it.options }.firstOrNull { it.name == name }

    fun searchOptions(query: String): List<ServiceOption> {
        val normalized = query.trim()
        if (normalized.isBlank()) return getCategories().flatMap { it.options }

        return getCategories()
            .asSequence()
            .flatMap { category ->
                category.options.asSequence().filter { option ->
                    option.name.contains(normalized, ignoreCase = true) ||
                        category.name.contains(normalized, ignoreCase = true)
                }
            }
            .toList()
    }
}

class InMemoryServiceRepository : ServiceRepository {
    override fun getCategories(): List<ServiceCategory> = listOf(
        ServiceCategory(
            name = "Driver",
            subtitle = "Daily commute and local rides",
            options = listOf(
                ServiceOption(name = "Car", estimatedArrivalMinutes = 15, basePriceInr = 249),
                ServiceOption(name = "Bike", estimatedArrivalMinutes = 10, basePriceInr = 99)
            )
        ),
        ServiceCategory(
            name = "Home Needs",
            subtitle = "Trusted experts for household work",
            options = listOf(
                ServiceOption(name = "Plumber", estimatedArrivalMinutes = 30, basePriceInr = 399),
                ServiceOption(name = "Chef", estimatedArrivalMinutes = 45, basePriceInr = 699),
                ServiceOption(name = "Technician", estimatedArrivalMinutes = 35, basePriceInr = 499),
                ServiceOption(name = "Electrician", estimatedArrivalMinutes = 30, basePriceInr = 349)
            )
        ),
        ServiceCategory(
            name = "Courier",
            subtitle = "Local packing and delivery services",
            options = listOf(
                ServiceOption(name = "Packers and Movers", estimatedArrivalMinutes = 60, basePriceInr = 1499)
            )
        )
    )
}
