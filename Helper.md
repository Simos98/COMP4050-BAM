# Backend Helper 

This will explain components of the backend to assist with development and learning how it functions as well as what every part does.

## File Structure
Within the src folder, we have the folders that will contain code for:
- controller: Handles all HTTP requests and responses
- routes: Defines API endpoints
- middleware: Custom functions that run between requests and responses
- services: operation logic for database operations, calculations, etc
- types: TypeScript type definitions for application
- utils: Helper functions (formatting, validation, anything outside of the others)

The Tests folder will hold all the current tests developed for each component and along with every test a support document should be provided for assistance.

## Service Controls

- docker-compose ps : check status of services.
- docker-compose down : shutdown all services.
- docker-compose stop postgres : stops only postgres services.
- docker-compose down -v : shutdown and delete all data. (BE CAREFUL).
- docker-compose up -d : starts all services.
- docker-compose up -d postgres : starts only postgres.
- docker-compose restart : restart all running services.