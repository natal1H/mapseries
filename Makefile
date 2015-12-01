all:
	docker build -t mapseries .
	-docker rm mapseries
	docker run -i -t -p 8080:8080 --name mapseries mapseries
