const expect = require('chai').expect;
const Tools = require('./tools');

describe('Tools', () => {
	describe('#pad()', () => {
		it('pad(1, 2) should pad 1 with two zeros', () => {
			expect(Tools.pad(1, 2)).equal('001');
		});

		it('pad(50, 4) should pad 50 with 3 zeros', () => {
			expect(Tools.pad(50, 4)).equal('00050');
		});

		it('pad(2048, 2) should not pad', () => {
			expect(Tools.pad(2048, 2)).equal('2048');
		});
	});

	describe('#mkdirp()', () => {
		it('should create directory', (done) => {

			Tools.mkdirp('./test/dir')
				.then(dirs => {
					expect(dirs).equal('./test/dir');
					done();
				})
				.catch(done);
		});
	});
});