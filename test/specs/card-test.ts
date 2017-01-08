declare let describe : any;
declare let it : any;
import { expect } from 'chai';

describe('card', () => {
	it('should fail when you force it to fail', () => {
		expect(false).to.eql(false);
	});
});