1. install docker
2. create volume (docker create volume linklead)
3. docker run --name postgresql -e POSTGRES_PASSWORD=XXX -p 5431:5432 -v linklead:/var/lib/postgresql/data -d postgres
4. docker exec -it postgresql psql -U postgres
4. CREATE DATABASE linklead;
5. During server start creating users table