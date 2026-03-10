package com.example.vanted.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DirectionsCar
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Place
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.vanted.data.InMemoryServiceRepository
import com.example.vanted.data.ServiceCategory
import com.example.vanted.data.ServiceOption
import com.example.vanted.data.ServiceRepository
import com.example.vanted.domain.BookingManager
import com.example.vanted.domain.BookingRequest
import kotlinx.coroutines.launch

private val categoryIcons = mapOf(
    "Driver" to Icons.Default.DirectionsCar,
    "Home Needs" to Icons.Default.Home,
    "Courier" to Icons.Default.LocalShipping
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(repository: ServiceRepository = InMemoryServiceRepository()) {
    val allCategories = remember { repository.getCategories() }
    val bookingManager = remember { BookingManager() }
    val snackbarHostState = remember { SnackbarHostState() }
    val coroutineScope = rememberCoroutineScope()

    var searchQuery by rememberSaveable { mutableStateOf("") }
    var selectedOptionName by rememberSaveable { mutableStateOf("") }
    var customerName by rememberSaveable { mutableStateOf("") }
    var address by rememberSaveable { mutableStateOf("") }
    var notes by rememberSaveable { mutableStateOf("") }
    var refreshBookingsTick by remember { mutableStateOf(0) }

    val visibleCategories = remember(allCategories, searchQuery) {
        if (searchQuery.isBlank()) {
            allCategories
        } else {
            allCategories.mapNotNull { category ->
                val matchingOptions = category.options.filter {
                    it.name.contains(searchQuery, ignoreCase = true) ||
                        category.name.contains(searchQuery, ignoreCase = true)
                }
                if (matchingOptions.isEmpty()) null else category.copy(options = matchingOptions)
            }
        }
    }

    val selectedOption = remember(selectedOptionName, allCategories) {
        allCategories.asSequence().flatMap { it.options }.firstOrNull { it.name == selectedOptionName }
    }

    val recentBookings = remember(refreshBookingsTick) { bookingManager.bookings.reversed() }

    Scaffold(
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) },
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            "VANTED",
                            style = MaterialTheme.typography.headlineMedium.copy(
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 2.sp
                            )
                        )
                        Text(
                            "Where you can Get Everything",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.secondary
                        )
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer
                )
            )
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    label = { Text("Search services") },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) }
                )
            }

            if (visibleCategories.isEmpty()) {
                item {
                    Card(modifier = Modifier.fillMaxWidth()) {
                        Text(
                            text = "No services match your search.",
                            modifier = Modifier.padding(16.dp)
                        )
                    }
                }
            }

            items(visibleCategories) { category ->
                CategoryCard(
                    category = category,
                    selectedSubCategory = selectedOptionName,
                    onSubCategoryClick = { selectedOptionName = it }
                )
            }

            item {
                ServiceSummaryCard(selectedOption = selectedOption)
            }

            item {
                BookingForm(
                    selectedOptionName = selectedOptionName,
                    customerName = customerName,
                    address = address,
                    notes = notes,
                    onCustomerNameChange = { customerName = it },
                    onAddressChange = { address = it },
                    onNotesChange = { notes = it },
                    onSubmit = {
                        val request = BookingRequest(
                            serviceName = selectedOptionName,
                            customerName = customerName,
                            address = address,
                            notes = notes
                        )

                        val error = bookingManager.tryCreateBooking(request)
                        coroutineScope.launch {
                            if (error != null) {
                                snackbarHostState.showSnackbar(error)
                            } else {
                                refreshBookingsTick += 1
                                customerName = ""
                                address = ""
                                notes = ""
                                snackbarHostState.showSnackbar("Booking confirmed for ${request.serviceName}")
                            }
                        }
                    }
                )
            }

            if (recentBookings.isNotEmpty()) {
                item {
                    Text("Recent bookings", style = MaterialTheme.typography.titleMedium)
                }

                items(recentBookings) { booking ->
                    Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)) {
                        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(booking.serviceName, fontWeight = FontWeight.Bold)
                            Text("${booking.customerName} • ${booking.address}")
                            if (booking.notes.isNotBlank()) {
                                Text("Notes: ${booking.notes}", style = MaterialTheme.typography.bodySmall)
                            }
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun CategoryCard(
    category: ServiceCategory,
    selectedSubCategory: String,
    onSubCategoryClick: (String) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = category.iconForCategory(),
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(28.dp)
                )
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text(text = category.name, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text(text = category.subtitle, style = MaterialTheme.typography.bodyMedium)
                }
            }

            HorizontalDivider()

            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                category.options.forEach { option ->
                    FilterChip(
                        selected = selectedSubCategory == option.name,
                        onClick = { onSubCategoryClick(option.name) },
                        label = { Text(option.name) }
                    )
                }
            }
        }
    }
}

@Composable
private fun ServiceSummaryCard(selectedOption: ServiceOption?) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text("Selected service", style = MaterialTheme.typography.titleMedium)
            if (selectedOption == null) {
                Text("Choose any service chip above to see ETA and base pricing.")
            } else {
                Text(selectedOption.name, fontWeight = FontWeight.Bold)
                Text("ETA: ~${selectedOption.estimatedArrivalMinutes} minutes")
                Text("Base fare: ₹${selectedOption.basePriceInr}")
            }
        }
    }
}

@Composable
private fun BookingForm(
    selectedOptionName: String,
    customerName: String,
    address: String,
    notes: String,
    onCustomerNameChange: (String) -> Unit,
    onAddressChange: (String) -> Unit,
    onNotesChange: (String) -> Unit,
    onSubmit: () -> Unit
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text("Book service", style = MaterialTheme.typography.titleMedium)

            OutlinedTextField(
                value = customerName,
                onValueChange = onCustomerNameChange,
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                label = { Text("Your name") },
                leadingIcon = { Icon(Icons.Default.Person, contentDescription = null) }
            )
            OutlinedTextField(
                value = address,
                onValueChange = onAddressChange,
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Address") },
                leadingIcon = { Icon(Icons.Default.Place, contentDescription = null) }
            )
            OutlinedTextField(
                value = notes,
                onValueChange = onNotesChange,
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Notes (optional)") }
            )

            Button(
                onClick = onSubmit,
                modifier = Modifier.fillMaxWidth(),
                enabled = selectedOptionName.isNotBlank()
            ) {
                Text(if (selectedOptionName.isBlank()) "Select a service first" else "Confirm booking")
            }
            Spacer(modifier = Modifier.height(2.dp))
        }
    }
}

private fun ServiceCategory.iconForCategory(): ImageVector =
    categoryIcons[name] ?: Icons.Default.Home
