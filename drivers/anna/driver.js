"use strict";

var PlugwiseAPI = require('plugwise');
var Anna = require('plugwise-anna');
const Homey = require('homey');

var devices = [];

class AnnaDriver extends Homey.Driver {
	/*
	module.exports.init = function (devices_data, callback) {

		let count = 0;

		// No devices, driver init is finished
		if (devices_data.length === 0) callback(null, true);

		// Loop over installed devices
		for (let i in devices_data) {

			// Set as default offline
			module.exports.setUnavailable(devices_data[i], "Offline");

			// Refresh client
			devices_data[i].client = new Anna(devices_data[i].password, devices_data[i].ip, devices_data[i].id, devices_data[i].hostname, () => {
				count++;
				if (count === devices_data.length) {
					console.log('Anna: driver done');
					callback(null, true);
				}
			});

			// Store device
			devices.push({ data: devices_data[i] });

			// Start listening for device events
			listenForEvents(devices_data[i]);
		}
	};
	*/

	// this method is called when the Device is inited
	onInit() {
		let count = 0;

		let devices_data = this.getDevices();

		// No devices, driver init is finished
		if (devices_data.length === 0) callback(null, true);

		// Loop over installed devices
		for (let i in devices_data) {

			// Set as default offline
			this.setUnavailable(devices_data[i], "Offline");

			// Refresh client
			devices_data[i].client = new Anna(devices_data[i].password, devices_data[i].ip, devices_data[i].id, devices_data[i].hostname, () => {
				count++;
				if (count === devices_data.length) {
					console.log('Anna: driver done');
					callback(null, true);
				}
			});

			// Store device
			devices.push({
				data: devices_data[i]
			});
			this.log('init', devices_data[i]);
			this.log(this._listenForEvents());
			// Start listening for device events
			this.getDevice(devices_data[i])._listenForEvents(devices_data[i]);
		}
		return true
	}

	onPair(socket) {
		// module.exports.pair = function (socket) {

		socket.on("list_devices", function (data, callback) {

			// Perform local device discovery for smile devices
			PlugwiseAPI.discoverDevices('smile').then(data => {

				// Create devices response object
				var results = [];
				for (let i in data) {

					// Check if device is already added
					if (!devices.find((device) => device.data.hostname === data[i].host)) {

						results.push({
							data: {
								id: data[i].host,
								ip: data[i].addresses[0],
								hostname: data[i].host,
								name: 'smile'
							},
							name: data[i].host
						});
					}
				}

				console.log(`Anna: list ${results.length} devices`);

				if (results.length > 0) {

					// Return response
					callback(null, results);
				}
				else {

					// Return response
					callback(__('pair.error'), []);
				}
			});
		});

		socket.on("connect", function (device, callback) {

			console.log("Anna: fetch data from Plugwise API...");

			// Fetch new data from plugwise api
			PlugwiseAPI.fetchData(device).then(devices_data => {
				for (let i in devices_data) {
					if (devices_data[i].type === "thermostat") {

						console.log("Anna: connect to device at " + device.ip);

						var formatted_device = {
							name: "Anna",
							data: {
								ip: device.ip,
								id: devices_data[i].id,
								hostname: device.hostname,
								password: device.password
							}
						};

						// Start listening for device events
						// this._listenForEvents(formatted_device.data);

						// Callback device
						callback(null, formatted_device);

						// Add device to internal list
						devices.push({
							name: "Anna",
							data: {
								ip: device.ip,
								id: devices_data[i].id,
								hostname: device.hostname,
								password: device.password,
								onoff: devices_data[i].onoff,
								target_temperature: devices_data[i].target_temperature,
								measure_temperature: devices_data[i].measure_temperature,
								name: 'smile',
								client: new Anna(device.password, device.ip, devices_data[i].id, device.hostname)
							}
						});
					}
				}
			}).catch(err => {

				console.log("Anna: connect error: " + err);

				// Callback error
				callback(err, false);
			});
		});
	};

	onInit() {


	}

}

module.exports = AnnaDriver;
/*
module.exports.added = function (device_data) {

	// Start listening for events
	listenForEvents(getDevice(device_data.id));
};

module.exports.deleted = function (device_data) {

	// Get device
	var device = getDevice(device_data.id);
	if (device && device.client) {

		// Stop polling
		device.client.remove();

	}

	// Remove device from internal list
	for (var i in devices) {
		if (devices[i].data.id === device_data.id) {
			devices.splice(i, 1);
		}
	}
};
*/

/*
function getDevice(device_id) {
	var found = devices.filter(function (x) {
		return x.data.id === device_id
	});

	if (found.length >= 0 && found[0].data) {
		return found[0].data;
	}
	else {
		return new Error("invalid_device");
	}
}
*/