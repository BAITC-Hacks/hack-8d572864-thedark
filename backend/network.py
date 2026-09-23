"""Discover private IPv4 interfaces for a local-network development server."""
import ipaddress
import socket
import os
import re


def lan_addresses():
    try:
        candidates = {entry[4][0] for entry in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET)}
    except OSError:
        candidates = set()
    networks = [ipaddress.ip_network(block) for block in ('10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16')]
    return sorted(address for address in candidates if any(ipaddress.ip_address(address) in network for network in networks))


TRUSTED_HOSTS = {'127.0.0.1', 'localhost', *lan_addresses()}
ALLOWED_ORIGINS = {f'http://{host}:{port}' for host in TRUSTED_HOSTS for port in (8000, 5173)}

# Hosting supplies its own hostname; never trust an arbitrary request's Host value.
for configured_host in [os.getenv('RENDER_EXTERNAL_HOSTNAME', ''), os.getenv('PUBLIC_HOST', '')]:
    host = configured_host.strip().lower()
    if host and re.fullmatch(r'[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?', host):
        TRUSTED_HOSTS.add(host)
        ALLOWED_ORIGINS.add(f'https://{host}')
        ALLOWED_ORIGINS.add(f'http://{host}')
