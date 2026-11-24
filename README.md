# MTG Tournament Organizer

Organize Magic The Gathering, MTG, tournaments and keep track of the results.

To run

`docker compose up -d`

It is served at `https://mtg.berv.us` by the shared Caddy edge proxy ([berv63/caddy](https://github.com/berv63/caddy)), which must be running first because it creates the `caddy` network. The container publishes no ports of its own.

After changing `docker-compose.yml` volumes, recreate it with `docker compose down; docker compose up -d` (a plain `up -d` can keep the old mounts).

## Usage

- Set up the number of players

- Input the names

- Click start

- Input the results on the table

- Results will update automatically.

## Rules

According to WOC winner takes 3 points and loser 0 points.

In case of a draw both get 1 point.

- [rules - WOC](https://www.wizards.com/ContentResources/Wizards/WPN/Main/Documents/Magic_The_Gathering_Tournament_Rules_PDF1.pdf) - Appendix C

## TODO

- More tournament modalities

- Make it prettier.