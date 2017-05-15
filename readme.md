# batch-crop

A cli tool to resize and/or crop all images in a given folder and generate a json file with all image names, and their dimensions, filesizes etc.

Uses [sharp](http://sharp.dimens.io/en/stable/install/) for image editing, so it shouldn't require any external dependencies.

## Installation

`npm i batch-crop -g`

## Usage

Will start an interactive prompt if called without required arguments.

`batch-crop`

or

`batch-crop -i ./images -o ./resized-images -w 256 -h 256`

Possible arguments are:

#### input 
##### `-i ./images` 
Path to folder with images.

#### output 
##### `-o ./resized-images`
Path to folder where new images are saved. Will be created if it doesn't exist.

#### width 
##### `-w 256`
Max width of image.

#### height 
##### `-h 256`
Max height of image.

#### cropping 
##### `-c false`
Cropping - true or false. 
Default is true.

#### naming 
##### `-n numerical`
Naming convention. Can be `same` or `numerical`. 
Default is `same`.

#### createJson 
##### `-j`
Create JSON with image data. 
Default is false.

#### forceInteractive 
##### `-f`
Force interactive prompt even if arguments has been supplied in command line. 
Default is false.