#!/bin/sh

# Use environment variables for the PostgreSQL health check
pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"
