'use strict';

const Homey = require('homey');

module.exports = class PlugwiseHomeApp extends Homey.App {
	onInit() {
		this.log(`${Homey.manifest.id} running...`);
	}
};