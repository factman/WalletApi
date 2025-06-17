FROM mysql:8.4

# Set environment variables for MySQL

ENV MYSQL_DATABASE=${DB_NAME} \
  MYSQL_USER=${DB_USER} \
  MYSQL_PASSWORD=${DB_PASSWORD} \
  MYSQL_ROOT_PASSWORD=${DB_PASSWORD}

RUN printenv

# Expose MySQL port
EXPOSE ${DB_PORT}:${DB_PORT}
