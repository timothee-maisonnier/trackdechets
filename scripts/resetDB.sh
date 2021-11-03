#!/bin/bash
# Reset db
# -------------------------------------

psql_container_id=$(docker ps -qf name=^/trackdechets.postgres)
api_container_id=$(docker ps -qf name=^/trackdechets.td-api)

read -p "Do you really want to delete the whole database ? (Write DELETE_DATABASE to confirm)"  result

if [ $result != "DELETE_DATABASE" ]
    then 
        echo "Exiting without deleting"
        exit

    fi


read -rp $'\e[1m? Postgres User:\e[m ' -i "trackdechets" -e psqlUser

echo -e "\e[1m→ Stopping \e[36mtd-api\e[m"
docker stop "$api_container_id"

echo -e "\e[1m→ Recreating DB \e[36mprisma\e[m"
docker exec -t "$psql_container_id" bash -c "psql -U $psqlUser -c \"DROP DATABASE IF EXISTS prisma;\"";
docker exec -t "$psql_container_id" bash -c "psql -U $psqlUser -c \"CREATE DATABASE prisma;\"";

 
echo -e "\e[1m→ Restarting \e[36mtd-api\e[m"
docker start "$api_container_id"

docker exec -t "$api_container_id" bash -c "npx prisma db push";
