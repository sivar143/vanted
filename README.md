# VANTED Project

VANTED is organized as a multi-frontend workspace with Android currently implemented and Angular space prepared.

## Repository structure
- `frontend/webUI/angular/` → Angular web app workspace (placeholder scaffold location)
- `frontend/androidAPP/` → Android app (Kotlin + Jetpack Compose)

## Android app features (current)
- Service marketplace categories (Driver, Home Needs, Courier)
- Search and filter services
- Service summary with ETA and base fare
- Booking form with validation
- Recent bookings list

## Android code map
- `frontend/androidAPP/src/main/java/com/example/vanted/MainActivity.kt`
- `frontend/androidAPP/src/main/java/com/example/vanted/ui/HomeScreen.kt`
- `frontend/androidAPP/src/main/java/com/example/vanted/data/ServiceModels.kt`
- `frontend/androidAPP/src/main/java/com/example/vanted/data/ServiceRepository.kt`
- `frontend/androidAPP/src/main/java/com/example/vanted/domain/BookingRequest.kt`
- `frontend/androidAPP/src/main/java/com/example/vanted/domain/BookingValidator.kt`
- `frontend/androidAPP/src/test/java/com/example/vanted/ExampleUnitTest.kt`

## Run Android tests
```bash
./gradlew testDebugUnitTest
```

## Deployment
See `DEPLOYMENT.md` in the repository root for deployment steps (frontend/backend/MySQL/android).
