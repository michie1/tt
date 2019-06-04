export $(cat .env | xargs) &&
docker-compose -p tt down
