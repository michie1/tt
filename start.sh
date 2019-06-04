export $(cat .env | xargs) &&
docker-compose -p tt up --build --force-recreate -d
