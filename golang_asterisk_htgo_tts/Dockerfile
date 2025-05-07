FROM golang:1.21-alpine

# Set the working directory in the container
WORKDIR /app

# Install necessary dependencies, including sox, pkg-config, mplayer, and build-essential for Cgo
RUN apk update && apk add --no-cache \
    sox \
    bash \
    build-base \
    pkgconfig \
    alsa-lib-dev \
    mplayer \
    && rm -rf /var/cache/apk/*

# Set environment variables for Cgo
ENV CGO_ENABLED=1
ENV GOOS=linux
ENV GOARCH=amd64

# Copy the Go source code into the container
COPY . .

# Initialize Go modules and install dependencies
RUN go mod tidy

# Build the Go application with Cgo enabled
RUN go build -o app .

# Set the command to run the app
CMD ["./app"]
