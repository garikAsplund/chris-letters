export function getScreenRefreshRate(callback, runIndefinitely) {
	let requestId = null;
	let callbackTriggered = false;
	runIndefinitely = runIndefinitely || false;

	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame =
			window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;
	}

	const DOMHighResTimeStampCollection = [];

	const triggerAnimation = (DOMHighResTimeStamp) => {
		DOMHighResTimeStampCollection.unshift(DOMHighResTimeStamp);

		if (DOMHighResTimeStampCollection.length > 10) {
			const t0 = DOMHighResTimeStampCollection.pop();
			const fps = Math.floor((1000 * 10) / (DOMHighResTimeStamp - t0));

			if (!callbackTriggered) {
				callback.call(undefined, fps, DOMHighResTimeStampCollection);
			}

			if (runIndefinitely) {
				callbackTriggered = false;
			} else {
				callbackTriggered = true;
			}
		}

		requestId = window.requestAnimationFrame(triggerAnimation);
	};

	window.requestAnimationFrame(triggerAnimation);

	if (!runIndefinitely) {
		window.setTimeout(() => {
			window.cancelAnimationFrame(requestId);
			requestId = null;
		}, 1500);
	}
}
