#!/usr/bin/env node
const fs = require('fs');

module.exports = class Tools {
	
	static parseArgs(argv) {
		console.log(argv);
	}

	/**
	 * Retrieve a list of files from given directory.
	 * 
	 * @static
	 * @param {string} dir Directory path.
	 * @returns {array} List of files in directory.
	 */
	static getFilesFromDir(dir) {
		return new Promise((resolve, reject) => {
			fs.readdir(dir, (error, files) => {
				
				if(error) {
					reject(error);
				}

				resolve(files);
			})
		});
	}


	/**
	 * Takes a list of files and removes those without 
	 * an image file ending. Only keeps jpgeg's and png's.
	 * 
	 * @static
	 * @param {array} files A list of files.
	 * @returns {array} A list of images.
	 */
	static filterImages(files) {
		return files.filter(file => file.match(/[^\.].+\.(jpg|jpeg|png)/))
	}


	/**
	 * Takes a filename, including path, and returns file ending.
	 * 
	 * @static
	 * @param {string} fileName 
	 * @returns {string}
	 */
	static getFormat(fileName) {
		const match = fileName.match(/[^\.].+\.(.+)/);
		let ending = match ? match[1] : null;

		if(ending === 'jpeg') return 'jpg';

		return ending;
	}


	/**
	 * Generate a file name.
	 * 
	 * @static
	 * @param {any} imageName Current file name.
	 * @param {any} type Type of naming convention.
	 * @param {any} index Current image in list.
	 * @param {any} ending 
	 * @returns 
	 */
	static createName(imageName, type, index) {
		switch(type) {
			case 'same':
				return imageName;
			case 'slug':
				return imageName; // TODO
			case 'numerical':
				return Tools.pad(index, 3) + '.' + Tools.getFormat(imageName);
		}
	}


	/**
	 * Takes a number and padding size and returns
	 * a padded string version of that number.
	 * 
	 * @static
	 * @param {number} num Number to pad.
	 * @param {number} [size=2] Max number of preceding zeros.
	 * @returns 
	 */
	static pad(num, size = 2) {
		const n = num.toString();
		const amnt = size - (n.length - 1);
		let padding = '';
		
		while(padding.length < amnt) {
			padding += '0';
		}

		return padding + num;
	}


	/**
	 * If given string does not have a slash at the end, 
	 * this function will add one.
	 * 
	 * @static
	 * @param {string} path A string potentially missing a slash.
	 * @returns {string} A string not missing a slash.
	 */
	static addTrailingSlash(path) {
		const char = path.charAt(path.length - 1);

		if(char !== '/') {
			return path + '/'
		}

		if(!char || path === ' ') {
			return './'
		}

		return path;
	}

	/**
	 * Write given content to file.
	 * 
	 * @static
	 * @param {any} file Path to file.
	 * @param {any} content Content of file.
	 * @returns {Promise}
	 */
	static write(file, content) {
		return new Promise((resolve, reject) => {
			fs.writeFile(file, content, (err) => {
				if (err) reject(err);
				resolve();
			});
		});
	}

	static collectImageMetadata(imageData) {
		return new Promise(resolve => {
			const metadata = [];
			imageData.map(data => {
				data.transform.then(r => {
					metadata.push({
						name: data.file,
						width: r.width,
						height: r.height,
						size: r.size,
					});

					if(metadata.length === imageData.length) {
						resolve(metadata);
					}
				})
			})
		})
	}
	
	/**
	 * A Promisified mkdirp implementation. Will create 
	 * all directories in given path that doesn't already exist.
	 * 
	 * @static
	 * @param {any} path Path to directory
	 * @returns {Promise}
	 */
	static mkdirp(path) {
		return new Promise((resolve, reject) => {
			Tools.createNext(path.split('/'), '', resolve);
		})
	}

	/**
	 * Recursive function that creates directories. Used by mkdirp.
	 * 
	 * @private
	 * @static
	 * @param {any} dirs 
	 * @param {string} [built=''] 
	 * @param {any} resolve 
	 * @returns 
	 */
	static createNext(dirs, built = '', resolve) {
		
		if(typeof dirs !== 'object' || !dirs.length || typeof built !== 'string') {
			return 'Break!';
		}

		const next = dirs.shift();

		fs.readdir(built + next, err => {
			if(err) {
				fs.mkdir(built + next, mkdirError => {
					if(mkdirError) {
						// ?
					}

					if(dirs.length) {
						Tools.createNext(
							dirs,
							built + next + '/', 
							resolve
						);
					} else {
						resolve(built + next);
					}
				});

			} else {
				if(dirs.length) {
					Tools.createNext(
						dirs,
						built + next + '/', 
						resolve
					);
				} else {
					resolve(built + next);
				}
			}
		});
	}
}
