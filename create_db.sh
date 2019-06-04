export $(cat .env | xargs) && docker exec -it tt_db_1 psql -U postgres -c "create database $DB_NAME"
