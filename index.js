#!/usr/bin/env node
const Tools = require('./tools');
const inquirer = require('inquirer');
const sharp = require('sharp');
const commandLineArgs = require('command-line-args');

// Options to check for
const options = {
	input: { name: 'input' },
	output: { name: 'output' },
	width: { name: 'width' },
	height: { name: 'height' },
	cropping: { name: 'cropping', default: true },
	naming: { name: 'naming', default: 'same' },
	createJson: { name: 'createJson', default: false }
}

// argOptions will be populated with command line arguments.
const argOptions = commandLineArgs([
	{ alias: 'i', type: String, name: options.input.name },
	{ alias: 'o', type: String, name: options.output.name },
	{ alias: 'w', type: String, name: options.width.name },
	{ alias: 'h', type: String, name: options.height.name },
	{ alias: 'c', type: Boolean, name: options.cropping.name, defaultValue: options.cropping.default },
	{ alias: 'n', type: String, name: options.naming.name, defaultValue: options.naming.default },
	{ alias: 'j', type: Boolean, name: options.createJson.name, defaultValue: options.createJson.default },
	{ alias: 'f', type: Boolean, name: 'forceInteractive', defaultValue: false }
]);

// Skip interactive prompt if this is empty, unless "forceInteractive" flag is set.
const missingRequiredArgs = Object.keys(options).filter(key => {
	const option = options[key];
	 return typeof argOptions[key] === 'undefined' && 
	 		typeof option.default === 'undefined';
});


/**
 * Returns true if given option name should be shown in interactive prompt.
 * 
 * @param {string} name 
 * @returns {boolean}
 */
function showWhen(name) {
	return 	argOptions['forceInteractive'] || 
			missingRequiredArgs.indexOf(name) !== -1;
}

/**
 * Starts the interactive prompt.
 * 
 * @returns {Promise}
 */
function startInteractivePrompt() {
	return inquirer.prompt([
		{
			type: 'input',
			name: options.input.name,
			message: 'Where are the images?',
			when: () => ( showWhen(options.input.name) ),
			validate: input => { return !!input || 'Can not be empty!'; }
		},
		{
			type: 'input',
			name: options.output.name,
			message: 'Where should the images be saved?',
			when: () => ( showWhen(options.output.name) ),
			validate: input => { return !!input || 'Can not be empty!'; }
		},
		{
			type: 'input',
			name: options.width.name,
			message: 'Max width of image',
			when: () => ( showWhen(options.width.name) ),
			validate: input => { return !!input || 'Can not be empty!'; }
		},
		{
			type: 'input',
			name: options.height.name,
			message: 'Max height of image',
			when: () => ( showWhen(options.height.name) ),
			validate: input => { return !!input || 'Can not be empty!'; }
		},
		{
			type: 'confirm',
			name: options.cropping.name,
			message: 'Should the images be cropped?',
			default: options.cropping.default
		},
		{
			type: 'list',
			name: options.naming.name,
			message: 'How should output images be named?',
			choices: [
				{
					name: 'Same as input',
					value: 'same'
				},
				// {
				// 	name: 'Slugified input',
				// 	value: 'slug' // TODO: add this
				// },
				{
					name: 'Numerical ("001.jpg" etc.)',
					value: 'numerical'
				}
			],
			default: options.naming.default
		},
		{
			type: 'confirm',
			name: options.createJson.name,
			message: 'Should a json with image data be generated?',
			default: options.createJson.default
		}
	])
}


/**
 * Make sure some answers have standardised format.
 * 
 * @param {object} answers 
 * @returns {object}
 */
function normaliseAnswers(answers) {
	return Object.assign(
		answers, {
			input: Tools.addTrailingSlash(answers.input),
			output: Tools.addTrailingSlash(answers.output),
			width: +answers.width,
			height: +answers.height,
		}
	)
}

/**
 * Will either use cli arguments or start interactive prompt if any are missing.
 * 
 * @returns {Promise}
 */
function start() {
	if(	missingRequiredArgs.length || 
		argOptions['forceInteractive']) {

		return startInteractivePrompt();

	} else {

		return new Promise(resolve => {
			resolve(argOptions);
		});
	}
}


// ------------------------------------------------------
// Start
// ------------------------------------------------------

start()
.then(normaliseAnswers)
.then(answers => {

	const { input, width, height, output, naming, cropping, createJson } = answers;
	
	return Tools.getFilesFromDir(input)
		.then(Tools.filterImages)
		.then(images => Tools.mkdirp(output)
			.then(() => images)
		)
		.then(images => (
			images.map((image, i) => {

				let outputName = Tools.createName(
					image, naming, i
				);

				let transform = sharp(input + image).resize(width, height).max();
				
				if(cropping) {
					transform = transform.crop(sharp.strategy.entropy);
				}

				return {
					transform: transform.toFile(output + outputName),
					dir: output,
					file: outputName
				};
			})
		))
		.then(data => createJson ? Tools.collectImageMetadata(data) : null)
		.then(meta => createJson ? Tools.write(output + 'images.json', JSON.stringify(meta)) : null)
		.then(() => { console.log('Done!'); })
		.catch(e => {
			console.error(e);
		})
})
.catch(error => {
	console.log(error);
});
