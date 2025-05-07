FROM debian:latest

# Install dependencies (combine steps)
RUN apt-get update && apt-get install -y \
  build-essential \
  openssl \
  libxml2-dev \
  libncurses5-dev \
  uuid-dev \
  sqlite3 \
  libsqlite3-dev \
  pkg-config \
  curl \
  libjansson-dev \
  libedit-dev \
  libxslt1-dev \
  subversion \
  wget \
  sox \
  && apt-get clean

# Download and extract Asterisk source
RUN curl -sL http://downloads.asterisk.org/pub/telephony/asterisk/releases/asterisk-14.0.0-rc1.tar.gz | tar xz

WORKDIR /asterisk-14.0.0-rc1

# Build and install Asterisk
RUN ./configure && make && make install && make samples

# Clean up if there is any existing directory
RUN rm -rf /etc/asterisk/ari.conf

# Add custom configuration files
COPY http.conf /etc/asterisk/http.conf
COPY ari.conf /etc/asterisk/ari.conf
COPY extensions.conf /etc/asterisk/extensions.conf
COPY bienvenida.ulaw /var/lib/asterisk/sounds/

# Optional: prevent Music On Hold warning
RUN mkdir -p /var/lib/asterisk/moh
RUN echo -e "[general]\ndirectory=/var/lib/asterisk/moh" > /etc/asterisk/musiconhold.conf

CMD ["/usr/sbin/asterisk", "-f"]
