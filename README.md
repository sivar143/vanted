# VANTED Android App

VANTED is a Kotlin + Jetpack Compose Android application for discovering local services and creating quick bookings.

## What is implemented
- Service marketplace home screen with categorized offerings:
  - Driver
  - Home Needs
  - Courier
- Per-service metadata (estimated arrival and base fare).
- Interactive service selection using chips.
- Booking form with validation for:
  - selected service
  - minimum customer name length
  - minimum address length
- Booking confirmation snackbar feedback.
- In-session "Recent bookings" list so users can review their last requests.
- Unit tests for repository data quality and booking validation rules.

## Architecture (current)
- **UI (Compose):** `HomeScreen.kt`
- **Data layer:** in-memory repository with typed models
- **Domain layer:** booking request model + validation logic

## Project structure
- `app/src/main/java/com/example/vanted/MainActivity.kt`
- `app/src/main/java/com/example/vanted/ui/HomeScreen.kt`
- `app/src/main/java/com/example/vanted/data/ServiceModels.kt`
- `app/src/main/java/com/example/vanted/data/ServiceRepository.kt`
- `app/src/main/java/com/example/vanted/domain/BookingRequest.kt`
- `app/src/main/java/com/example/vanted/domain/BookingValidator.kt`
- `app/src/test/java/com/example/vanted/ExampleUnitTest.kt`

## Run and test
```bash
./gradlew testDebugUnitTest
```

Then run from Android Studio on emulator/device.

## Suggested next enhancements
- Persist bookings locally (Room/DataStore).
- Add backend API integration and authentication.
- Introduce ViewModel + unidirectional state flow for larger scale.
- Add Compose UI tests for booking form behaviors.


## Deployment
See `DEPLOYMENT.md` in the repository root for detailed deployment steps for frontend, backend, MySQL, and Android release flows.
