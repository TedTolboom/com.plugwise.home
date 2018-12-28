"use strict";

var PlugwiseAPI = require('plugwise');
var Anna = require('plugwise-anna');
const Homey = require('homey');

var devices = [];

class MyDevice extends Homey.Device {

	// this method is called when the Device is added
	onAdded(device_data) {
		this.log('device added');
		this.log(this._listenForEvents());

		// Start listening for events
		this._listenForEvents(this.getDevice(device_data.id));
	}
	// this method is called when the Device is deleted
	onDeleted(device_data) {
		this.log('device deleted');

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
	}

	_listenForEvents(device_data) {
		if (device_data && device_data.client) {

			var debouncers = {
				"target_temperature": null,
				"measure_temperature": null
			};

			var device_data_obj = {
				ip: device_data.ip,
				id: device_data.id,
				hostname: device_data.hostname,
				password: device_data.password
			};

			device_data.client.on("available", device_data => {
				//	device_data.client.on("available", function (device_data) {

				console.log("Anna: mark device as available: " + device_data.ip);

				// Mark as available
				this.setAvailable(device_data_obj);

			}).on("unavailable", device_data => { //on("unavailable", function (device_data) {

				console.log("Anna: mark device as unavailable: " + device_data.ip);

				// Mark device as unavailable
				this.setUnavailable(device_data_obj, __('pair.auth.smile.unavailable'));

			}).on("target_temperature", device_data => { //on("target_temperature", function (device_data, temperature) {

				// If debouncer present, reset it
				if (debouncers["target_temperature"]) {
					debouncers["target_temperature"] = clearTimeout(debouncers["target_temperature"]);
				}

				// Set debouncer
				debouncers["target_temperature"] = setTimeout(() => {

					console.log("Anna: emit realtime target temperature update: " + temperature);

					// Emit realtime
					//module.exports.realtime(device_data_obj, "target_temperature", temperature);
					this.setCapabilityValue("target_temperature", temperature);
				}, 500);

			}).on("measure_temperature", device_data => { //.on("measure_temperature", function (device_data, temperature) {

				// If debouncer present, reset it
				if (debouncers["measure_temperature"]) {
					debouncers["measure_temperature"] = clearTimeout(debouncers["measure_temperature"]);
				}

				// Set debouncer
				debouncers["measure_temperature"] = setTimeout(() => {

					console.log("Anna: emit realtime measure temperature update: " + temperature);

					// Emit realtime
					// module.exports.realtime(device_data_obj, "measure_temperature", temperature);
					this.setCapabilityValue("measure_temperature", temperature);
				}, 500);
			});
		}
		return true;
	}

	_onCapabilitiesTargetTemperatureGet(device_data, callback) {
		if (!device_data) callback(true, null);

		// Get device
		var device = getDevice(device_data.id);
		if (device && device.client && device.client.target_temperature) {

			// Callback formatted value
			callback(null, device.client.target_temperature);
		}
		else {
			callback(true, false);
		}
	}

	_onCapabilitiesTargetTemperatureSet(device_data, target_temperature, callback) {
		if (!device_data) callback(true, null);

		var device = getDevice(device_data.id);
		if (device && device.client && typeof device.client.setTarget == "function") {

			// Set target temperature on device
			device.client.setTarget(target_temperature, function (err, result) {

				// Callback result
				callback(err, result);
			});
		}
		else {
			callback(true, false);
		}
	}

	_onCapabilitiesTargetTemperatureGet(device_data, callback) {
		if (!device_data) callback(true, null);

		// Get device
		var device = getDevice(device_data.id);
		if (device && device.client && device.client.measure_temperature) {

			// Callback formatted value
			callback(null, device.client.measure_temperature);
		}
		else {
			callback(true, false);
		}
	}
}

module.exports = MyDevice;