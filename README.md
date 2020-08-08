This is Menutify, this projects enables you to upload a pdf and you will 
get that transform to images.

## Installation

### Local
You run this project just by running `yarn` and `yarn dev`. The application
will start in port `3000`.

By default it targets `http://localhost:3000` but you can change this value
with the env variable `HOST`. Ejm (`HOST=https://menutify.io`);

This project uses `pdfinfo` and `imagemagick` to perform the transformations
you need to have them on your system for the program to work.

### Docker

You can also run as a docker container. Just run `docker-compose up` and
the image will already contain `imagemagick` and `pdfinfo` installed.

You can update the `docker-compose.yml` file and set the `HOST` variable the 
assets target the correct  domain.