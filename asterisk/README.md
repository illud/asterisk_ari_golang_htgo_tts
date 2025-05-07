docker compose build

docker-compose up -d

audio ulaw y agregar lo de UPD - "10000-10010:10000-10010/udp" en el docker compose

change audio format to -ulaw
sox hola.wav -r 8000 -c 1 -t raw -e mu-law hola.ulaw

access docker asterisk
docker exec -it container_id /bin/sh


