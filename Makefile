all:
	docker build -t mapseries .
	-docker rm mapseries
	docker run -i -t -p 80:8080 --name mapseries mapseries
