# Readme

Ansible playbook to deploy [RSSHub](https://github.com/DIYgod/RSSHub) on bare-metal with Redis, browserless and Caddy 2

Requires sudo permission

## Usage

On `Ubuntu 26.04`, run `sudo apt install ansible`, then

```bash
sudo ansible-playbook rsshub.yaml
```

## Development

Install `vagrant`, then

```bash
./try.sh
ansible-playbook rsshub.yaml
```
